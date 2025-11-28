// Order Creation Controller - Complex order creation with PayMongo integration
import db from "../../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../../utils/errorHandler.js";
import { 
  validateOrderCreation, 
  sanitizeString
} from "../../utils/orderValidation.js";
import * as paymongoService from "../../services/paymongoService.js";
import * as socketService from "../../services/socketService.js";
import * as notificationHelper from "../../services/notificationHelper.js";
import { generateOrderNumber, generateArrivalCode } from "./utils.js";

/**
 * Create a new order
 * POST /api/orders
 */
export async function insertOrder(req, res) {
  // Validate payload first
  const validation = validateOrderCreation(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      message: "Validation failed",
      errors: validation.errors
    });
  }

  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const orderId = uuidv4();
    
    // Extract user_id from authenticated user (req.user set by authenticate middleware)
    const user_id = req.user?.id;
    if (!user_id) {
      await connection.rollback();
      return res.status(401).json({ message: "User authentication required" });
    }
    
    const { 
      business_id, 
      items, 
      discount_id, 
      pickup_datetime, 
      special_instructions,
      payment_method,
      payment_method_type
    } = req.body;

    // Sanitize string inputs
    const sanitizedInstructions = special_instructions ? sanitizeString(special_instructions) : null;

    // Calculate order totals
    let subtotal = 0;
    const orderItems = [];
    
    for (const item of items) {
      const [product] = await connection.query("SELECT price, status FROM product WHERE id = ?", [item.product_id]);
      if (!product || product.length === 0) {
        await connection.rollback();
        return res.status(400).json({ 
          message: `Product with ID ${item.product_id} not found` 
        });
      }
      
      // Check if product is temporarily unavailable
      const productStatus = product[0].status;
      const isUnavailable = product[0].is_unavailable || ['inactive', 'out_of_stock'].includes((productStatus || '').toLowerCase());
      if (isUnavailable) {
        await connection.rollback();
        return res.status(400).json({ 
          message: `Product is currently unavailable and cannot be ordered`,
          product_id: item.product_id
        });
      }
      
      const unitPrice = product[0].price;
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;
      
      orderItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        special_requests: item.special_requests ? sanitizeString(item.special_requests) : null
      });
    }

    // Apply discount if provided
    let discountAmount = 0;
    let finalDiscountId = discount_id || null;
    
    if (discount_id) {
      try {
        const [discountData] = await connection.query("CALL ValidateDiscount(?, ?, ?)", [
          discount_id, subtotal, user_id
        ]);
        
        if (discountData && discountData.length > 0) {
          const discount = discountData[0];
          
          if (discount.discount_type === 'percentage') {
            discountAmount = (subtotal * discount.discount_value) / 100;
            if (discount.maximum_discount_amount) {
              discountAmount = Math.min(discountAmount, discount.maximum_discount_amount);
            }
          } else {
            discountAmount = discount.discount_value;
          }
          
          discountAmount = Math.min(discountAmount, subtotal);
        }
      } catch (discountError) {
        // If discount validation fails, continue without discount
        console.warn("Discount validation failed:", discountError.message);
        finalDiscountId = null;
      }
    }

    const taxAmount = 0; // Tax calculation can be implemented here
    const totalAmount = subtotal - discountAmount + taxAmount;

    // Normalize pickup datetime to Date object for MySQL
    const pickupDateObj = new Date(pickup_datetime);
    if (isNaN(pickupDateObj.getTime())) {
      await connection.rollback();
      return res.status(400).json({ 
        message: "Invalid pickup datetime format" 
      });
    }

    // Generate order number and arrival code
    const orderNumber = generateOrderNumber();
    const arrivalCode = generateArrivalCode();

    // Insert order using stored procedure with new parameters
    await connection.query(
      "CALL InsertOrder(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
      [
        orderId, 
        business_id, 
        user_id, 
        orderNumber, 
        subtotal, 
        discountAmount, 
        taxAmount, 
        totalAmount,
        finalDiscountId, 
        pickupDateObj, 
        sanitizedInstructions, 
        payment_method || 'cash_on_pickup',
        payment_method_type || null,
        arrivalCode
      ]
    );

    // Insert order items and update stock
    for (const item of orderItems) {
      const itemId = uuidv4();
      
      // Insert order item using stored procedure
      await connection.query("CALL InsertOrderItem(?, ?, ?, ?, ?, ?, ?)", [
        itemId, orderId, item.product_id, item.quantity, item.unit_price, item.total_price, item.special_requests
      ]);

      // Update stock using stored procedure
      const historyId = uuidv4();
      try {
        await connection.query("CALL UpdateStockForOrder(?, ?, ?, ?, ?)", [
          item.product_id, item.quantity, orderNumber, user_id, historyId
        ]);
      } catch (stockError) {
        await connection.rollback();
        return res.status(400).json({ 
          message: `Insufficient stock for product ${item.product_id}`,
          error: stockError.message 
        });
      }
    }

    // Update discount usage count if discount was applied
    if (finalDiscountId && discountAmount > 0) {
      await connection.query("CALL UpdateDiscountUsage(?)", [finalDiscountId]);
    }

    await connection.commit();
    
    // ========== PayMongo Integration ==========
    // If payment method is PayMongo, create checkout session immediately
    let checkout_url = null;
    
    console.log(`[insertOrder] Order ${orderNumber} created, payment_method: ${payment_method}`);
    
    if (payment_method === 'paymongo') {
      try {
        // Prepare line items for checkout
        const lineItems = orderItems.map((item) => ({
          currency: 'PHP',
          amount: Math.round(item.unit_price * 100),
          name: item.product_name || `Product ${item.product_id}`,
          quantity: item.quantity,
        }));

        // Get product names for line items (orderItems don't have names yet)
        for (let i = 0; i < orderItems.length; i++) {
          const [productData] = await connection.query(
            "SELECT name, image_url FROM product WHERE id = ?",
            [orderItems[i].product_id]
          );
          if (productData && productData.length > 0) {
            lineItems[i].name = productData[0].name;
            if (productData[0].image_url) {
              lineItems[i].images = [productData[0].image_url];
            }
          }
        }

        // Prepare redirect URLs (these are HTTP URLs for PayMongo API)
        const redirectBase = process.env.PAYMONGO_REDIRECT_BASE || process.env.FRONTEND_BASE_URL || "http://localhost:5173";
        const successUrl = `${redirectBase}/orders/${orderId}/payment-success`;
        const cancelUrl = `${redirectBase}/orders/${orderId}/payment-cancel`;

        // Create PayMongo checkout session
        const checkoutSession = await paymongoService.createCheckoutSession({
          orderId,
          orderNumber,
          amount: Math.round(totalAmount * 100), // Convert to centavos
          lineItems,
          successUrl,
          cancelUrl,
          description: `Order ${orderNumber}`,
          metadata: {
            order_id: orderId,
            order_number: orderNumber,
            business_id: business_id,
            user_id: user_id,
            total_amount: totalAmount.toString(),
          }
        });

        checkout_url = checkoutSession.attributes.checkout_url;
        const provider_reference = checkoutSession.id;

        // Create payment record
        const payment_id = uuidv4();
        await connection.query(
          `CALL InsertPayment(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            payment_id,
            'Tourist',
            'online',
            payment_method_type || 'paymongo',
            totalAmount,
            'pending',
            'order',
            user_id,
            orderId,
            new Date()
          ]
        );

        // Store provider reference
        await connection.query(
          `UPDATE payment 
           SET provider_reference = ?, currency = 'PHP' 
           WHERE id = ?`,
          [provider_reference, payment_id]
        );

        console.log(`[insertOrder] ✅ PayMongo checkout created for order ${orderNumber}`);
        console.log(`[insertOrder] 🔗 Checkout URL: ${checkout_url}`);
        console.log(`[insertOrder] 📝 Provider reference (checkout session ID): ${provider_reference}`);

      } catch (paymongoError) {
        console.error(`[insertOrder] ❌ PayMongo checkout creation failed for order ${orderNumber}:`, paymongoError.message);
        // Don't fail the order, but log the error
        // checkout_url will remain null and frontend can handle retry via /payments/initiate
      }
    }
    
    // Return spec-compliant response (spec.md §7)
    const response = {
      order_id: orderId,
      order_number: orderNumber,
      arrival_code: arrivalCode,
      status: "pending",
      payment_status: "pending",
      total_amount: totalAmount
    };

    // Add checkout_url for PayMongo orders
    if (checkout_url) {
      response.checkout_url = checkout_url;
    }

    // ========== Real-time Notifications ==========
    // For PayMongo orders: SKIP notifications until payment is confirmed via webhook
    // For COP orders: Emit immediately since no payment confirmation needed
    if (payment_method === 'cash_on_pickup') {
      console.log(`[insertOrder] 📢 Emitting notifications for COP order ${orderNumber}`);
      
      try {
        const [userEmailResult] = await db.query(
          "SELECT email FROM user WHERE id = ?",
          [user_id]
        );
        const userEmail = userEmailResult?.[0]?.email || 'unknown@email.com';

        const [itemsResult] = await db.query(
          "SELECT * FROM order_item WHERE order_id = ?",
          [orderId]
        );
        const itemsData = itemsResult || [];

        const completeOrderData = {
          id: orderId,
          order_number: orderNumber,
          business_id: business_id,
          user_id: user_id,
          user_email: userEmail,
          status: 'pending',
          payment_status: 'pending',
          payment_method: payment_method || 'cash_on_pickup',
          subtotal: subtotal,
          discount_amount: discountAmount || 0,
          tax_amount: taxAmount || 0,
          total_amount: totalAmount,
          pickup_datetime: pickupDateObj,
          special_instructions: sanitizedInstructions,
          arrival_code: arrivalCode,
          discount_name: null,
          item_count: itemsData.length,
          items: itemsData,
          created_at: new Date()
        };

        socketService.emitNewOrder(completeOrderData);
        await notificationHelper.triggerNewOrderNotifications(completeOrderData);
      } catch (socketError) {
        console.error('Failed to emit new order event:', socketError);
      }
    } else {
      console.log(`[insertOrder] ⏳ PayMongo order ${orderNumber} - notifications deferred until payment confirmation`);
    }

    res.status(201).json(response);
  } catch (error) {
    await connection.rollback();
    return handleDbError(error, res);
  } finally {
    connection.release();
  }
}
