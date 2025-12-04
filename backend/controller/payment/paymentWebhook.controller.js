/**
 * Payment Webhook Controller
 * Handles PayMongo webhook events for PIPM workflow
 * 
 * PIPM Events handled:
 * - payment.paid: Payment successful
 * - payment.failed: Payment failed
 * - refund.updated: Refund status changed
 * 
 * Legacy events REMOVED:
 * - checkout_session.payment.paid (use payment.paid)
 * - source.chargeable (use payment.paid)
 */

import db from "../../db.js";
import { v4 as uuidv4 } from "uuid";
import * as paymongoService from "../../services/paymongoService.js";
import * as socketService from "../../services/socketService.js";
import * as notificationHelper from "../../services/notificationHelper.js";
import * as auditService from "../../services/auditService.js";
import * as webhookQueueService from "../../services/webhookQueueService.js";

/**
 * Handle PayMongo webhook events
 * POST /api/payments/webhook
 * No authentication required (signature-based verification)
 * 
 * BEST PRACTICE: Respond immediately with HTTP 200, then process asynchronously
 */
export async function handleWebhook(req, res) {
  console.log('[Webhook] 📨 Received PayMongo webhook request');
  
  try {
    const signature = req.headers['paymongo-signature'];
    const rawBody = req.rawBody;

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

    // 1. Verify webhook signature
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
      
      return res.status(200).json({ 
        success: true, 
        message: "Event already processed" 
      });
    }

    // 4. Store webhook event immediately
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

    // 5. Enqueue for async processing
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
      // Fallback: Process synchronously
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

    // 6. Respond immediately
    res.status(200).json({ 
      success: true, 
      message: "Webhook received and queued for processing" 
    });

  } catch (error) {
    console.error("[Webhook] ❌ Error handling webhook:", error);
    
    res.status(200).json({ 
      success: false, 
      message: "Webhook handling error" 
    });
  }
}

/**
 * Process webhook event based on type
 * Exported for use by the webhook queue processor
 * @param {string} eventType - The PayMongo event type
 * @param {object} eventData - The event data from PayMongo
 * @param {string} webhook_id - The webhook event ID stored in our database
 */
