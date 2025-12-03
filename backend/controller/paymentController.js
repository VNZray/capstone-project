import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../utils/errorHandler.js";
import * as paymongoService from "../services/paymongoService.js";
import * as socketService from "../services/socketService.js";
import * as notificationHelper from "../services/notificationHelper.js";
import * as auditService from "../services/auditService.js";
import { ensureUserRole, hasBusinessAccess } from "../utils/authHelpers.js";
import * as webhookQueueService from "../services/webhookQueueService.js";

// Environment configuration
const FRONTEND_BASE_URL = (process.env.FRONTEND_BASE_URL || "http://localhost:5173").replace(/\/$/, "");
const MOBILE_APP_SCHEME = process.env.MOBILE_APP_SCHEME || "cityventure";
const PAYMONGO_REDIRECT_BASE = (process.env.PAYMONGO_REDIRECT_BASE || FRONTEND_BASE_URL).trim();

const buildRedirectUrl = (path, useMobileScheme = false) => {
  // For mobile app, use deep link scheme instead of http/https
  if (useMobileScheme) {
    return `${MOBILE_APP_SCHEME}:/${path}`;
  }
  
  const sanitizedBase = PAYMONGO_REDIRECT_BASE.replace(/\/$/, "");
  if (!/^https?:\/\//i.test(sanitizedBase)) {
    console.warn(`[PayMongo] Redirect base must be http/https. Falling back to FRONTEND_BASE_URL. Provided: ${PAYMONGO_REDIRECT_BASE}`);
    return `${FRONTEND_BASE_URL}${path}`;
  }
  return `${sanitizedBase}${path}`;
};

