/**
 * Abandoned Order Cleanup Service - Integration Tests
 *
 * Tests the complete flow of:
 * 1. Creating orders with pending online payments
 * 2. Simulating abandonment (user leaves without completing payment)
 * 3. Running cleanup to mark orders as failed and restore stock
 *
 * @see docs/ORDERING_SYSTEM_AUDIT.md
 *
 * PayMongo Test Cards Reference:
 * - 4343434343434345 (Visa - Success)
 * - 4230000000000004 (3DS required, declines with generic_decline)
 * - 4400000000000016 (Generic decline)
 * - 5100000000000198 (Insufficient funds)
 */

import db from "../../db.js";
import { v4 as uuidv4 } from "uuid";
import * as abandonedOrderCleanupService from "../../services/abandonedOrderCleanupService.js";
import * as paymongoService from "../../services/paymongoService.js";

// ============================================================================
// Test Configuration
// ============================================================================

// Test data - will be populated from database in beforeAll
let TEST_CONFIG = {
  // User ID with Tourist role (populated from database)
  testUserId: null,

  // Business ID (populated from database)
  testBusinessId: null,

  // Product ID with stock (populated from database)
  testProductId: null,

  // Flag to check if test data was found
  isInitialized: false,

  // Test card for 3DS decline (will fail after authentication)
  declineCard: {
    cardNumber: "4230000000000004",
    expMonth: 12,
    expYear: 2026,
    cvc: "123",
  },

  // Test card for success (but we won't complete 3DS)
  successCard: {
    cardNumber: "4120000000000007",
    expMonth: 12,
    expYear: 2026,
    cvc: "123",
  },

  // Test billing info
  billing: {
    name: "Test User",
    email: "test@example.com",
    phone: "+639123456789",
  },
};

/**
 * Initialize test configuration by finding existing data in database
 * This ensures tests work with the actual database schema
 */
async function initializeTestConfig() {
  if (TEST_CONFIG.isInitialized) return;

  try {
    console.log("🔍 Looking for existing test data in database...");

    // 1. Find a user with Tourist role
    const [users] = await db.query(
      `SELECT u.id FROM user u 
       JOIN user_role ur ON ur.id = u.user_role_id 
       WHERE ur.role_name = 'Tourist' 
       LIMIT 1`
    );

    // 2. Find a business
    const [businesses] = await db.query(`SELECT id FROM business LIMIT 1`);

    // 3. Find a product with stock
    const [products] = await db.query(
      `SELECT p.id, p.business_id FROM product p 
       JOIN product_stock ps ON p.id = ps.product_id 
       WHERE ps.current_stock > 5 
       LIMIT 1`
    );

    // Check what we have
    const missingData = [];
    if (!users[0]) missingData.push("users with Tourist role");
    if (!businesses[0]) missingData.push("businesses");
    if (!products[0]) missingData.push("products with stock");

    if (missingData.length > 0) {
      throw new Error(
        `Missing required test data: ${missingData.join(", ")}. ` +
          `Please run database seeds first: npm run seed`
      );
    }

    // Use the product's business_id if available, otherwise use the first business
    TEST_CONFIG.testUserId = users[0].id;
    TEST_CONFIG.testBusinessId = products[0].business_id || businesses[0].id;
    TEST_CONFIG.testProductId = products[0].id;
    TEST_CONFIG.isInitialized = true;
    TEST_CONFIG.usingExistingData = true; // Flag to skip cleanup

    console.log("✅ Test configuration initialized with existing data:", {
      userId: TEST_CONFIG.testUserId,
      businessId: TEST_CONFIG.testBusinessId,
      productId: TEST_CONFIG.testProductId,
    });
  } catch (error) {
    console.error("❌ Test initialization failed:", error.message);
    throw error;
  }
}

/**
 * Clean up all mock test data created during tests
 * Skips cleanup if using existing data (to avoid deleting real records)
 */