export async function processWebhookEvent(eventType, eventData, webhook_id) {
  const metadata = eventData.attributes?.metadata || {};
  const order_id = metadata.order_id;
  const booking_id = metadata.booking_id;
  const payment_for = metadata.payment_for || (booking_id ? 'booking' : 'order');
  const reference_id = payment_for === 'booking' ? booking_id : order_id;

  console.log(`[Webhook Processor] Processing ${eventType} for ${payment_for} ${reference_id}`);

  // ========== Payment Intent Events (PIPM Flow) ==========
  
  // Handle payment.paid event
  if (eventType === 'payment.paid') {
    if (!reference_id) {
      console.warn("Missing order_id or booking_id in payment.paid metadata");
      // Try to find via payment_intent_id
      const paymentIntentId = eventData.attributes?.payment_intent_id;
      if (paymentIntentId) {
        await handlePaymentPaidWithoutMetadata(eventData, paymentIntentId);
      }
      return;
    }

    const paymentId = eventData.id;
    const paymentIntentId = eventData.attributes?.payment_intent_id;
    const paymentAmount = eventData.attributes?.amount;
    const paymentFee = eventData.attributes?.fee || 0;
    const paymentNetAmount = eventData.attributes?.net_amount || 0;

    console.log(`[Webhook] 💳 Processing payment.paid for ${payment_for} ${reference_id}`);
    console.log(`[Webhook] 🔑 Payment ID: ${paymentId}, Intent: ${paymentIntentId}`);
    console.log(`[Webhook] 💰 Amount: ₱${paymentAmount / 100}`);

    // Update payment record status to paid
    await db.query(
      `UPDATE payment 
       SET status = 'paid', 
           paymongo_payment_id = ?,
           metadata = JSON_SET(
             COALESCE(metadata, '{}'),
             '$.paymongo_payment_status', 'paid',
             '$.paymongo_amount_centavos', ?,
             '$.paymongo_fee', ?,
             '$.paymongo_net_amount', ?,
             '$.payment_intent_id', ?,
             '$.webhook_processed_at', ?
           ),
           updated_at = ? 
       WHERE payment_for = ? 
         AND payment_for_id = ?`,
      [
        paymentId, 
        paymentAmount, 
        paymentFee, 
        paymentNetAmount,
        paymentIntentId || '', 
        new Date().toISOString(), 
        new Date(), 
        payment_for, 
        reference_id
      ]
    );

    // Update the relevant table based on payment type
    // NOTE: Payment table is single source of truth for payment status
    // Order table no longer stores payment_status or paymongo_payment_id
    if (payment_for === 'booking') {
      await db.query(
        `UPDATE booking 
         SET booking_status = 'Confirmed',
             balance = GREATEST(0, balance - ?)
         WHERE id = ?`,
        [paymentAmount / 100, reference_id]
      );
      console.log(`[Webhook] ✅ Booking ${reference_id} marked as Confirmed`);
    } else {
      // Order table only needs updated_at timestamp
      // Payment status is tracked in payment table
      await db.query(
        `UPDATE \`order\` 
         SET updated_at = ?
         WHERE id = ?`,
        [new Date(), reference_id]
      );
      console.log(`[Webhook] ✅ Order ${reference_id} payment confirmed (payment table updated)`);
    }

    // Audit Logging
    await auditService.logPaymentUpdate({
      orderId: reference_id,
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

    // Emit real-time events for orders
    if (payment_for === 'order') {
      await emitPaymentEvents(reference_id, paymentId, 'paid', paymentAmount);
      await emitNewOrderNotification(reference_id);
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
    console.log(`[Webhook] ❌ Failure: ${failedCode} - ${failedMessage}`);
    
    // Resolve reference_id if not in metadata
    let resolvedReferenceId = reference_id;
    let resolvedPaymentFor = payment_for;
    
    if (!resolvedReferenceId) {
      console.log('[Webhook] ⚠️ No reference_id in payment.failed metadata, querying database...');
      
      try {
        // Try to find via payment table (single source of truth)
        const [paymentRows] = await db.query(
          `SELECT payment_for_id, payment_for FROM payment 
           WHERE (paymongo_payment_id = ? OR payment_intent_id = ?) 
           LIMIT 1`,
          [paymentId, paymentIntentId]
        );
        
        if (paymentRows && paymentRows.length > 0) {
          resolvedReferenceId = paymentRows[0].payment_for_id;
          resolvedPaymentFor = paymentRows[0].payment_for;
        }
        
        if (!resolvedReferenceId) {
          console.warn('[Webhook] ❌ Could not find order or booking for payment.failed event');
          
          // Still update payment record if possible
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
             WHERE paymongo_payment_id = ? OR payment_intent_id = ?`,
            [paymentId, failedCode, failedMessage, new Date(), paymentId, paymentIntentId]
          );
          return;
        }
      } catch (err) {
        console.error('[Webhook] Error querying for reference_id:', err);
        return;
      }
    }

    // Update payment status to failed
    await db.query(
      `UPDATE payment 
       SET status = 'failed', 
           paymongo_payment_id = ?,
           metadata = JSON_SET(
             COALESCE(metadata, '{}'),
             '$.failed_code', ?,
             '$.failed_message', ?,
             '$.webhook_processed_at', ?
           ),
           updated_at = ? 
       WHERE payment_for = ?
         AND payment_for_id = ?`,
      [paymentId, failedCode, failedMessage, new Date().toISOString(), new Date(), resolvedPaymentFor, resolvedReferenceId]
    );

    // Update order or booking status
    // NOTE: Payment table is single source of truth for payment status
    if (resolvedPaymentFor === 'booking') {
      await db.query(
        `UPDATE booking SET booking_status = 'Payment Failed' WHERE id = ?`,
        [resolvedReferenceId]
      );
      console.log(`[Webhook] 💔 Booking ${resolvedReferenceId} marked as Payment Failed`);
    } else {
      // Only update order status, payment_status is tracked in payment table
      await db.query(
        `UPDATE \`order\` 
         SET status = 'failed_payment',
             updated_at = ?
         WHERE id = ?`,
        [new Date(), resolvedReferenceId]
      );
      console.log(`[Webhook] 💔 Order ${resolvedReferenceId} marked as failed payment`);
    }

    // Audit Logging
    try {
      await auditService.logPaymentUpdate({
        orderId: resolvedReferenceId,
        oldStatus: resolvedPaymentFor === 'booking' ? 'Pending' : 'unpaid',
        newStatus: 'failed',
        actor: null,
        paymentDetails: {
          paymongo_payment_id: paymentId,
          failed_code: failedCode,
          failed_message: failedMessage,
          webhook_event_type: 'payment.failed',
          payment_for: resolvedPaymentFor
        }
      });
    } catch (auditErr) {
      console.log(`[Webhook] ⚠️ Audit logging skipped: ${auditErr.message}`);
    }

    // Emit real-time events for orders
    if (resolvedPaymentFor === 'order') {
      await emitPaymentEvents(resolvedReferenceId, paymentId, 'failed', eventData.attributes?.amount);
    }
  }

  // ========== Refund Events ==========
  
  else if (eventType === 'refund.updated' && eventData.attributes?.status === 'succeeded') {
    const payment_id = eventData.attributes?.payment_id;
    const refundId = eventData.id;
    const refundAmount = eventData.attributes?.amount;
    
    if (payment_id) {
      // Update payment status to refunded (single source of truth)
      await db.query(
        `UPDATE payment 
         SET status = 'refunded', 
             refund_reference = ?, 
             updated_at = ? 
         WHERE paymongo_payment_id = ?`,
        [refundId, new Date(), payment_id]
      );

      // Find order for notifications
      const [paymentRows] = await db.query(
        `SELECT payment_for_id FROM payment 
         WHERE paymongo_payment_id = ? AND payment_for = 'order'`,
        [payment_id]
      );

      if (paymentRows && paymentRows.length > 0) {
        const order_id = paymentRows[0].payment_for_id;
        
        // NOTE: Order payment_status is no longer updated here
        // Payment table is the single source of truth
        await db.query(
          `UPDATE \`order\` SET updated_at = ? WHERE id = ?`,
          [new Date(), order_id]
        );

        console.log(`[Webhook] ✅ Order ${order_id} refund completed (refund: ${refundId})`);

        // Audit Logging
        await auditService.logPaymentUpdate({
          orderId: order_id,
          oldStatus: 'paid',
          newStatus: 'refunded',
          actor: null,
          paymentDetails: {
            refund_id: refundId,
            refund_amount: refundAmount / 100,
            webhook_event_type: 'refund.updated'
          }
        });

        // Emit real-time events
        await emitPaymentEvents(order_id, payment_id, 'refunded', refundAmount);
      }
    }
  }

  else {
    console.log(`[Webhook] ⚠️ Unhandled webhook event type: ${eventType}`);
  }
}

/**
 * Handle payment.paid when metadata is missing - lookup by payment_intent_id
 */
async function handlePaymentPaidWithoutMetadata(eventData, paymentIntentId) {
  console.log(`[Webhook] Looking up order/booking by payment_intent_id: ${paymentIntentId}`);
  
  // Look up via payment table (single source of truth)
  const [paymentRows] = await db.query(
    `SELECT payment_for_id, payment_for FROM payment WHERE payment_intent_id = ?`,
    [paymentIntentId]
  );
  
  if (paymentRows && paymentRows.length > 0) {
    const payment = paymentRows[0];
    const paymentId = eventData.id;
    const paymentAmount = eventData.attributes?.amount;
    const paymentFee = eventData.attributes?.fee || 0;
    const paymentNetAmount = eventData.attributes?.net_amount || 0;
    
    // Update payment record (single source of truth)
    await db.query(
      `UPDATE payment 
       SET status = 'paid', 
           paymongo_payment_id = ?,
           metadata = JSON_SET(
             COALESCE(metadata, '{}'),
             '$.paymongo_payment_status', 'paid',
             '$.paymongo_amount_centavos', ?,
             '$.paymongo_fee', ?,
             '$.paymongo_net_amount', ?,
             '$.webhook_processed_at', ?
           ),
           updated_at = ? 
       WHERE payment_intent_id = ?`,
      [paymentId, paymentAmount, paymentFee, paymentNetAmount, new Date().toISOString(), new Date(), paymentIntentId]
    );
    
    if (payment.payment_for === 'order') {
      // Update order timestamp only (payment table is single source of truth)
      await db.query(
        `UPDATE \`order\` SET updated_at = ? WHERE id = ?`,
        [new Date(), payment.payment_for_id]
      );
      
      console.log(`[Webhook] ✅ Order ${payment.payment_for_id} payment confirmed via payment table lookup`);
      await emitPaymentEvents(payment.payment_for_id, paymentId, 'paid', paymentAmount);
      await emitNewOrderNotification(payment.payment_for_id);
    } else if (payment.payment_for === 'booking') {
      await db.query(
        `UPDATE booking 
         SET booking_status = 'Confirmed',
             balance = GREATEST(0, balance - ?)
         WHERE id = ?`,
        [paymentAmount / 100, payment.payment_for_id]
      );
      console.log(`[Webhook] ✅ Booking ${payment.payment_for_id} marked as Confirmed via payment table lookup`);
    }
  } else {
    console.warn(`[Webhook] ❌ Could not find payment record for payment_intent_id: ${paymentIntentId}`);
  }
}

/**
 * Helper: Emit real-time payment events
 */
async function emitPaymentEvents(order_id, payment_id, status, amount) {
  try {
    const [orderRows] = await db.query(
      `SELECT o.id, o.order_number, o.business_id, o.user_id, o.status,
              p.status as payment_status, p.payment_method
       FROM \`order\` o
       LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
       WHERE o.id = ?`,
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
      
      await notificationHelper.triggerPaymentUpdateNotifications(paymentObj, order);
    }
  } catch (error) {
    console.error('[Webhook] Failed to emit payment events:', error);
  }
}

/**
 * Helper: Emit new order notification after payment confirmed
 */
async function emitNewOrderNotification(order_id) {
  try {
    const [orderRows] = await db.query(
      `SELECT o.*, u.email as user_email FROM \`order\` o 
       JOIN user u ON u.id = o.user_id 
       WHERE o.id = ?`,
      [order_id]
    );
    
    if (orderRows && orderRows.length > 0) {
      const order = orderRows[0];
      
      const [itemsResult] = await db.query(
        "SELECT * FROM order_item WHERE order_id = ?",
        [order_id]
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
}

export default {
  handleWebhook,
  processWebhookEvent
};