// Get all payments
export async function getAllPayments(req, res) {
  try {
    const [data] = await db.query("CALL GetAllPayments()");
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get payment by payer ID
export async function getPaymentByPayerId(req, res) {
  const { payer_id } = req.params;
  try {
    const userRole = await ensureUserRole(req);
    if (userRole !== 'Admin' && req.user?.id !== payer_id) {
      return res.status(403).json({ message: "Forbidden: you can only view your own payments" });
    }

    const [data] = await db.query("CALL GetPaymentByPayerId(?)", [payer_id]);
    if (!data[0] || data[0].length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get payment by ID
export async function getPaymentById(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL GetPaymentById(?)", [id]);
    if (!data[0] || data[0].length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }
    
    const payment = data[0][0];
    
    // ========== Ownership Validation (Phase 4) ==========
    // Only allow access if user owns the related resource or is admin
    if (req.user) {
      const userId = req.user.id;
      const userRole = await ensureUserRole(req);
      
      if (userRole !== 'Admin') {
        // For tourists: must own the payment (payer_id match)
        if (userRole === 'Tourist' && payment.payer_id !== userId) {
          return res.status(403).json({ 
            message: "Forbidden: you can only view your own payments" 
          });
        }
        
        // For business owners/staff: verify they own the business
        if (['Owner', 'Staff'].includes(userRole) && payment.payment_for === 'order') {
          // Get order to check business ownership
          const [orderCheck] = await db.query(
            `SELECT b.owner_id FROM \`order\` o 
             JOIN business b ON b.id = o.business_id 
             WHERE o.id = ?`,
            [payment.payment_for_id]
          );
          
          if (!orderCheck || orderCheck.length === 0 || orderCheck[0].owner_id !== userId) {
            return res.status(403).json({ 
              message: "Forbidden: you do not have access to this payment" 
            });
          }
        }
      }
    }
    
    res.json(payment);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get payments by payment_for_id (booking id reference or subscription id reference)
export async function getPaymentByPaymentForId(req, res) {
  const { payment_for_id } = req.params;
  try {
    const [data] = await db.query("CALL GetPaymentByPaymentForId(?)", [payment_for_id]);
    if (!data[0] || data[0].length === 0) {
      return res.status(404).json({ message: "No payments found" });
    }
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get payments by business ID
export async function getPaymentByBusinessId(req, res) {
  try {
    const { business_id } = req.params;

    const userRole = await ensureUserRole(req);
    const allowed = await hasBusinessAccess(business_id, req.user, userRole);
    if (!allowed) {
      return res.status(403).json({
        message: "Forbidden: you do not have access to this business"
      });
    }

    const [rows] = await db.query("CALL GetPaymentsByBusinessId(?)", [
      business_id,
    ]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Insert a new payment
export async function insertPayment(req, res) {
  try {
    const id = uuidv4();
    const created_at = new Date();
    const {
      payer_type,
      payment_type,
      payment_method,
      amount,
      status,
      payment_for,
      payer_id,
      payment_for_id,
    } = req.body;

    // Basic validation
    const missing = [];
    if (!payer_type) missing.push("payer_type");
    if (!payment_method) missing.push("payment_method");
    if (amount === undefined) missing.push("amount");
    if (!payer_id) missing.push("payer_id");
    if (!payment_for_id) missing.push("payment_for_id");
    if (missing.length) {
      return res
        .status(400)
        .json({ error: "Missing required fields", fields: missing });
    }

    const params = [
      id,
      payer_type,
      payment_type ?? null,
      payment_method,
      amount,
      status ?? null,
      payment_for ?? null,
      payer_id,
      payment_for_id,
      created_at,
    ];

    const [result] = await db.query(
      `CALL InsertPayment(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params
    );

    res.status(201).json({
      message: "Payment created successfully",
      ...result[0][0],
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update payment
export async function updatePayment(req, res) {
  const { id } = req.params;
  try {
    const {
      payer_type,
      payment_type,
      payment_method,
      amount,
      status,
      payment_for,
      payer_id,
      payment_for_id,
    } = req.body;

    const params = [
      id,
      payer_type ?? null,
      payment_type ?? null,
      payment_method ?? null,
      amount ?? null,
      status ?? null,
      payment_for ?? null,
      payer_id ?? null,
      payment_for_id ?? null,
    ];

    const [result] = await db.query(
      `CALL UpdatePayment(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params
    );

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({
      message: "Payment updated successfully",
      ...result[0][0],
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Delete payment
export async function deletePayment(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL DeletePayment(?)", [id]);
    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// ================== PayMongo Integration Endpoints ==================

/**
 * Initiate payment for an order using PayMongo Checkout Session (RECOMMENDED)
 * POST /api/payments/initiate
 * Body: { order_id: string, use_checkout_session?: boolean }
 * Auth: Required (Tourist role)
 */
export async function initiatePayment(req, res) {
  try {
    const { order_id, use_checkout_session = true } = req.body;
    const user_id = req.user.id;

    // Validate input
    if (!order_id) {
      return res.status(400).json({ 
        success: false, 
        message: "order_id is required" 
      });
    }

    // 1. Fetch order details and validate ownership
    const [orderRows] = await db.query(
      `SELECT 
        o.id, o.order_number, o.user_id, o.business_id, o.total_amount, 
        o.status, o.payment_status, o.payment_method, o.payment_method_type
       FROM \`order\` o
       WHERE o.id = ?`,
      [order_id]
    );

    if (!orderRows || orderRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    const order = orderRows[0];

    // Validate ownership
    if (order.user_id !== user_id) {
      return res.status(403).json({ 
        success: false, 
        message: "You are not authorized to initiate payment for this order" 
      });
    }

    // Validate order status
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot initiate payment for order with status: ${order.status}` 
      });
    }

    // Validate payment method
    if (order.payment_method !== 'paymongo') {
      return res.status(400).json({ 
        success: false, 
        message: `Payment method must be 'paymongo', got: ${order.payment_method}` 
      });
    }

    // Validate payment not already completed
    if (order.payment_status === 'paid') {
      return res.status(400).json({ 
        success: false, 
        message: "Payment already completed for this order" 
      });
    }

    // 2. Prepare payment metadata
    const amountInCentavos = Math.round(order.total_amount * 100);
    
    if (amountInCentavos < 100) {
      return res.status(400).json({ 
        success: false, 
        message: "Order amount too low (minimum 1.00 PHP)" 
      });
    }

    // Enhanced metadata with all order information for webhook reconciliation
    const metadata = {
      order_id: order.id,
      order_number: order.order_number,
      business_id: order.business_id,
      user_id: user_id,
      total_amount: order.total_amount.toString(),
      subtotal: order.subtotal?.toString() || '0',
      discount_amount: order.discount_amount?.toString() || '0',
      payment_method: order.payment_method,
      payment_method_type: order.payment_method_type || 'paymongo',
      pickup_datetime: order.pickup_datetime?.toISOString() || new Date().toISOString(),
      source: 'mobile_app'
    };

    // Use HTTP/HTTPS URLs for PayMongo (they don't accept deep links)
    // These will hit the redirect landing pages defined in index.js
    const successUrl = `${PAYMONGO_REDIRECT_BASE}/orders/${order.id}/payment-success`;
    const cancelUrl = `${PAYMONGO_REDIRECT_BASE}/orders/${order.id}/payment-cancel`;

    // 3. Fetch order items for line items
    const [itemRows] = await db.query(
      `SELECT oi.product_id, oi.quantity, oi.unit_price, oi.total_price, p.name, p.image_url
       FROM order_item oi
       JOIN product p ON p.id = oi.product_id
       WHERE oi.order_id = ?`,
      [order.id]
    );

    const lineItems = itemRows.map(item => {
      const imageUrl = (item.image_url || '').trim();
      const lineItem = {
        currency: 'PHP',
        amount: Math.round(item.unit_price * 100),
        name: item.name,
        quantity: item.quantity
      };

      if (imageUrl) {
        lineItem.images = [imageUrl];
      }

      return lineItem;
    });

    let paymongoResponse;
    let provider_reference;
    let checkout_url;

    // 4. Create PayMongo Checkout Session (RECOMMENDED) or Payment Intent/Source
    if (use_checkout_session) {
      // Use Checkout Session for hosted checkout page (supports all payment methods)
      paymongoResponse = await paymongoService.createCheckoutSession({
        orderId: order.id,
        orderNumber: order.order_number,
        amount: amountInCentavos,
        lineItems,
        successUrl,
        cancelUrl,
        description: `Payment for Order ${order.order_number}`,
        metadata
      });

      provider_reference = paymongoResponse.id;
      checkout_url = paymongoResponse.attributes.checkout_url;

      // Update order with checkout session ID
      await db.query(
        `UPDATE \`order\` SET paymongo_checkout_id = ? WHERE id = ?`,
        [provider_reference, order.id]
      );

    } else if (['gcash', 'grab_pay', 'paymaya'].includes(order.payment_method_type)) {
      // Fallback: Create source for e-wallet payments (legacy approach)
      paymongoResponse = await paymongoService.createSource({
        amount: amountInCentavos,
        type: order.payment_method_type,
        orderId: order.id,
        redirect: {
          success: successUrl,
          failed: cancelUrl
        },
        metadata
      });

      provider_reference = paymongoResponse.id;
      checkout_url = paymongoResponse.attributes.redirect?.checkout_url;

      // Update order with source ID
      await db.query(
        `UPDATE \`order\` SET paymongo_source_id = ? WHERE id = ?`,
        [provider_reference, order.id]
      );

    } else {
      return res.status(400).json({ 
        success: false, 
        message: `For non-checkout-session mode, only gcash, grab_pay, and paymaya are supported` 
      });
    }

    // 5. Create payment record in database
    const payment_id = uuidv4();
    const created_at = new Date();

    await db.query(
      `CALL InsertPayment(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payment_id,
        'Tourist',                    // payer_type
        'online',                     // payment_type
        order.payment_method_type || 'paymongo',    // payment_method
        order.total_amount,           // amount in PHP
        'pending',                    // status
        'order',                      // payment_for
        user_id,                      // payer_id
        order.id,                     // payment_for_id
        created_at
      ]
    );

    // Store provider reference and metadata
    await db.query(
      `UPDATE payment 
       SET provider_reference = ?, 
           currency = 'PHP', 
           metadata = ?
       WHERE id = ?`,
      [provider_reference, JSON.stringify(metadata), payment_id]
    );

    // 6. Return checkout URL to client
    res.status(201).json({
      success: true,
      message: "Payment initiated successfully",
      data: {
        payment_id,
        order_id: order.id,
        order_number: order.order_number,
        amount: order.total_amount,
        currency: 'PHP',
        payment_method_type: order.payment_method_type,
        provider_reference,
        checkout_url,  // Client should redirect user to this URL
        status: 'pending'
      }
    });

  } catch (error) {
    console.error("Error initiating payment:", error);
    
    // Don't expose internal error details
    if (error.message && error.message.includes('PayMongo')) {
      return res.status(502).json({ 
        success: false, 
        message: "Payment provider error. Please try again later." 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: "Failed to initiate payment",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Create a Payment Intent for an order (Payment Intent Workflow)
 * POST /api/payments/intent
 * Body: { order_id: string, payment_method_types?: string[] }
 * Auth: Required (Tourist role)
 * 
 * This endpoint is for custom checkout integration where:
 * 1. Server creates Payment Intent (this endpoint)
 * 2. Client collects card details and creates Payment Method using public key
 * 3. Client attaches Payment Method to Intent
 * 4. Client handles 3DS redirect if needed
 * 5. Webhook confirms payment success/failure
 * 
 * Returns client_key for client-side operations
 */
export async function createPaymentIntentForOrder(req, res) {
  try {
    const { order_id, payment_method_types } = req.body;
    const user_id = req.user.id;

    // Validate input
    if (!order_id) {
      return res.status(400).json({ 
        success: false, 
        message: "order_id is required" 
      });
    }

    // 1. Fetch order details and validate ownership
    const [orderRows] = await db.query(
      `SELECT 
        o.id, o.order_number, o.user_id, o.business_id, o.total_amount, 
        o.status, o.payment_status, o.payment_method, o.payment_method_type
       FROM \`order\` o
       WHERE o.id = ?`,
      [order_id]
    );

    if (!orderRows || orderRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    const order = orderRows[0];

    // Validate ownership
    if (order.user_id !== user_id) {
      return res.status(403).json({ 
        success: false, 
        message: "You are not authorized to create payment for this order" 
      });
    }

    // Validate order status
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot create payment for order with status: ${order.status}` 
      });
    }

    // Validate payment not already completed
    if (order.payment_status === 'paid') {
      return res.status(400).json({ 
        success: false, 
        message: "Payment already completed for this order" 
      });
    }

    // 2. Prepare payment amount (minimum ₱20 for Payment Intents)
    const amountInCentavos = Math.round(order.total_amount * 100);
    
    if (amountInCentavos < 2000) {
      return res.status(400).json({ 
        success: false, 
        message: "Order amount too low for Payment Intent (minimum ₱20.00)" 
      });
    }

    // 3. Enhanced metadata for webhook reconciliation
    const metadata = {
      order_id: order.id,
      order_number: order.order_number,
      business_id: order.business_id,
      user_id: user_id,
      total_amount: order.total_amount.toString(),
      source: 'payment_intent'
    };

    // 4. Define allowed payment methods
    const allowedMethods = payment_method_types || ['card', 'paymaya', 'gcash', 'grab_pay'];

    // 5. Create Payment Intent via PayMongo
    const paymentIntent = await paymongoService.createPaymentIntent({
      orderId: order.id,
      amount: amountInCentavos,
      description: `Payment for Order #${order.order_number}`,
      paymentMethodAllowed: allowedMethods,
      metadata,
      statementDescriptor: 'CITY VENTURE'
    });

    const paymentIntentId = paymentIntent.id;
    const clientKey = paymentIntent.attributes.client_key;

    // 6. Update order with Payment Intent ID
    await db.query(
      `UPDATE \`order\` SET paymongo_payment_intent_id = ? WHERE id = ?`,
      [paymentIntentId, order.id]
    );

    // 7. Create payment record in database
    const payment_id = uuidv4();
    const created_at = new Date();

    await db.query(
      `CALL InsertPayment(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payment_id,
        'Tourist',                    // payer_type
        'online',                     // payment_type
        'payment_intent',             // payment_method
        order.total_amount,           // amount in PHP
        'pending',                    // status
        'order',                      // payment_for
        user_id,                      // payer_id
        order.id,                     // payment_for_id
        created_at
      ]
    );

    // Store provider reference and metadata
    await db.query(
      `UPDATE payment 
       SET provider_reference = ?, 
           currency = 'PHP', 
           metadata = ?
       WHERE id = ?`,
      [paymentIntentId, JSON.stringify(metadata), payment_id]
    );

    // 8. Return client_key for client-side operations
    res.status(201).json({
      success: true,
      message: "Payment Intent created successfully",
      data: {
        payment_id,
        payment_intent_id: paymentIntentId,
        client_key: clientKey,  // Client uses this to attach payment method
        order_id: order.id,
        order_number: order.order_number,
        amount: order.total_amount,
        amount_centavos: amountInCentavos,
        currency: 'PHP',
        payment_method_allowed: allowedMethods,
        status: paymentIntent.attributes.status, // 'awaiting_payment_method'
        public_key: process.env.PAYMONGO_PUBLIC_KEY // For client-side SDK
      }
    });

  } catch (error) {
    console.error("Error creating payment intent:", error);
    
    if (error.message && error.message.includes('PayMongo')) {
      return res.status(502).json({ 
        success: false, 
        message: "Payment provider error. Please try again later." 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: "Failed to create payment intent",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Attach Payment Method to Payment Intent (Server-side for e-wallets)
 * POST /api/payments/intent/:id/attach
 * Body: { payment_method_type: string, return_url: string, billing?: object }
 * Auth: Required (Tourist role)
 * 
 * This endpoint is for server-side attachment of e-wallet payment methods.
 * For card payments, the client should attach directly using public key + client_key.
 */
export async function attachPaymentMethodToIntent(req, res) {
  try {
    const { id } = req.params; // Payment Intent ID
    const { payment_method_type, return_url, billing } = req.body;
    const user_id = req.user.id;

    // Validate input
    if (!payment_method_type) {
      return res.status(400).json({ 
        success: false, 
        message: "payment_method_type is required" 
      });
    }

    if (!return_url) {
      return res.status(400).json({ 
        success: false, 
        message: "return_url is required for e-wallet payments" 
      });
    }

    // 1. Find the order associated with this payment intent
    const [orderRows] = await db.query(
      `SELECT o.id, o.user_id, o.order_number, o.total_amount, o.status, o.payment_status
       FROM \`order\` o 
       WHERE o.paymongo_payment_intent_id = ?`,
      [id]
    );

    if (!orderRows || orderRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Payment Intent not found or not associated with any order" 
      });
    }

    const order = orderRows[0];

    // Validate ownership
    if (order.user_id !== user_id) {
      return res.status(403).json({ 
        success: false, 
        message: "You are not authorized to attach payment method to this intent" 
      });
    }

    // Validate order status
    if (order.payment_status === 'paid') {
      return res.status(400).json({ 
        success: false, 
        message: "Payment already completed for this order" 
      });
    }

    // 2. Create Payment Method for e-wallet
    const validEwalletTypes = ['gcash', 'paymaya', 'grab_pay', 'shopee_pay', 'dob', 'billease', 'qrph', 'brankas'];
    if (!validEwalletTypes.includes(payment_method_type)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid payment method type. For server-side attachment, use: ${validEwalletTypes.join(', ')}. For card payments, use client-side attachment.`
      });
    }

    const paymentMethod = await paymongoService.createPaymentMethod({
      type: payment_method_type,
      billing: billing || {}
    });

    // 3. Attach Payment Method to Payment Intent
    const updatedIntent = await paymongoService.attachPaymentIntent(
      id,
      paymentMethod.id,
      return_url
    );

    // 4. Handle next_action (redirect for e-wallets)
    const nextAction = updatedIntent.attributes.next_action;
    const intentStatus = updatedIntent.attributes.status;

    res.status(200).json({
      success: true,
      message: "Payment method attached successfully",
      data: {
        payment_intent_id: id,
        payment_method_id: paymentMethod.id,
        status: intentStatus, // 'awaiting_next_action' or 'processing'
        next_action: nextAction, // Contains redirect URL for e-wallets
        redirect_url: nextAction?.redirect?.url || null,
        order_id: order.id
      }
    });

  } catch (error) {
    console.error("Error attaching payment method:", error);
    
    if (error.message && error.message.includes('PayMongo')) {
      return res.status(502).json({ 
        success: false, 
        message: "Payment provider error. Please try again later.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: "Failed to attach payment method",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Retrieve Payment Intent status
 * GET /api/payments/intent/:id
 * Auth: Required (Tourist role)
 */
export async function getPaymentIntentStatus(req, res) {
  try {
    const { id } = req.params; // Payment Intent ID
    const user_id = req.user.id;

    // 1. Find the order associated with this payment intent
    const [orderRows] = await db.query(
      `SELECT o.id, o.user_id, o.order_number, o.status, o.payment_status
       FROM \`order\` o 
       WHERE o.paymongo_payment_intent_id = ?`,
      [id]
    );

    if (!orderRows || orderRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Payment Intent not found" 
      });
    }

    const order = orderRows[0];

    // Validate ownership (or admin)
    const userRole = await ensureUserRole(req);
    if (userRole !== 'Admin' && order.user_id !== user_id) {
      return res.status(403).json({ 
        success: false, 
        message: "You are not authorized to view this payment intent" 
      });
    }

    // 2. Retrieve Payment Intent from PayMongo
    const paymentIntent = await paymongoService.getPaymentIntent(id);

    res.status(200).json({
      success: true,
      data: {
        payment_intent_id: id,
        status: paymentIntent.attributes.status,
        amount: paymentIntent.attributes.amount / 100,
        currency: paymentIntent.attributes.currency,
        payment_method_allowed: paymentIntent.attributes.payment_method_allowed,
        last_payment_error: paymentIntent.attributes.last_payment_error,
        next_action: paymentIntent.attributes.next_action,
        payments: paymentIntent.attributes.payments || [],
        order_id: order.id,
        order_status: order.status,
        order_payment_status: order.payment_status
      }
    });

  } catch (error) {
    console.error("Error retrieving payment intent:", error);
    
    return res.status(500).json({ 
      success: false, 
      message: "Failed to retrieve payment intent",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Handle PayMongo webhook events
 * POST /api/payments/webhook
 * No authentication required (signature-based verification)
 * 
 * BEST PRACTICE: Respond immediately with HTTP 200, then process asynchronously
 * This prevents webhook timeouts and ensures PayMongo doesn't retry unnecessarily
 */
export async function handleWebhook(req, res) {
  console.log('[Webhook] 📨 Received PayMongo webhook request');
  
  try {
    const signature = req.headers['paymongo-signature'];
    const rawBody = req.rawBody; // Requires raw body parser middleware

    if (!signature) {
      console.warn('[Webhook] ⚠️ Missing signature header');
      return res.status(401).json({ 
        success: false, 
        message: "Missing webhook signature" 
      });
    }

    if (!rawBody) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing request body" 
      });
    }

    // 1. Verify webhook signature (SYNCHRONOUS - must happen before responding)
    const isValid = paymongoService.verifyWebhookSignature(rawBody, signature);
    
    if (!isValid) {
      console.warn("[Webhook] ⚠️ Invalid webhook signature received");
      return res.status(401).json({ 
        success: false, 
        message: "Invalid webhook signature" 
      });
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch (parseErr) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook payload"
      });
    }

    // 2. Parse webhook event
    const event = paymongoService.parseWebhookEvent(parsedBody);
    const eventId = event.id;
    const eventType = event.type;

    console.log(`[Webhook] 📬 Event type: ${eventType}`);
    console.log(`[Webhook] 🆔 Event ID: ${eventId}`);

    // 3. Check for duplicate events (idempotency)
    const [existingEvents] = await db.query(
      `SELECT id, status FROM webhook_event WHERE provider_event_id = ?`,
      [eventId]
    );

    if (existingEvents && existingEvents.length > 0) {
      const existingEvent = existingEvents[0];
      console.log(`[Webhook] ⏭️ Duplicate event detected: ${eventId}, status: ${existingEvent.status}`);
      
      // Return 200 to acknowledge receipt (already processed or queued)
      return res.status(200).json({ 
        success: true, 
        message: "Event already processed" 
      });
    }

    // 4. Store webhook event immediately (before queuing)
    const webhook_id = uuidv4();
    await db.query(
      `INSERT INTO webhook_event 
       (id, provider, provider_event_id, event_type, livemode, payload, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        webhook_id,
        'paymongo',
        eventId,
        eventType,
        event.livemode ? 1 : 0,
        JSON.stringify(event),
        'pending',
        new Date()
      ]
    );

    // 5. Enqueue for async processing (non-blocking)
    const queue = webhookQueueService.getWebhookQueue();
    if (queue) {
      await webhookQueueService.enqueueWebhook({
        webhookId: webhook_id,
        eventId,
        eventType,
        event
      });
      console.log(`[Webhook] ✅ Event ${eventId} queued for processing`);
    } else {
      // Fallback: Process synchronously if queue not available
      console.warn('[Webhook] ⚠️ Queue not available, processing synchronously');
      setImmediate(async () => {
        try {
          await processWebhookEvent(eventType, event.data, webhook_id);
          await db.query(
            `UPDATE webhook_event SET status = 'processed', processed_at = ? WHERE id = ?`,
            [new Date(), webhook_id]
          );
        } catch (err) {
          console.error('[Webhook] Sync processing failed:', err);
          await db.query(
            `UPDATE webhook_event SET status = 'failed', processed_at = ? WHERE id = ?`,
            [new Date(), webhook_id]
          );
        }
      });
    }

    // 6. Respond immediately with 200 (PayMongo best practice)
    res.status(200).json({ 
      success: true, 
      message: "Webhook received and queued for processing" 
    });

  } catch (error) {
    console.error("[Webhook] ❌ Error handling webhook:", error);
    
    // Return 200 to avoid retries for unrecoverable errors
    res.status(200).json({ 
      success: false, 
      message: "Webhook handling error" 
    });
  }
}

/**
 * Process webhook event based on type
 * Exported for use by the webhook queue processor
 * @param {string} eventType - The PayMongo event type (e.g., 'checkout_session.payment.paid')
 * @param {object} eventData - The event data from PayMongo
 * @param {string} webhook_id - The webhook event ID stored in our database
 */
export async function processWebhookEvent(eventType, eventData, webhook_id) {
  const resourceType = eventData.attributes?.type || eventType.split('.')[0];
  const status = eventData.attributes?.status;
  const metadata = eventData.attributes?.metadata || {};
  const order_id = metadata.order_id;
  const booking_id = metadata.booking_id;
  const payment_for = metadata.payment_for || (booking_id ? 'booking' : 'order');
  
  // Determine the reference ID based on payment type
  const reference_id = payment_for === 'booking' ? booking_id : order_id;

  console.log(`[Webhook Processor] Processing ${eventType} for ${payment_for} ${reference_id}, status: ${status}`);

  // ========== Checkout Session Events (RECOMMENDED FLOW) ==========
  
  // Handle checkout_session.payment.paid event
  if (eventType === 'checkout_session.payment.paid') {
    if (!order_id) {
      console.warn("Missing order_id in checkout session metadata");
      return;
    }

    const payments = eventData.attributes?.payments || [];
    if (payments.length === 0) {
      console.warn("No payments found in checkout session");
      return;
    }

    const payment = payments[0]; // Get the first payment
    const paymentId = payment.id;
    const paymentAmount = payment.attributes?.amount;
    const paymentStatus = payment.attributes?.status;

    console.log(`[Webhook] 💳 Processing checkout_session.payment.paid`);
    console.log(`[Webhook] 🔑 Payment ID: ${paymentId}`);
    console.log(`[Webhook] 📊 Status: ${paymentStatus}, Amount: ₱${paymentAmount / 100}`);
    console.log(`[Webhook] 🛒 Order ID: ${order_id}`);

    // Update payment status to paid
    console.log(`[Webhook] 💾 Updating payment record...`);
    await db.query(
      `UPDATE payment 
       SET status = 'paid', 
           paymongo_payment_id = ?,
           metadata = JSON_SET(
             COALESCE(metadata, '{}'),
             '$.paymongo_payment_status', ?,
             '$.paymongo_amount_centavos', ?,
             '$.paymongo_fee', ?,
             '$.paymongo_net_amount', ?,
             '$.webhook_processed_at', ?
           ),
           updated_at = ? 
       WHERE payment_for = 'order' 
         AND payment_for_id = ?`,
      [
        paymentId, 
        paymentStatus,
        paymentAmount,
        payment.attributes?.fee || 0,
        payment.attributes?.net_amount || 0,
        new Date().toISOString(),
        new Date(), 
        order_id
      ]
    );

    // Update order payment status and add payment details
    console.log(`[Webhook] 💾 Updating order payment_status to 'paid'...`);
    const [updateResult] = await db.query(
      `UPDATE \`order\` 
       SET payment_status = 'paid',
           paymongo_payment_id = ?,
           updated_at = ?
       WHERE id = ?`,
      [paymentId, new Date(), order_id]
    );
    console.log(`[Webhook] ✅ Order updated, affected rows: ${updateResult.affectedRows}`);

    // Log payment confirmation for audit trail
    console.log(`[Webhook] ✅ Order ${order_id} payment confirmed:`, {
      paymentId,
      amount: paymentAmount / 100,
      currency: 'PHP',
      status: paymentStatus
    });

    // ========== Audit Logging ==========
    await auditService.logPaymentUpdate({
      orderId: order_id,
      oldStatus: 'unpaid',
      newStatus: 'paid',
      actor: null, // System/webhook event
      paymentDetails: {
        paymongo_payment_id: paymentId,
        amount_centavos: paymentAmount,
        webhook_event_type: 'checkout_session.payment.paid'
      }
    });

    // Emit real-time events AND order notifications (deferred from order creation)
    console.log(`[Webhook] 📡 Emitting socket events for order ${order_id}...`);
    await emitPaymentEvents(order_id, paymentId, 'paid', paymentAmount);
    
    // NOW notify business about the new PAID order
    console.log(`[Webhook] 📢 Emitting new order notification (payment confirmed)...`);
    try {
      const [orderRows] = await db.query(
        `SELECT o.*, u.email as user_email FROM \`order\` o 
         JOIN user u ON u.id = o.user_id 
         WHERE o.id = ?`,
        [order_id]
      );
      
      if (orderRows && orderRows.length > 0) {
        const order = orderRows[0];
        
        // Fetch items
        const [itemsResult] = await db.query(
          "SELECT * FROM order_item WHERE order_id = ?",
          [order_id]
        );
        
        const completeOrderData = {
          ...order,
          items: itemsResult || [],
          item_count: itemsResult?.length || 0,
        };
        
        const socketService = await import('../services/socketService.js');
        const notificationHelper = await import('../services/notificationHelper.js');
        
        socketService.emitNewOrder(completeOrderData);
        await notificationHelper.triggerNewOrderNotifications(completeOrderData);
        
        console.log(`[Webhook] ✅ Business notified of new paid order ${order.order_number}`);
      }
    } catch (notifError) {
      console.error(`[Webhook] ❌ Failed to emit order notifications:`, notifError);
    }
    
    console.log(`[Webhook] ✅ Webhook processing complete for checkout_session.payment.paid`);
  }

  // ========== Source Events (Legacy E-Wallet Flow) ==========
  
  // Handle source.chargeable event (e-wallets like GCash)
  else if (eventType === 'source.chargeable') {
    if (!order_id) {
      throw new Error("Missing order_id in webhook metadata");
    }

    const sourceId = eventData.id;

    // Update payment status to paid
    await db.query(
      `UPDATE payment 
       SET status = 'paid', updated_at = ? 
       WHERE payment_for = 'order' 
         AND payment_for_id = ? 
         AND provider_reference = ?`,
      [new Date(), order_id, sourceId]
    );

    // Update order payment status
    await db.query(
      `UPDATE \`order\` 
       SET payment_status = 'paid' 
       WHERE id = ?`,
      [order_id]
    );

    console.log(`Order ${order_id} marked as paid (source.chargeable: ${sourceId})`);

    // Emit real-time events
    await emitPaymentEvents(order_id, sourceId, 'paid', eventData.attributes?.amount);
  }

  // ========== Payment Events (Direct Payment Intent Flow - Orders & Bookings) ==========
  
  // Handle payment.paid event (card payments or direct payment intents)
  else if (eventType === 'payment.paid') {
    // PIPM flow supports both orders and bookings
    if (!reference_id) {
      throw new Error("Missing order_id or booking_id in webhook metadata");
    }

    const paymentId = eventData.id;
    const paymentIntentId = eventData.attributes?.payment_intent_id;
    const paymentAmount = eventData.attributes?.amount;

    console.log(`[Webhook] 💳 Processing payment.paid for ${payment_for} ${reference_id}`);
    console.log(`[Webhook] 🔑 Payment ID: ${paymentId}, Intent: ${paymentIntentId}`);

    // Update payment record status to paid
    await db.query(
      `UPDATE payment 
       SET status = 'paid', 
           paymongo_payment_id = ?,
           metadata = JSON_SET(
             COALESCE(metadata, '{}'),
             '$.paymongo_payment_status', 'paid',
             '$.paymongo_amount_centavos', ?,
             '$.payment_intent_id', ?,
             '$.webhook_processed_at', ?
           ),
           updated_at = ? 
       WHERE payment_for = ? 
         AND payment_for_id = ?`,
      [paymentId, paymentAmount, paymentIntentId || '', new Date().toISOString(), new Date(), payment_for, reference_id]
    );

    // Update the relevant table based on payment type
    if (payment_for === 'booking') {
      // Update booking status and balance (booking table doesn't have updated_at)
      await db.query(
        `UPDATE booking 
         SET booking_status = 'Confirmed',
             balance = GREATEST(0, balance - ?)
         WHERE id = ?`,
        [paymentAmount / 100, reference_id]
      );
      console.log(`[Webhook] ✅ Booking ${reference_id} marked as Confirmed (payment.paid: ${paymentId})`);
    } else {
      // Update order payment status
      await db.query(
        `UPDATE \`order\` 
         SET payment_status = 'paid',
             paymongo_payment_id = ?,
             updated_at = ?
         WHERE id = ?`,
        [paymentId, new Date(), reference_id]
      );
      console.log(`[Webhook] ✅ Order ${reference_id} marked as paid (payment.paid: ${paymentId})`);
    }

    // ========== Audit Logging ==========
    await auditService.logPaymentUpdate({
      orderId: reference_id, // Works for bookings too, just a reference
      oldStatus: payment_for === 'booking' ? 'Pending' : 'unpaid',
      newStatus: payment_for === 'booking' ? 'Confirmed' : 'paid',
      actor: null,
      paymentDetails: {
        paymongo_payment_id: paymentId,
        payment_intent_id: paymentIntentId,
        amount_centavos: paymentAmount,
        webhook_event_type: 'payment.paid',
        payment_for: payment_for
      }
    });

    // Emit real-time events (for orders)
    if (payment_for === 'order') {
      await emitPaymentEvents(reference_id, paymentId, 'paid', paymentAmount);

      // Notify business about the new PAID order
      console.log(`[Webhook] 📢 Emitting new order notification for payment.paid...`);
      try {
        const [orderRows] = await db.query(
          `SELECT o.*, u.email as user_email FROM \`order\` o 
           JOIN user u ON u.id = o.user_id 
           WHERE o.id = ?`,
          [reference_id]
        );
        
        if (orderRows && orderRows.length > 0) {
          const order = orderRows[0];
          
          // Fetch items
          const [itemsResult] = await db.query(
            "SELECT * FROM order_item WHERE order_id = ?",
            [reference_id]
          );
          
          const completeOrderData = {
            ...order,
            items: itemsResult || [],
            item_count: itemsResult?.length || 0,
          };
          
          socketService.emitNewOrder(completeOrderData);
          await notificationHelper.triggerNewOrderNotifications(completeOrderData);
          
          console.log(`[Webhook] ✅ Business notified of new paid order ${order.order_number}`);
        }
      } catch (notifError) {
        console.error(`[Webhook] ❌ Failed to emit order notifications:`, notifError);
      }
    } else if (payment_for === 'booking') {
      // TODO: Add booking-specific notifications/socket events if needed
      console.log(`[Webhook] ✅ Booking payment processed successfully`);
    }
  }

  // Handle payment.failed event
  else if (eventType === 'payment.failed') {
    const paymentId = eventData.id;
    const paymentIntentId = eventData.attributes?.payment_intent_id;
    const failedCode = eventData.attributes?.failed_code || 'UNKNOWN';
    const failedMessage = eventData.attributes?.failed_message || 'Payment failed';
    
    console.log(`[Webhook] 💔 Processing payment.failed event`);
    console.log(`[Webhook] 🔑 Payment ID: ${paymentId}, Intent: ${paymentIntentId}`);
    
    // Try to get order_id from metadata first
    let resolvedOrderId = order_id;
    
    // If no order_id in metadata, look it up by payment_id, payment_intent_id, or order's payment_intent_id
    if (!resolvedOrderId) {
      console.log('[Webhook] ⚠️ No order_id in payment.failed metadata, querying database...');
      
      try {
        // First try to find via payment table
        const [paymentRows] = await db.query(
          `SELECT payment_for_id FROM payment 
           WHERE (paymongo_payment_id = ? OR provider_reference = ?) 
           AND payment_for = 'order' 
           LIMIT 1`,
          [paymentId, paymentIntentId]
        );
        
        if (paymentRows && paymentRows.length > 0) {
          resolvedOrderId = paymentRows[0].payment_for_id;
          console.log(`[Webhook] ✅ Found order_id from payment table: ${resolvedOrderId}`);
        } else if (paymentIntentId) {
          // Fallback: try to find via order's paymongo_payment_intent_id
          console.log('[Webhook] 🔍 Trying to find order by payment_intent_id...');
          const [orderRows] = await db.query(
            `SELECT id FROM \`order\` WHERE paymongo_payment_intent_id = ? LIMIT 1`,
            [paymentIntentId]
          );
          
          if (orderRows && orderRows.length > 0) {
            resolvedOrderId = orderRows[0].id;
            console.log(`[Webhook] ✅ Found order_id from order table: ${resolvedOrderId}`);
          }
        }
        
        if (!resolvedOrderId) {
          console.warn('[Webhook] ❌ Could not find order for payment.failed event');
          
          // Still update payment record even without order
          await db.query(
            `UPDATE payment 
             SET status = 'failed', 
                 paymongo_payment_id = ?,
                 metadata = JSON_SET(
                   COALESCE(metadata, '{}'),
                   '$.failed_code', ?,
                   '$.failed_message', ?
                 ),
                 updated_at = ? 
             WHERE paymongo_payment_id = ? OR provider_reference = ?`,
            [
              paymentId,
              failedCode,
              failedMessage,
              new Date(),
              paymentId,
              paymentIntentId
            ]
          );
          
          console.log(`[Webhook] 💾 Updated payment ${paymentId} as failed (no order found)`);
          return;
        }
      } catch (err) {
        console.error('[Webhook] Error querying for order_id:', err);
        return;
      }
    }

    // Update payment status to failed with error details
    await db.query(
      `UPDATE payment 
       SET status = 'failed', 
           paymongo_payment_id = ?,
           metadata = JSON_SET(
             COALESCE(metadata, '{}'),
             '$.failed_code', ?,
             '$.failed_message', ?
           ),
           updated_at = ? 
       WHERE payment_for = 'order' 
         AND payment_for_id = ?`,
      [
        paymentId,
        failedCode,
        failedMessage,
        new Date(), 
        resolvedOrderId
      ]
    );

    // Update order payment status and status
    await db.query(
      `UPDATE \`order\` 
       SET payment_status = 'failed', 
           status = 'failed_payment' 
       WHERE id = ?`,
      [resolvedOrderId]
    );

    console.log(`[Webhook] 💔 Order ${resolvedOrderId} marked as failed payment: ${failedMessage} (code: ${failedCode})`);

    // ========== Audit Logging ==========
    await auditService.logPaymentUpdate({
      orderId: resolvedOrderId,
      oldStatus: 'unpaid',
      newStatus: 'failed',
      actor: null, // System/webhook event
      paymentDetails: {
        paymongo_payment_id: paymentId,
        failed_code: failedCode,
        failed_message: failedMessage,
        webhook_event_type: 'payment.failed'
      }
    });

    // Emit real-time events
    await emitPaymentEvents(resolvedOrderId, paymentId, 'failed', eventData.attributes?.amount);
  }

  // ========== Refund Events ==========
  
  // Handle refund.updated event (succeeded status)
  else if (eventType === 'refund.updated' && status === 'succeeded') {
    const payment_id = eventData.attributes?.payment_id;
    const refundId = eventData.id;
    
    if (payment_id) {
      // Update payment status to refunded
      await db.query(
        `UPDATE payment 
         SET status = 'refunded', 
             refund_reference = ?, 
             updated_at = ? 
         WHERE paymongo_payment_id = ?`,
        [refundId, new Date(), payment_id]
      );

      // Find order and update payment status
      const [paymentRows] = await db.query(
        `SELECT payment_for_id FROM payment 
         WHERE paymongo_payment_id = ? AND payment_for = 'order'`,
        [payment_id]
      );

      if (paymentRows && paymentRows.length > 0) {
        const order_id = paymentRows[0].payment_for_id;
        
        await db.query(
          `UPDATE \`order\` 
           SET payment_status = 'refunded' 
           WHERE id = ?`,
          [order_id]
        );

        console.log(`Order ${order_id} refund completed (refund: ${refundId})`);

        // ========== Audit Logging ==========
        await auditService.logPaymentUpdate({
          orderId: order_id,
          oldStatus: 'paid',
          newStatus: 'refunded',
          actor: null, // System/webhook event
          paymentDetails: {
            refund_id: refundId,
            refund_amount: eventData.attributes?.amount / 100,
            webhook_event_type: 'refund.updated'
          }
        });

        // Emit real-time events
        await emitPaymentEvents(order_id, payment_id, 'refunded', eventData.attributes?.amount);
      }
    }
  }

  else {
    console.log(`Unhandled webhook event type: ${eventType}`);
  }
}

/**
 * Helper function to emit real-time payment events
 */
async function emitPaymentEvents(order_id, payment_id, status, amount) {
  try {
    // Fetch order details for socket emission
    const [orderRows] = await db.query(
      `SELECT id, order_number, business_id, user_id, status, payment_status FROM \`order\` WHERE id = ?`,
      [order_id]
    );
    
    if (orderRows && orderRows.length > 0) {
      const order = orderRows[0];
      
      const paymentObj = { 
        id: payment_id, 
        payment_for_id: order_id, 
        status, 
        payment_method: 'paymongo', 
        amount: amount ? amount / 100 : 0
      };
      
      socketService.emitPaymentUpdated(paymentObj, order);
      socketService.emitOrderUpdated(order, null);
      
      // Trigger notifications
      await notificationHelper.triggerPaymentUpdateNotifications(paymentObj, order);
    }
  } catch (error) {
    console.error('Failed to emit payment events:', error);
  }
}

/**
 * Initiate refund for a payment
 * POST /api/payments/:id/refund
 * Auth: Required (Admin only)
 */
export async function initiateRefund(req, res) {
  try {
    const { id } = req.params;
    const { reason, notes } = req.body;

    // 1. Fetch payment details
    const [paymentRows] = await db.query(
      `SELECT 
        p.id, p.payment_for, p.payment_for_id, p.status, p.amount, 
        p.provider_reference, p.paymongo_payment_id, p.payment_method, p.currency
       FROM payment p
       WHERE p.id = ?`,
      [id]
    );

    if (!paymentRows || paymentRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Payment not found" 
      });
    }

    const payment = paymentRows[0];

    // 2. Validate payment is refundable
    if (payment.status !== 'paid') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot refund payment with status: ${payment.status}` 
      });
    }

    // Get the actual PayMongo payment ID (not the source/checkout session ID)
    const paymongoPaymentId = payment.paymongo_payment_id || payment.provider_reference;
    
    if (!paymongoPaymentId) {
      return res.status(400).json({ 
        success: false, 
        message: "Payment has no PayMongo payment ID (not processed via PayMongo or payment not completed)" 
      });
    }

    // 3. Call PayMongo refund API
    const amountInCentavos = Math.round(payment.amount * 100);
    
    const refundMetadata = {
      payment_id: payment.id,
      payment_for: payment.payment_for,
      payment_for_id: payment.payment_for_id,
      refund_initiated_by: req.user?.id || 'system'
    };

    const refundResponse = await paymongoService.createRefund({
      paymentId: paymongoPaymentId,
      amount: amountInCentavos,
      reason: reason || 'requested_by_customer',
      notes: notes || 'Order cancellation',
      metadata: refundMetadata
    });

    const refund_id = refundResponse.id;
    const refund_status = refundResponse.attributes.status;

    // 4. Update payment record
    await db.query(
      `UPDATE payment 
       SET status = ?, 
           refund_reference = ?, 
           metadata = JSON_SET(COALESCE(metadata, '{}'), '$.refund_reason', ?, '$.refund_notes', ?),
           updated_at = ? 
       WHERE id = ?`,
      [
        refund_status === 'succeeded' ? 'refunded' : 'pending_refund',
        refund_id, 
        reason || '', 
        notes || '', 
        new Date(), 
        id
      ]
    );

    // 5. Update order payment status (if applicable and refund succeeded)
    if (payment.payment_for === 'order' && refund_status === 'succeeded') {
      await db.query(
        `UPDATE \`order\` 
         SET payment_status = 'refunded' 
         WHERE id = ?`,
        [payment.payment_for_id]
      );
    }

    res.status(200).json({
      success: true,
      message: `Refund ${refund_status === 'succeeded' ? 'completed' : 'initiated'} successfully`,
      data: {
        refund_id,
        payment_id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: refund_status,
        reason: reason || 'requested_by_customer'
      }
    });

  } catch (error) {
    console.error("Error initiating refund:", error);
    
    // Don't expose internal error details
    if (error.message && error.message.includes('PayMongo')) {
      return res.status(502).json({ 
        success: false, 
        message: "Payment provider error. Please try again later.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: "Failed to initiate refund",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