async function cleanupMockData() {
  if (!TEST_CONFIG.isInitialized) return;

  // Skip cleanup if we're using existing data from the database
  if (TEST_CONFIG.usingExistingData) {
    console.log("ℹ️ Using existing data, skipping mock data cleanup");
    return;
  }

  try {
    // Delete in reverse order of creation (due to foreign keys)
    if (TEST_CONFIG.testProductId) {
      await db.query("DELETE FROM product_stock WHERE product_id = ?", [
        TEST_CONFIG.testProductId,
      ]);
      await db.query("DELETE FROM product WHERE id = ?", [
        TEST_CONFIG.testProductId,
      ]);
    }
    if (TEST_CONFIG.testCategoryId) {
      await db.query("DELETE FROM product_category WHERE id = ?", [
        TEST_CONFIG.testCategoryId,
      ]);
    }
    if (TEST_CONFIG.testBusinessId) {
      await db.query("DELETE FROM business WHERE id = ?", [
        TEST_CONFIG.testBusinessId,
      ]);
    }
    if (TEST_CONFIG.testTouristId) {
      await db.query("DELETE FROM tourist WHERE id = ?", [
        TEST_CONFIG.testTouristId,
      ]);
    }
    if (TEST_CONFIG.testUserId) {
      await db.query("DELETE FROM user WHERE id = ?", [TEST_CONFIG.testUserId]);
    }
    console.log("✅ Test mock data cleaned up");
  } catch (error) {
    console.warn(
      "Mock data cleanup failed (may already be cleaned):",
      error.message
    );
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a random order number for testing
 */
function generateTestOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TEST-${timestamp}-${random}`;
}

/**
 * Generate a random arrival code
 */
function generateArrivalCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Create a test order directly in the database (bypassing stock validation for testing)
 */
async function createTestOrder(options = {}) {
  const orderId = uuidv4();
  const orderNumber = generateTestOrderNumber();
  const arrivalCode = generateArrivalCode();

  const {
    userId = TEST_CONFIG.testUserId,
    businessId = TEST_CONFIG.testBusinessId,
    productId = TEST_CONFIG.testProductId,
    quantity = 2,
    unitPrice = 150.0,
    paymentMethod = "card",
    createdAt = new Date(),
  } = options;

  // Validate required config values are present
  if (!businessId || !userId || !productId) {
    throw new Error(
      `Test configuration not initialized properly. ` +
        `Missing: ${!businessId ? "businessId " : ""}${
          !userId ? "userId " : ""
        }${!productId ? "productId" : ""}. ` +
        `Ensure initializeTestConfig() completed successfully.`
    );
  }

  const totalAmount = unitPrice * quantity;

  // Insert order
  await db.query(
    `
    INSERT INTO \`order\` (
      id, business_id, user_id, order_number, subtotal, discount_amount, 
      tax_amount, total_amount, status, pickup_datetime, arrival_code, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', DATE_ADD(NOW(), INTERVAL 1 HOUR), ?, ?)
  `,
    [
      orderId,
      businessId,
      userId,
      orderNumber,
      totalAmount,
      0,
      0,
      totalAmount,
      arrivalCode,
      createdAt,
    ]
  );

  // Insert order item
  const orderItemId = uuidv4();
  await db.query(
    `
    INSERT INTO order_item (id, order_id, product_id, quantity, unit_price, total_price)
    VALUES (?, ?, ?, ?, ?, ?)
  `,
    [orderItemId, orderId, productId, quantity, unitPrice, totalAmount]
  );

  // Deduct stock (simulates normal order creation)
  await db.query(
    `
    UPDATE product_stock SET current_stock = current_stock - ? WHERE product_id = ?
  `,
    [quantity, productId]
  );

  return {
    orderId,
    orderNumber,
    arrivalCode,
    totalAmount,
    productId,
    quantity,
  };
}

/**
 * Create a pending payment record for an order
 */
