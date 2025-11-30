/**
 * Webhook Processor
 * 
 * Handles async processing of PayMongo webhook events via Bull queue.
 * This module delegates to the processWebhookEvent function in paymentController
 * to maintain a single source of truth for webhook processing logic.
 * 
 * @see docs/ORDERING_SYSTEM_AUDIT.md - Phase 3
 */

import db from '../db.js';
import { processWebhookEvent } from '../controller/paymentController.js';

/**
 * Process a single webhook job
 * Called by webhookQueueService when processing enqueued webhook events
 * 
 * @param {Object} params - Job parameters
 * @param {string} params.eventType - PayMongo event type
 * @param {Object} params.eventData - Event data from PayMongo
 * @param {string} params.eventId - PayMongo event ID
 * @param {string} params.webhookDbId - UUID of the webhook_event record
 * @param {Object} [params.rawPayload] - Raw webhook payload
 * @returns {Promise<Object>} Processing result
 */
export async function processWebhookJob({ eventType, eventData, eventId, webhookDbId, rawPayload }) {
  console.log(`[WebhookProcessor] 🔄 Processing webhook job: ${eventType} (${eventId})`);
  const startTime = Date.now();

  try {
    // Delegate to the payment controller's processWebhookEvent
    await processWebhookEvent(eventType, eventData, webhookDbId);

    // Update webhook_event record as processed
    await db.query(
      `UPDATE webhook_event 
       SET status = 'processed', processed_at = ? 
       WHERE id = ?`,
      [new Date(), webhookDbId]
    );

    const processingTime = Date.now() - startTime;
    console.log(`[WebhookProcessor] ✅ ${eventType} processed in ${processingTime}ms`);

    return { success: true, eventType, eventId, processingTime };

  } catch (error) {
    console.error(`[WebhookProcessor] ❌ Error processing ${eventType}:`, error);

    // Update webhook_event record as failed
    await db.query(
      `UPDATE webhook_event 
       SET status = 'failed', 
           processed_at = ?,
           processing_result = ?
       WHERE id = ?`,
      [new Date(), JSON.stringify({ error: error.message }), webhookDbId]
    );

    // Re-throw to trigger Bull retry mechanism
    throw error;
  }
}

/**
 * Register the queue processor
 * Called during server startup to attach the job processor to the Bull queue
 * 
 * @param {Queue} queue - Bull queue instance
 */
export function registerProcessor(queue) {
  queue.process('webhook', async (job) => {
    const { webhookId, eventId, eventType, event } = job.data;
    
    console.log(`[WebhookProcessor] 🔄 Processing job ${job.id}: ${eventType}`);
    const startTime = Date.now();

    try {
      // Delegate to the payment controller's processWebhookEvent
      await processWebhookEvent(eventType, event.data, webhookId);

      // Update webhook_event record as processed
      await db.query(
        `UPDATE webhook_event 
         SET status = 'processed', processed_at = ? 
         WHERE id = ?`,
        [new Date(), webhookId]
      );

      const processingTime = Date.now() - startTime;
      console.log(`[WebhookProcessor] ✅ ${eventType} processed in ${processingTime}ms`);

      return { success: true, eventType, eventId, processingTime };

    } catch (error) {
      console.error(`[WebhookProcessor] ❌ Error processing ${eventType}:`, error);

      // Update webhook_event record as failed
      await db.query(
        `UPDATE webhook_event 
         SET status = 'failed', 
             processed_at = ?,
             processing_result = ?
         WHERE id = ?`,
        [new Date(), JSON.stringify({ error: error.message }), webhookId]
      );

      // Re-throw to trigger Bull retry mechanism
      throw error;
    }
  });

  // Event listeners for monitoring
  queue.on('completed', (job, result) => {
    console.log(`[WebhookProcessor] ✅ Job ${job.id} completed:`, result?.eventType);
  });

  queue.on('failed', (job, err) => {
    console.error(`[WebhookProcessor] ❌ Job ${job.id} failed:`, err.message);
  });

  queue.on('stalled', (job) => {
    console.warn(`[WebhookProcessor] ⚠️ Job ${job.id} stalled`);
  });

  console.log('[WebhookProcessor] ✅ Queue processor registered');
}

export default {
  processWebhookJob,
  registerProcessor
};
