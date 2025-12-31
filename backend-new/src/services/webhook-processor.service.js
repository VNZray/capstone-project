/**
 * Webhook Processor Service
 * Processes webhooks from the queue
 */
import * as paymongoService from './paymongo.service.js';
import * as paymentFulfillmentService from './payment-fulfillment.service.js';
import * as webhookQueueService from './webhook-queue.service.js';
import { sequelize, WebhookEvent } from '../models/index.js';
import logger from '../config/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Start processing webhooks
 */
export function startProcessor() {
  const queue = webhookQueueService.getQueue();

  if (!queue) {
    logger.error('Cannot start processor: queue not initialized');
    return;
  }

  // Register processor for PayMongo webhooks
  queue.process('paymongo', async (job) => {
    return await processPaymongoWebhook(job);
  });

  logger.info('Webhook processor started');
}

/**
 * Process a PayMongo webhook
 * @param {Object} job - Bull job
 * @returns {Promise<Object>}
 */
async function processPaymongoWebhook(job) {
  const { eventId, eventType, resource, raw } = job.data.data;

  logger.info(`Processing PayMongo webhook: ${eventType} (${eventId})`);

  // Record webhook event
  const webhookRecord = await recordWebhookEvent({
    provider: 'paymongo',
    eventId,
    eventType,
    payload: raw,
    status: 'processing',
  });

  try {
    let result;

    switch (eventType) {
      case 'payment.paid':
        result = await handlePaymentPaid(resource);
        break;

      case 'payment.failed':
        result = await handlePaymentFailed(resource);
        break;

      case 'source.chargeable':
        result = await handleSourceChargeable(resource);
        break;

      case 'source.cancelled':
      case 'source.expired':
      case 'source.failed':
        result = await handleSourceFailed(resource, eventType);
        break;

      case 'payment_intent.payment_failed':
        result = await handlePaymentIntentFailed(resource);
        break;

      case 'refund.succeeded':
        result = await handleRefundSucceeded(resource);
        break;

      default:
        logger.debug(`Unhandled webhook type: ${eventType}`);
        result = { handled: false, reason: 'unhandled_event_type' };
    }

    // Update webhook record
    await updateWebhookEvent(webhookRecord.id, {
      status: 'completed',
      processed_at: new Date(),
      result: JSON.stringify(result),
    });

    return result;
  } catch (error) {
    logger.error(`Webhook processing error for ${eventId}:`, error);

    await updateWebhookEvent(webhookRecord.id, {
      status: 'failed',
      error_message: error.message,
    });

    throw error;
  }
}

/**
 * Handle payment.paid event
 * @param {Object} resource - Payment resource
 */
async function handlePaymentPaid(resource) {
  const paymentId = resource.attributes?.metadata?.payment_id;
  const paymongoPaymentId = resource.id;

  if (!paymentId) {
    logger.warn('No payment_id in payment metadata, checking by PayMongo ID');

    // Try to find by PayMongo payment intent ID
    const intentId = resource.attributes?.payment_intent_id;
    if (intentId) {
      const [payment] = await sequelize.query(
        `SELECT id FROM payment WHERE paymongo_intent_id = ?`,
        { replacements: [intentId], type: sequelize.QueryTypes.SELECT }
      );

      if (payment) {
        return await paymentFulfillmentService.fulfillPayment(payment.id, {
          paymongo_payment_id: paymongoPaymentId,
          payment_method: resource.attributes?.source?.type || 'card',
        });
      }
    }

    return { handled: false, reason: 'payment_not_found' };
  }

  return await paymentFulfillmentService.fulfillPayment(paymentId, {
    paymongo_payment_id: paymongoPaymentId,
    payment_method: resource.attributes?.source?.type || 'card',
  });
}

/**
 * Handle payment.failed event
 * @param {Object} resource - Payment resource
 */
async function handlePaymentFailed(resource) {
  const paymentId = resource.attributes?.metadata?.payment_id;

  if (!paymentId) {
    return { handled: false, reason: 'payment_not_found' };
  }

  return await paymentFulfillmentService.handlePaymentFailure(paymentId, {
    reason: resource.attributes?.last_payment_error?.message || 'Payment failed',
  });
}

/**
 * Handle source.chargeable event
 * @param {Object} resource - Source resource
 */
async function handleSourceChargeable(resource) {
  const sourceId = resource.id;

  return await paymentFulfillmentService.processSourcePayment(sourceId, {
    status: 'chargeable',
    type: resource.attributes?.type,
  });
}

/**
 * Handle source failure events
 * @param {Object} resource - Source resource
 * @param {string} eventType - Event type
 */
async function handleSourceFailed(resource, eventType) {
  const sourceId = resource.id;
  const status = eventType.replace('source.', '');

  return await paymentFulfillmentService.processSourcePayment(sourceId, {
    status,
    type: resource.attributes?.type,
  });
}

/**
 * Handle payment_intent.payment_failed event
 * @param {Object} resource - Payment intent resource
 */
async function handlePaymentIntentFailed(resource) {
  const intentId = resource.id;

  const [payment] = await sequelize.query(
    `SELECT id FROM payment WHERE paymongo_intent_id = ?`,
    { replacements: [intentId], type: sequelize.QueryTypes.SELECT }
  );

  if (!payment) {
    return { handled: false, reason: 'payment_not_found' };
  }

  return await paymentFulfillmentService.handlePaymentFailure(payment.id, {
    reason: resource.attributes?.last_payment_error?.message || 'Payment intent failed',
  });
}

/**
 * Handle refund.succeeded event
 * @param {Object} resource - Refund resource
 */
async function handleRefundSucceeded(resource) {
  const refundId = resource.attributes?.metadata?.refund_id;

  if (refundId) {
    await sequelize.query(
      `UPDATE refund SET status = 'completed', completed_at = NOW() WHERE id = ?`,
      { replacements: [refundId] }
    );

    logger.info(`Refund ${refundId} marked as completed via webhook`);
    return { handled: true, refundId };
  }

  return { handled: false, reason: 'refund_not_found' };
}

/**
 * Record a webhook event
 * @param {Object} data - Event data
 * @returns {Promise<Object>}
 */
async function recordWebhookEvent(data) {
  try {
    const [result] = await sequelize.query(
      `INSERT INTO webhook_events (id, provider, event_id, event_type, payload, status, received_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      {
        replacements: [
          uuidv4(),
          data.provider,
          data.eventId,
          data.eventType,
          JSON.stringify(data.payload),
          data.status,
        ],
        type: sequelize.QueryTypes.INSERT,
      }
    );

    return { id: result };
  } catch (error) {
    logger.error('Failed to record webhook event:', error);
    return { id: null };
  }
}

/**
 * Update a webhook event
 * @param {string} id - Event ID
 * @param {Object} data - Update data
 */
async function updateWebhookEvent(id, data) {
  if (!id) return;

  try {
    const updates = [];
    const replacements = [];

    for (const [key, value] of Object.entries(data)) {
      updates.push(`${key} = ?`);
      replacements.push(value);
    }

    replacements.push(id);

    await sequelize.query(
      `UPDATE webhook_events SET ${updates.join(', ')} WHERE id = ?`,
      { replacements }
    );
  } catch (error) {
    logger.error('Failed to update webhook event:', error);
  }
}

export default {
  startProcessor,
};