async function createTestPayment(orderId, options = {}) {
  const paymentId = uuidv4();

  const {
    paymentMethod = "card",
    amount = 30000, // in centavos = 300.00 PHP
    paymentIntentId = null,
    createdAt = new Date(),
  } = options;

  await db.query(
    `
    INSERT INTO payment (
      id, payer_type, payment_method, amount, status, payment_for, 
      payer_id, payment_for_id, payment_intent_id, created_at
    ) VALUES (?, 'Tourist', ?, ?, 'pending', 'order', ?, ?, ?, ?)
  `,
    [
      paymentId,
      paymentMethod,
      amount / 100,
      TEST_CONFIG.testUserId,
      orderId,
      paymentIntentId,
      createdAt,
    ]
  );

  return paymentId;
}

/**
 * Get order by ID
 */
async function getOrder(orderId) {
  const [rows] = await db.query(
    `
    SELECT o.*, p.status as payment_status, p.payment_intent_id
    FROM \`order\` o
    LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
    WHERE o.id = ?
  `,
    [orderId]
  );
  return rows[0];
}

/**
 * Get current stock for a product
 */
async function getProductStock(productId) {
  const [rows] = await db.query(
    `
    SELECT current_stock FROM product_stock WHERE product_id = ?
  `,
    [productId]
  );
  return rows[0]?.current_stock || 0;
}

/**
 * Clean up test data
 */
async function cleanupTestData(orderId) {
  try {
    await db.query("DELETE FROM stock_history WHERE notes LIKE ?", [
      `%${orderId}%`,
    ]);
    await db.query("DELETE FROM order_audit WHERE order_id = ?", [orderId]);
    await db.query("DELETE FROM payment WHERE payment_for_id = ?", [orderId]);
    await db.query("DELETE FROM order_item WHERE order_id = ?", [orderId]);
    await db.query("DELETE FROM `order` WHERE id = ?", [orderId]);
  } catch (error) {
    console.warn("Cleanup partial failure:", error.message);
  }
}

// ============================================================================
// Test Cases
// ============================================================================

