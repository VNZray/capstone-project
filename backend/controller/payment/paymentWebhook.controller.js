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
 * 
 * Architecture: This controller is THIN - it handles HTTP concerns only.
 * All business logic is delegated to PaymentFulfillmentService.
 * @see services/paymentFulfillmentService.js
 */

import db from "../../db.js";
import { v4 as uuidv4 } from "uuid";
import * as paymongoService from "../../services/paymongoService.js";
import * as webhookQueueService from "../../services/webhookQueueService.js";
import * as paymentFulfillmentService from "../../services/paymentFulfillmentService.js";

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
 * 
 * This is a THIN controller function - delegates all business logic to PaymentFulfillmentService.
 * 
 * @param {string} eventType - The PayMongo event type
 * @param {object} eventData - The event data from PayMongo
 * @param {string} webhook_id - The webhook event ID stored in our database (unused, kept for API compatibility)
 */
export async function processWebhookEvent(eventType, eventData, webhook_id) {
  const paymentId = eventData.id;
  const paymentIntentId = eventData.attributes?.payment_intent_id;

  console.log(`[Webhook Controller] 📬 Routing ${eventType} to PaymentFulfillmentService`);

  // ========== Payment Intent Events (PIPM Flow) ==========
  
  if (eventType === 'payment.paid') {
    await paymentFulfillmentService.handlePaymentPaid({
      paymentIntentId,
      paymentId,
      eventData,
    });
  }
  
  else if (eventType === 'payment.failed') {
    await paymentFulfillmentService.handlePaymentFailed({
      paymentIntentId,
      paymentId,
      eventData,
    });
  }

  // ========== Refund Events ==========
  
  else if (eventType === 'refund.updated' && eventData.attributes?.status === 'succeeded') {
    const refundId = eventData.id;
    await paymentFulfillmentService.handleRefundSucceeded({
      refundId,
      eventData,
    });
  }

  else {
    console.log(`[Webhook Controller] ⚠️ Unhandled webhook event type: ${eventType}`);
  }
}

export default {
  handleWebhook,
  processWebhookEvent
};
