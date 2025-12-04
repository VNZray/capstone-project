/**
 * Payment Intent Controller
 * Handles Payment Intent creation and retrieval for PIPM workflow
 * 
 * PIPM Flow:
 * 1. Client calls POST /api/payments/intent to create Payment Intent (this controller)
 * 2. Client creates Payment Method using public key (client-side)
 * 3. Client attaches Payment Method to Intent (see paymentAttach.controller.js)
 * 4. Handle 3DS redirect if needed
 * 5. Webhook confirms payment (see paymentWebhook.controller.js)
 */

import db from "../../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../../utils/errorHandler.js";
import * as paymongoService from "../../services/paymongoService.js";
import { ensureUserRole } from "../../utils/authHelpers.js";

// Environment configuration
const PAYMONGO_REDIRECT_BASE = (process.env.PAYMONGO_REDIRECT_BASE || process.env.FRONTEND_BASE_URL || "http://localhost:5173").replace(/\/$/, "");

/**
 * Initiate payment for an order using PIPM workflow
 * POST /api/payments/initiate
 * Body: { order_id: string }
 * Auth: Required (Tourist role)
 * 
 * This is the main entry point for payment initiation.
 * Returns payment_intent_id and client_key for frontend to complete payment.
 */
export async function initiatePayment(req, res) {
  try {
    const { order_id } = req.body;
    const user_id = req.user.id;

    // Validate input
    if (!order_id) {
      return res.status(400).json({ 
        success: false, 
        message: "order_id is required" 
      });
    }

    // 1. Fetch order details with payment info from payment table
    const [orderRows] = await db.query(
      `SELECT 
        o.id, o.order_number, o.user_id, o.business_id, o.total_amount, 
        o.status,
        p.status as payment_status,
        p.payment_method,
        p.payment_intent_id as paymongo_payment_intent_id,
        p.id as existing_payment_id
       FROM \`order\` o
       LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
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

    // Payment method validation:
    // - If payment record exists, use its payment_method
    // - If no payment record, get from request body (first payment initiation)
    // payment_method is the actual type: gcash, paymaya, card, cash_on_pickup
    const payment_method = order.payment_method || req.body.payment_method;
    
    // For PayMongo payments, payment_method should be one of the PayMongo types
    const paymongoTypes = ['gcash', 'paymaya', 'card'];
    const isPaymongoPayment = paymongoTypes.includes(payment_method);
    
    if (!isPaymongoPayment) {
      return res.status(400).json({ 
        success: false, 
        message: `Payment method must be a PayMongo type (gcash, paymaya, card), got: ${payment_method || 'none'}` 
      });
    }

    // Validate payment not already completed (check payment table)
    if (order.payment_status === 'paid') {
      return res.status(400).json({ 
        success: false, 
        message: "Payment already completed for this order" 
      });
    }

    // Check if a payment intent already exists (from payment table)
    if (order.paymongo_payment_intent_id) {
      // Retrieve existing payment intent status
      try {
        const existingIntent = await paymongoService.getPaymentIntent(order.paymongo_payment_intent_id);
        const intentStatus = existingIntent.attributes.status;

        // If intent is still awaiting payment, return it
        if (intentStatus === 'awaiting_payment_method' || intentStatus === 'awaiting_next_action') {
          return res.status(200).json({
            success: true,
            message: "Existing Payment Intent retrieved",
            data: {
              payment_id: order.existing_payment_id || null,
              payment_intent_id: order.paymongo_payment_intent_id,
              client_key: existingIntent.attributes.client_key,
              order_id: order.id,
              order_number: order.order_number,
              amount: order.total_amount,
              amount_centavos: Math.round(order.total_amount * 100),
              currency: 'PHP',
              payment_method_allowed: existingIntent.attributes.payment_method_allowed,
              status: intentStatus,
              public_key: process.env.PAYMONGO_PUBLIC_KEY
            }
          });
        }
      } catch (err) {
        console.log('[Payment] Existing intent not found or invalid, creating new one...');
      }
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
      payment_for: 'order',
      source: 'mobile_app'
    };

    // 4. Define allowed payment methods based on payment_method
    // If specific type is set, only allow that; otherwise allow all
    let allowedMethods = ['card', 'paymaya', 'gcash'];
    if (payment_method && ['gcash', 'paymaya', 'card'].includes(payment_method)) {
      allowedMethods = [payment_method];
    }

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

    // 6. NOTE: No longer updating order table with payment_intent_id
    // Payment table is the single source of truth for payment info

    // 7. Create payment record in database (single source of truth)
    // Using direct INSERT for flexibility - payment_method will be updated when user selects
    const payment_id = uuidv4();
    const created_at = new Date();

    // Map payment_method to valid enum - default to 'card' as placeholder
    // Will be updated when payment method is attached
    const paymentMethodMap = {
      'gcash': 'gcash',
      'paymaya': 'paymaya',
      'card': 'card'
    };
    const initialPaymentMethod = paymentMethodMap[payment_method] || 'card';

    await db.query(
      `INSERT INTO payment (
        id, payer_type, payment_type, payment_method, amount, status,
        payment_for, payer_id, payment_for_id, payment_intent_id, client_key,
        currency, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payment_id,
        'Tourist',                    // payer_type (valid enum)
        'Full Payment',               // payment_type (valid enum)
        initialPaymentMethod,         // payment_method (valid enum, will be updated on attach)
        order.total_amount,           // amount in PHP
        'pending',                    // status
        'order',                      // payment_for
        user_id,                      // payer_id
        order.id,                     // payment_for_id
        paymentIntentId,              // payment_intent_id
        clientKey,                    // client_key for 3DS
        'PHP',                        // currency
        JSON.stringify({ ...metadata, client_key: clientKey }),
        created_at,
        created_at
      ]
    );

    // 8. Return intent details to client (frontend will handle Payment Method creation and attachment)
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
    console.error("Error initiating payment:", error);
    
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
 * Create a Payment Intent for an order (explicit endpoint)
 * POST /api/payments/intent
 * Body: { order_id: string, payment_method_types?: string[] }
 * Auth: Required (Tourist role)
 * 
 * Similar to initiatePayment but allows specifying payment method types.
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

    // 1. Fetch order details with payment info from payment table
    const [orderRows] = await db.query(
      `SELECT 
        o.id, o.order_number, o.user_id, o.business_id, o.total_amount, 
        o.status,
        p.status as payment_status,
        p.payment_method
       FROM \`order\` o
       LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
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

    // Validate payment not already completed (from payment table)
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
      payment_for: 'order',
      source: 'payment_intent'
    };

    // 4. Define allowed payment methods
    const allowedMethods = payment_method_types || ['card', 'paymaya', 'gcash'];

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

    // 6. NOTE: No longer updating order table with payment_intent_id
    // Payment table is the single source of truth

    // 7. Create payment record in database (single source of truth)
    // Using direct INSERT for flexibility - payment_method will be updated when attached
    const payment_id = uuidv4();
    const created_at = new Date();

    await db.query(
      `INSERT INTO payment (
        id, payer_type, payment_type, payment_method, amount, status, 
        payment_for, payer_id, payment_for_id, payment_intent_id, client_key,
        currency, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payment_id,
        'Tourist',
        'Full Payment',
        'card', // Default placeholder, will be updated when payment method is attached
        order.total_amount,
        'pending',
        'order',
        user_id,
        order.id,
        paymentIntentId,
        clientKey,
        'PHP',
        JSON.stringify({ ...metadata, client_key: clientKey }),
        created_at,
        created_at
      ]
    );

    // 8. Return client_key for client-side operations
    res.status(201).json({
      success: true,
      message: "Payment Intent created successfully",
      data: {
        payment_id,
        payment_intent_id: paymentIntentId,
        client_key: clientKey,
        order_id: order.id,
        order_number: order.order_number,
        amount: order.total_amount,
        amount_centavos: amountInCentavos,
        currency: 'PHP',
        payment_method_allowed: allowedMethods,
        status: paymentIntent.attributes.status,
        public_key: process.env.PAYMONGO_PUBLIC_KEY
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
 * Retrieve Payment Intent status
 * GET /api/payments/intent/:id
 * Auth: Required
 */
export async function getPaymentIntentStatus(req, res) {
  try {
    const { id } = req.params; // Payment Intent ID
    const user_id = req.user.id;

    // 1. Find the order associated with this payment intent (from payment table)
    const [orderRows] = await db.query(
      `SELECT o.id, o.user_id, o.order_number, o.status,
              p.status as payment_status
       FROM \`order\` o 
       JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
       WHERE p.payment_intent_id = ?`,
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

export default {
  initiatePayment,
  createPaymentIntentForOrder,
  getPaymentIntentStatus
};