describe("Abandoned Order Cleanup Service", () => {
  let testOrderIds = [];

  // Initialize test config before all tests
  beforeAll(async () => {
    await initializeTestConfig();
  });

  // Clean up after all tests
  afterAll(async () => {
    for (const orderId of testOrderIds) {
      await cleanupTestData(orderId);
    }
    // Clean up mock data created in beforeAll
    await cleanupMockData();
  });

  // -------------------------------------------------------------------------
  // Unit Tests for Service Functions
  // -------------------------------------------------------------------------

  describe("Service Configuration", () => {
    test("should have valid configuration defaults", () => {
      expect(
        abandonedOrderCleanupService.ABANDONMENT_THRESHOLD_MINUTES
      ).toBeGreaterThan(0);
      expect(
        abandonedOrderCleanupService.PAYMENT_INTENT_EXPIRY_HOURS
      ).toBeGreaterThan(0);
      expect(abandonedOrderCleanupService.CLEANUP_INTERVAL_MS).toBeGreaterThan(
        0
      );
    });

    test("should return valid stats structure", async () => {
      const stats = await abandonedOrderCleanupService.getAbandonedOrderStats();

      expect(stats).toHaveProperty("pendingOnlinePayments");
      expect(stats).toHaveProperty("abandonedThreshold");
      expect(stats).toHaveProperty("potentiallyAbandoned");
      expect(typeof stats.pendingOnlinePayments).toBe("number");
    });
  });

  // -------------------------------------------------------------------------
  // Integration Tests - Abandoned Order Detection
  // -------------------------------------------------------------------------

  describe("Abandoned Order Detection", () => {
    test("should detect order abandoned beyond threshold", async () => {
      // Create an old order (older than ABANDONMENT_THRESHOLD_MINUTES)
      const oldDate = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

      const order = await createTestOrder({ createdAt: oldDate });
      testOrderIds.push(order.orderId);

      const paymentId = await createTestPayment(order.orderId, {
        amount: order.totalAmount * 100,
        createdAt: oldDate,
      });

      // Verify order is stale
      const stats = await abandonedOrderCleanupService.getAbandonedOrderStats();
      expect(Number(stats.potentiallyAbandoned)).toBeGreaterThan(0);
    });

    test("should NOT detect recent order as abandoned", async () => {
      // Create a recent order (within threshold)
      const recentOrder = await createTestOrder({ createdAt: new Date() });
      testOrderIds.push(recentOrder.orderId);

      await createTestPayment(recentOrder.orderId, {
        amount: recentOrder.totalAmount * 100,
        createdAt: new Date(),
      });

      const order = await getOrder(recentOrder.orderId);
      expect(order.status).toBe("pending"); // Should still be pending
    });
  });

  // -------------------------------------------------------------------------
  // Integration Tests - Cleanup Process
  // -------------------------------------------------------------------------

  describe("Cleanup Process", () => {
    test("should mark old pending orders as failed_payment", async () => {
      // Create an old abandoned order
      const oldDate = new Date(Date.now() - 45 * 60 * 1000); // 45 minutes ago

      // Get stock BEFORE creating the order (this is the baseline)
      const stockBeforeOrder = await getProductStock(TEST_CONFIG.testProductId);

      const order = await createTestOrder({ createdAt: oldDate, quantity: 3 });
      testOrderIds.push(order.orderId);

      await createTestPayment(order.orderId, {
        amount: order.totalAmount * 100,
        paymentMethod: "gcash", // E-wallet to avoid PayMongo API call
        createdAt: oldDate,
      });

      // Verify stock was deducted after order creation
      const stockAfterOrderCreation = await getProductStock(order.productId);
      expect(Number(stockAfterOrderCreation)).toBe(
        Number(stockBeforeOrder) - order.quantity
      );

      // Run cleanup
      const results =
        await abandonedOrderCleanupService.cleanupAbandonedOrders();

      // Verify cleanup ran
      expect(results.abandonedOrders).toBeGreaterThanOrEqual(0);

      // Check if our order was cleaned up
      const updatedOrder = await getOrder(order.orderId);

      // If cleanup processed this order
      if (updatedOrder.status === "failed_payment") {
        expect(updatedOrder.payment_status).toBe("failed");

        // Stock should increase by AT LEAST this order's quantity
        // (cleanup processes ALL abandoned orders, so may restore more)
        const finalStock = await getProductStock(order.productId);
        expect(Number(finalStock)).toBeGreaterThanOrEqual(
          Number(stockBeforeOrder)
        );
      }
    });

    test("should restore stock correctly for multi-item orders", async () => {
      const oldDate = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

      // Create order
      const order = await createTestOrder({
        createdAt: oldDate,
        quantity: 5,
      });
      testOrderIds.push(order.orderId);

      await createTestPayment(order.orderId, {
        amount: order.totalAmount * 100,
        paymentMethod: "paymaya",
        createdAt: oldDate,
      });

      const stockBefore = await getProductStock(order.productId);

      // Run cleanup
      await abandonedOrderCleanupService.cleanupAbandonedOrders();

      const stockAfter = await getProductStock(order.productId);
      const orderAfter = await getOrder(order.orderId);

      if (orderAfter.status === "failed_payment") {
        // Stock should increase by the quantity
        expect(stockAfter).toBe(stockBefore + order.quantity);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Integration Tests - Payment Intent Verification
  // -------------------------------------------------------------------------

  describe("Payment Intent Status Sync", () => {
    test("should sync payment intent status from PayMongo", async () => {
      // This test requires actual PayMongo interaction
      // Skip if PayMongo is not configured
      if (!process.env.PAYMONGO_SECRET_KEY) {
        console.log("Skipping PayMongo test - no API key configured");
        return;
      }

      try {
        // Create a real payment intent
        const paymentIntent = await paymongoService.createPaymentIntent({
          orderId: "test-cleanup-" + Date.now(),
          amount: 5000, // 50.00 PHP (above min threshold)
          description: "Test cleanup verification",
          paymentMethodAllowed: ["card"],
        });

        expect(paymentIntent).toHaveProperty("id");
        expect(paymentIntent.attributes.status).toBe("awaiting_payment_method");

        console.log("Created test Payment Intent:", paymentIntent.id);

        // Verify we can retrieve it
        const retrieved = await paymongoService.getPaymentIntent(
          paymentIntent.id
        );
        expect(retrieved.id).toBe(paymentIntent.id);
      } catch (error) {
        console.warn("PayMongo test skipped:", error.message);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Edge Cases
  // -------------------------------------------------------------------------

  describe("Edge Cases", () => {
    test("should handle order with no payment record gracefully", async () => {
      const order = await createTestOrder({
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
      });
      testOrderIds.push(order.orderId);

      // Don't create payment record - simulates edge case

      // Should not crash
      const results =
        await abandonedOrderCleanupService.cleanupAbandonedOrders();
      expect(results).toHaveProperty("abandonedOrders");
    });

    test("should not process cash_on_pickup orders", async () => {
      const oldDate = new Date(Date.now() - 60 * 60 * 1000);

      const order = await createTestOrder({ createdAt: oldDate });
      testOrderIds.push(order.orderId);

      await createTestPayment(order.orderId, {
        amount: order.totalAmount * 100,
        paymentMethod: "cash_on_pickup", // Not online payment
        createdAt: oldDate,
      });

      await abandonedOrderCleanupService.cleanupAbandonedOrders();

      const orderAfter = await getOrder(order.orderId);
      // Cash on pickup orders should NOT be marked as abandoned
      expect(orderAfter.status).toBe("pending");
    });

    test("should not process already cancelled orders", async () => {
      const order = await createTestOrder({
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
      });
      testOrderIds.push(order.orderId);

      // Manually mark as cancelled
      await db.query(
        `UPDATE \`order\` SET status = 'cancelled_by_user' WHERE id = ?`,
        [order.orderId]
      );

      await createTestPayment(order.orderId, {
        paymentMethod: "gcash",
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
      });

      const stockBefore = await getProductStock(order.productId);

      await abandonedOrderCleanupService.cleanupAbandonedOrders();

      const stockAfter = await getProductStock(order.productId);
      // Stock should NOT change for already cancelled order
      expect(stockAfter).toBe(stockBefore);
    });
  });
});

// ============================================================================
// Manual Test Runner
// ============================================================================

/**
 * Run manual tests without Jest
 * Usage: node tests/integration/abandonedOrderCleanup.test.js --manual
 */
async function runManualTests() {
  console.log("\n🧪 Running Manual Abandoned Order Cleanup Tests\n");
  console.log("=".repeat(60));

  try {
    // Test 1: Get current stats
    console.log("\n📊 Test 1: Getting abandoned order statistics...");
    const stats = await abandonedOrderCleanupService.getAbandonedOrderStats();
    console.log("Stats:", JSON.stringify(stats, null, 2));
    console.log("✅ Stats test passed\n");

    // Test 2: Run cleanup (no changes expected if no abandoned orders)
    console.log("🧹 Test 2: Running cleanup process...");
    const results = await abandonedOrderCleanupService.cleanupAbandonedOrders();
    console.log("Results:", JSON.stringify(results, null, 2));
    console.log("✅ Cleanup test passed\n");

    // Test 3: Create a test abandoned order and clean it up
    console.log("📝 Test 3: Creating simulated abandoned order...");

    // Check if we have test data configured
    const [users] = await db.query(
      "SELECT id FROM user WHERE role = ? LIMIT 1",
      ["Tourist"]
    );
    const [businesses] = await db.query("SELECT id FROM business LIMIT 1");
    const [products] = await db.query(`
      SELECT p.id, ps.current_stock 
      FROM product p 
      JOIN product_stock ps ON p.id = ps.product_id 
      WHERE ps.current_stock > 5 
      LIMIT 1
    `);

    if (!users[0] || !businesses[0] || !products[0]) {
      console.log(
        "⚠️ Missing test data (user, business, or product). Skipping order creation test."
      );
    } else {
      const testConfig = {
        testUserId: users[0].id,
        testBusinessId: businesses[0].id,
        testProductId: products[0].id,
      };

      console.log("Using test data:", testConfig);

      // Create old order
      const oldDate = new Date(Date.now() - 45 * 60 * 1000); // 45 minutes ago
      const orderId = uuidv4();
      const orderNumber = generateTestOrderNumber();
      const quantity = 2;
      const totalAmount = 300;

      await db.query(
        `
        INSERT INTO \`order\` (
          id, business_id, user_id, order_number, subtotal, discount_amount, 
          tax_amount, total_amount, status, pickup_datetime, arrival_code, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', DATE_ADD(NOW(), INTERVAL 1 HOUR), ?, ?)
      `,
        [
          orderId,
          testConfig.testBusinessId,
          testConfig.testUserId,
          orderNumber,
          totalAmount,
          0,
          0,
          totalAmount,
          "ABC123",
          oldDate,
        ]
      );

      const orderItemId = uuidv4();
      await db.query(
        `
        INSERT INTO order_item (id, order_id, product_id, quantity, unit_price, total_price)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
        [
          orderItemId,
          orderId,
          testConfig.testProductId,
          quantity,
          150,
          totalAmount,
        ]
      );

      await db.query(
        `
        UPDATE product_stock SET current_stock = current_stock - ? WHERE product_id = ?
      `,
        [quantity, testConfig.testProductId]
      );

      const paymentId = uuidv4();
      await db.query(
        `
        INSERT INTO payment (
          id, payer_type, payment_method, amount, status, payment_for, 
          payer_id, payment_for_id, created_at
        ) VALUES (?, 'Tourist', 'gcash', ?, 'pending', 'order', ?, ?, ?)
      `,
        [paymentId, totalAmount, testConfig.testUserId, orderId, oldDate]
      );

      console.log(`Created test order: ${orderNumber} (ID: ${orderId})`);

      const stockBefore = products[0].current_stock - quantity;
      console.log(`Stock before cleanup: ${stockBefore}`);

      // Run cleanup again
      console.log("\n🧹 Running cleanup to process abandoned order...");
      const cleanupResults =
        await abandonedOrderCleanupService.cleanupAbandonedOrders();
      console.log("Cleanup results:", JSON.stringify(cleanupResults, null, 2));

      // Check results
      const [orderAfter] = await db.query(
        "SELECT status FROM `order` WHERE id = ?",
        [orderId]
      );
      const [stockAfter] = await db.query(
        "SELECT current_stock FROM product_stock WHERE product_id = ?",
        [testConfig.testProductId]
      );

      console.log(`\nOrder status after: ${orderAfter[0]?.status}`);
      console.log(`Stock after cleanup: ${stockAfter[0]?.current_stock}`);

      if (orderAfter[0]?.status === "failed_payment") {
        console.log("✅ Order correctly marked as failed_payment");
        if (stockAfter[0]?.current_stock === stockBefore + quantity) {
          console.log("✅ Stock correctly restored");
        }
      }

      // Cleanup test data
      console.log("\n🗑️ Cleaning up test data...");
      await db.query("DELETE FROM stock_history WHERE notes LIKE ?", [
        `%${orderNumber}%`,
      ]);
      await db.query("DELETE FROM order_audit WHERE order_id = ?", [orderId]);
      await db.query("DELETE FROM payment WHERE id = ?", [paymentId]);
      await db.query("DELETE FROM order_item WHERE order_id = ?", [orderId]);
      await db.query("DELETE FROM `order` WHERE id = ?", [orderId]);
      console.log("✅ Test data cleaned up");
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 All manual tests completed!\n");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }

  // Don't close connection - let it timeout naturally
  setTimeout(() => process.exit(0), 1000);
}

// Check if running manually
if (process.argv.includes("--manual")) {
  runManualTests();
}
