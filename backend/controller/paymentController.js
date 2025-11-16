import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../utils/errorHandler.js";
import * as paymongoService from "../services/paymongoService.js";
import * as socketService from "../services/socketService.js";
import * as notificationHelper from "../services/notificationHelper.js";

// Environment configuration
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "http://localhost:5173";

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
      const userRole = req.user.role;
      
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
 * Initiate payment for an order
 * POST /api/payments/initiate
 * Body: { order_id: string }
 * Auth: Required (Tourist role)
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

    const metadata = {
      order_id: order.id,
      order_number: order.order_number,
      business_id: order.business_id,
      user_id: user_id
    };

    const successUrl = `${FRONTEND_BASE_URL}/orders/${order.id}/payment-success`;
    const failedUrl = `${FRONTEND_BASE_URL}/orders/${order.id}/payment-failed`;

    // 3. Create PayMongo source based on payment method type
    let paymongoResponse;
    let provider_reference;
    let checkout_url;

    if (['gcash', 'grab_pay', 'paymaya'].includes(order.payment_method_type)) {
      // Create source for e-wallet payments
      paymongoResponse = await paymongoService.createSource({
        amount: amountInCentavos,
        type: order.payment_method_type,
        currency: 'PHP',
        redirect: {
          success: successUrl,
          failed: failedUrl
        },
        metadata
      });

      provider_reference = paymongoResponse.data.id;
      checkout_url = paymongoResponse.data.attributes.redirect?.checkout_url;

      // Update order with source ID
      await db.query(
        `UPDATE \`order\` SET paymongo_source_id = ? WHERE id = ?`,
        [provider_reference, order.id]
      );

    } else if (order.payment_method_type === 'card') {
      // Create payment intent for card payments
      paymongoResponse = await paymongoService.createPaymentIntent({
        amount: amountInCentavos,
        currency: 'PHP',
        description: `Payment for order ${order.order_number}`,
        statement_descriptor: `Order ${order.order_number}`,
        metadata
      });

      provider_reference = paymongoResponse.data.id;
      
      // For card payments, client will need to create payment method and attach
      // We'll return the payment_intent_id for client-side completion
      checkout_url = null;

      // Update order with checkout ID (payment intent ID for cards)
      await db.query(
        `UPDATE \`order\` SET paymongo_checkout_id = ? WHERE id = ?`,
        [provider_reference, order.id]
      );

    } else {
      return res.status(400).json({ 
        success: false, 
        message: `Unsupported payment method type: ${order.payment_method_type}` 
      });
    }

    // 4. Create payment record in database
    const payment_id = uuidv4();
    const created_at = new Date();

    await db.query(
      `CALL InsertPayment(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payment_id,
        'Tourist',                    // payer_type
        'online',                     // payment_type
        order.payment_method_type,    // payment_method (gcash, card, etc.)
        order.total_amount,           // amount in PHP
        'pending',                    // status
        'order',                      // payment_for
        user_id,                      // payer_id
        order.id,                     // payment_for_id
        created_at
      ]
    );

    // Store provider reference
    await db.query(
      `UPDATE payment 
       SET provider_reference = ?, 
           currency = 'PHP', 
           metadata = ?
       WHERE id = ?`,
      [provider_reference, JSON.stringify(metadata), payment_id]
    );

    // 5. Return checkout URL or payment intent ID to client
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
        checkout_url,  // For e-wallets (gcash, grab_pay, paymaya)
        payment_intent_id: order.payment_method_type === 'card' ? provider_reference : null,  // For cards
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
      message: "Failed to initiate payment" 
    });
  }
}

/**
 * Handle PayMongo webhook events
 * POST /api/payments/webhook
 * No authentication required (signature-based verification)
 */
export async function handleWebhook(req, res) {
  try {
    const signature = req.headers['paymongo-signature'];
    const rawBody = req.rawBody; // Requires raw body parser middleware

    if (!signature) {
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

    // 1. Verify webhook signature
    const isValid = paymongoService.verifyWebhookSignature(rawBody, signature);
    
    if (!isValid) {
      console.warn("Invalid webhook signature received");
      return res.status(401).json({ 
        success: false, 
        message: "Invalid webhook signature" 
      });
    }

    // 2. Parse webhook event
    const event = paymongoService.parseWebhookEvent(rawBody);
    const eventId = event.id;
    const eventType = event.type;
    const eventData = event.data;

    console.log(`Received webhook event: ${eventType} (${eventId})`);

    // 3. Check for duplicate events (idempotency)
    const [existingEvents] = await db.query(
      `SELECT id, status FROM webhook_event WHERE provider_event_id = ?`,
      [eventId]
    );

    if (existingEvents && existingEvents.length > 0) {
      const existingEvent = existingEvents[0];
      console.log(`Duplicate webhook event detected: ${eventId}, status: ${existingEvent.status}`);
      
      // Return 200 to acknowledge receipt (already processed)
      return res.status(200).json({ 
        success: true, 
        message: "Event already processed" 
      });
    }

    // 4. Store webhook event
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

    // 5. Process event based on type
    try {
      await processWebhookEvent(eventType, eventData, webhook_id);

      // Mark as processed
      await db.query(
        `UPDATE webhook_event 
         SET status = 'processed', processed_at = ? 
         WHERE id = ?`,
        [new Date(), webhook_id]
      );

      res.status(200).json({ 
        success: true, 
        message: "Webhook processed successfully" 
      });

    } catch (processingError) {
      console.error("Error processing webhook event:", processingError);

      // Mark as failed
      await db.query(
        `UPDATE webhook_event 
         SET status = 'failed', processed_at = ? 
         WHERE id = ?`,
        [new Date(), webhook_id]
      );

      // Still return 200 to acknowledge receipt
      res.status(200).json({ 
        success: true, 
        message: "Webhook received but processing failed" 
      });
    }

  } catch (error) {
    console.error("Error handling webhook:", error);
    
    // Return 200 to avoid retries for unrecoverable errors
    res.status(200).json({ 
      success: false, 
      message: "Webhook handling error" 
    });
  }
}

/**
 * Process webhook event based on type
 * Internal helper function
 */
async function processWebhookEvent(eventType, eventData, webhook_id) {
  const resourceType = eventData.attributes?.type || eventType.split('.')[0];
  const status = eventData.attributes?.status;
  const metadata = eventData.attributes?.metadata || {};
  const order_id = metadata.order_id;

  console.log(`Processing ${eventType} for order ${order_id}, status: ${status}`);

  // Handle source.chargeable event (e-wallets like GCash)
  if (eventType === 'source.chargeable') {
    if (!order_id) {
      throw new Error("Missing order_id in webhook metadata");
    }

    // Update payment status to paid
    await db.query(
      `UPDATE payment 
       SET status = 'paid', updated_at = ? 
       WHERE payment_for = 'order' 
         AND payment_for_id = ? 
         AND provider_reference = ?`,
      [new Date(), order_id, eventData.id]
    );

    // Update order payment status
    await db.query(
      `UPDATE \`order\` 
       SET payment_status = 'paid' 
       WHERE id = ?`,
      [order_id]
    );

    console.log(`Order ${order_id} marked as paid (source.chargeable)`);

    // ========== Socket.IO Event (Phase 5) ==========
    // Fetch order details for socket emission
    const [orderRows] = await db.query(
      `SELECT id, order_number, business_id, user_id, status, payment_status FROM \`order\` WHERE id = ?`,
      [order_id]
    );
    
    if (orderRows && orderRows.length > 0) {
      const order = orderRows[0];
      
      try {
        const paymentObj = { 
          id: eventData.id, 
          payment_for_id: order_id, 
          status: 'paid', 
          payment_method: 'paymongo', 
          amount: eventData.attributes?.amount / 100 
        };
        
        socketService.emitPaymentUpdated(paymentObj, order);
        socketService.emitOrderUpdated(order, null);
        
        // Trigger notifications
        await notificationHelper.triggerPaymentUpdateNotifications(paymentObj, order);
      } catch (socketError) {
        console.error('Failed to emit payment updated event:', socketError);
      }
    }
  }

  // Handle payment.paid event (card payments)
  else if (eventType === 'payment.paid') {
    if (!order_id) {
      throw new Error("Missing order_id in webhook metadata");
    }

    // Update payment status to paid
    await db.query(
      `UPDATE payment 
       SET status = 'paid', updated_at = ? 
       WHERE payment_for = 'order' 
         AND payment_for_id = ? 
         AND provider_reference = ?`,
      [new Date(), order_id, eventData.id]
    );

    // Update order payment status
    await db.query(
      `UPDATE \`order\` 
       SET payment_status = 'paid' 
       WHERE id = ?`,
      [order_id]
    );

    console.log(`Order ${order_id} marked as paid (payment.paid)`);

    // ========== Socket.IO Event (Phase 5) ==========
    // Fetch order details for socket emission
    const [orderRows2] = await db.query(
      `SELECT id, order_number, business_id, user_id, status, payment_status FROM \`order\` WHERE id = ?`,
      [order_id]
    );
    
    if (orderRows2 && orderRows2.length > 0) {
      const order = orderRows2[0];
      
      try {
        const paymentObj = { 
          id: eventData.id, 
          payment_for_id: order_id, 
          status: 'paid', 
          payment_method: 'paymongo', 
          amount: eventData.attributes?.amount / 100 
        };
        
        socketService.emitPaymentUpdated(paymentObj, order);
        socketService.emitOrderUpdated(order, null);
        
        // Trigger notifications
        await notificationHelper.triggerPaymentUpdateNotifications(paymentObj, order);
      } catch (socketError) {
        console.error('Failed to emit payment updated event:', socketError);
      }
    }

  // Handle payment.failed event
  else if (eventType === 'payment.failed') {
    if (!order_id) {
      throw new Error("Missing order_id in webhook metadata");
    }

    // Update payment status to failed
    await db.query(
      `UPDATE payment 
       SET status = 'failed', updated_at = ? 
       WHERE payment_for = 'order' 
         AND payment_for_id = ? 
         AND provider_reference = ?`,
      [new Date(), order_id, eventData.id]
    );

    // Update order payment status and status
    await db.query(
      `UPDATE \`order\` 
       SET payment_status = 'failed', 
           status = 'failed_payment' 
       WHERE id = ?`,
      [order_id]
    );

    console.log(`Order ${order_id} marked as failed payment`);
  }

  // Handle refund events
  else if (eventType === 'refund.updated' && status === 'succeeded') {
    const payment_intent_id = eventData.attributes?.payment_id;
    
    if (payment_intent_id) {
      // Update payment status to refunded
      await db.query(
        `UPDATE payment 
         SET status = 'refunded', 
             refund_reference = ?, 
             updated_at = ? 
         WHERE provider_reference = ?`,
        [eventData.id, new Date(), payment_intent_id]
      );

      // Find order and update payment status
      const [paymentRows] = await db.query(
        `SELECT payment_for_id FROM payment 
         WHERE provider_reference = ? AND payment_for = 'order'`,
        [payment_intent_id]
      );

      if (paymentRows && paymentRows.length > 0) {
        const order_id = paymentRows[0].payment_for_id;
        
        await db.query(
          `UPDATE \`order\` 
           SET payment_status = 'refunded' 
           WHERE id = ?`,
          [order_id]
        );

        console.log(`Order ${order_id} refund completed`);
      }
    }
  }

  else {
    console.log(`Unhandled webhook event type: ${eventType}`);
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
        p.provider_reference, p.payment_method, p.currency
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

    if (!payment.provider_reference) {
      return res.status(400).json({ 
        success: false, 
        message: "Payment has no provider reference (not processed via PayMongo)" 
      });
    }

    // 3. Call PayMongo refund API
    const amountInCentavos = Math.round(payment.amount * 100);
    
    const refundMetadata = {
      payment_id: payment.id,
      payment_for: payment.payment_for,
      payment_for_id: payment.payment_for_id,
      refund_reason: reason || 'Order cancellation',
      refund_notes: notes || ''
    };

    const refundResponse = await paymongoService.createRefund({
      payment_id: payment.provider_reference,
      amount: amountInCentavos,
      reason: reason || 'requested_by_customer',
      notes: notes || '',
      metadata: refundMetadata
    });

    const refund_id = refundResponse.data.id;
    const refund_status = refundResponse.data.attributes.status;

    // 4. Update payment record
    await db.query(
      `UPDATE payment 
       SET status = 'refunded', 
           refund_reference = ?, 
           metadata = JSON_SET(COALESCE(metadata, '{}'), '$.refund_reason', ?, '$.refund_notes', ?),
           updated_at = ? 
       WHERE id = ?`,
      [refund_id, reason || '', notes || '', new Date(), id]
    );

    // 5. Update order payment status (if applicable)
    if (payment.payment_for === 'order') {
      await db.query(
        `UPDATE \`order\` 
         SET payment_status = 'refunded' 
         WHERE id = ?`,
        [payment.payment_for_id]
      );
    }

    res.status(200).json({
      success: true,
      message: "Refund initiated successfully",
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
        message: "Payment provider error. Please try again later." 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: "Failed to initiate refund" 
    });
  }
}

