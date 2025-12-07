/**
 * Webhook Queue Service
 *
 * Provides background job processing for PayMongo webhook events.
 * Follows PayMongo best practice: "Respond immediately with HTTP 2xx, perform processing after"
 *
 * Uses Bull queue backed by Redis for reliable async processing with:
 * - Automatic retries with exponential backoff
 * - Job persistence across server restarts
 * - Concurrent job processing
 * - Dead letter queue for failed jobs
 *
 * @see docs/ORDERING_SYSTEM_AUDIT.md - Phase 3
 */

import Queue from 'bull';
import { processWebhookJob } from './webhookProcessor.js';

// Redis configuration from environment
const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB) || 0,
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  retryStrategy: (times) => {
    // Retry connection with exponential backoff, max 30 seconds
    const delay = Math.min(times * 1000, 30000);
    console.log(`[WebhookQueue] Redis connection retry ${times}, delay: ${delay}ms`);
    return delay;
  }
};

// Queue configuration
const QUEUE_OPTIONS = {
  redis: REDIS_CONFIG,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000 // Start with 5 seconds, then 10s, 20s...
    },
    removeOnComplete: 100, // Keep last 100 completed jobs for debugging
    removeOnFail: 500 // Keep last 500 failed jobs for analysis
  },
  settings: {
    stalledInterval: 30000, // Check for stalled jobs every 30 seconds
    maxStalledCount: 2 // Restart stalled jobs up to 2 times
  }
};

let webhookQueue = null;
let isQueueReady = false;

/**
 * Initialize the webhook queue
 * Should be called once during server startup
 *
 * @returns {Promise<Queue>} The initialized queue instance
 */
export async function initializeWebhookQueue() {
  if (webhookQueue) {
    console.log('[WebhookQueue] Queue already initialized');
    return webhookQueue;
  }

  try {
    webhookQueue = new Queue('paymongo-webhooks', QUEUE_OPTIONS);

    // Event handlers for monitoring
    webhookQueue.on('ready', () => {
      isQueueReady = true;
      console.log('[WebhookQueue] ✅ Queue connected to Redis and ready');
    });

    webhookQueue.on('error', (error) => {
      console.error('[WebhookQueue] ❌ Queue error:', error.message);
      isQueueReady = false;
    });

    webhookQueue.on('failed', (job, error) => {
      console.error(`[WebhookQueue] ❌ Job ${job.id} failed:`, {
        eventType: job.data.eventType,
        eventId: job.data.eventId,
        error: error.message,
        attemptsMade: job.attemptsMade,
        maxAttempts: job.opts.attempts
      });
    });

    webhookQueue.on('completed', (job, result) => {
      console.log(`[WebhookQueue] ✅ Job ${job.id} completed:`, {
        eventType: job.data.eventType,
        eventId: job.data.eventId,
        processingTime: Date.now() - job.timestamp
      });
    });

    webhookQueue.on('stalled', (job) => {
      console.warn(`[WebhookQueue] ⚠️ Job ${job.id} stalled, will be retried`);
    });

    // Register job processor
    webhookQueue.process(async (job) => {
      const { eventType, eventData, eventId, webhookDbId, rawPayload } = job.data;

      console.log(`[WebhookQueue] 🔄 Processing job ${job.id}:`, {
        eventType,
        eventId,
        attempt: job.attemptsMade + 1
      });

      return await processWebhookJob({
        eventType,
        eventData,
        eventId,
        webhookDbId,
        rawPayload
      });
    });

    console.log('[WebhookQueue] ✅ Webhook queue initialized');
    return webhookQueue;

  } catch (error) {
    console.error('[WebhookQueue] ❌ Failed to initialize queue:', error);
    throw error;
  }
}

/**
 * Add a webhook event to the processing queue
 *
 * @param {Object} params - Webhook event parameters
 * @param {string} params.eventType - PayMongo event type (e.g., 'payment.paid', 'payment.failed')
 * @param {Object} params.eventData - Event data from PayMongo
 * @param {string} params.eventId - PayMongo event ID for idempotency
 * @param {string} params.webhookDbId - UUID of the webhook_event record in database
 * @param {Object} [params.rawPayload] - Raw webhook payload for debugging
 * @returns {Promise<Job>} The created Bull job
 */
export async function enqueueWebhook({ eventType, eventData, eventId, webhookDbId, rawPayload }) {
  if (!webhookQueue) {
    throw new Error('Webhook queue not initialized. Call initializeWebhookQueue() first.');
  }

  if (!isQueueReady) {
    console.warn('[WebhookQueue] ⚠️ Queue not ready, attempting to add job anyway...');
  }

  const job = await webhookQueue.add(
    {
      eventType,
      eventData,
      eventId,
      webhookDbId,
      rawPayload,
      enqueuedAt: new Date().toISOString()
    },
    {
      // Job-specific options (override defaults if needed)
      jobId: eventId, // Use PayMongo event ID as job ID for deduplication
      priority: getEventPriority(eventType)
    }
  );

  console.log(`[WebhookQueue] 📤 Enqueued job ${job.id} for event ${eventType}`);
  return job;
}

/**
 * Get priority for different event types
 * Lower number = higher priority
 *
 * @param {string} eventType - PayMongo event type
 * @returns {number} Priority level (1-10)
 */
function getEventPriority(eventType) {
  const priorities = {
    // Payment success events - highest priority (PIPM flow)
    'payment.paid': 1,
    'payment_intent.succeeded': 1,

    // Payment failure events - high priority
    'payment.failed': 2,
    'payment_intent.payment_failed': 2,

    // Refund events - medium priority
    'refund.updated': 3,

    // Other events - lower priority
    default: 5
  };

  return priorities[eventType] || priorities.default;
}

/**
 * Check if the webhook queue is healthy
 *
 * @returns {Promise<Object>} Queue health status
 */
export async function getQueueHealth() {
  if (!webhookQueue) {
    return { healthy: false, error: 'Queue not initialized' };
  }

  try {
    const jobCounts = await webhookQueue.getJobCounts();
    const isPaused = await webhookQueue.isPaused();

    return {
      healthy: isQueueReady && !isPaused,
      ready: isQueueReady,
      paused: isPaused,
      jobs: {
        waiting: jobCounts.waiting,
        active: jobCounts.active,
        completed: jobCounts.completed,
        failed: jobCounts.failed,
        delayed: jobCounts.delayed
      }
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message
    };
  }
}

/**
 * Gracefully shutdown the webhook queue
 * Should be called during server shutdown
 *
 * @returns {Promise<void>}
 */
export async function shutdownWebhookQueue() {
  if (!webhookQueue) {
    return;
  }

  console.log('[WebhookQueue] 🛑 Shutting down webhook queue...');

  try {
    // Wait for active jobs to complete (max 30 seconds)
    await webhookQueue.close(30000);
    webhookQueue = null;
    isQueueReady = false;
    console.log('[WebhookQueue] ✅ Queue shutdown complete');
  } catch (error) {
    console.error('[WebhookQueue] ❌ Error during shutdown:', error);
    throw error;
  }
}

/**
 * Get the queue instance (for advanced operations)
 *
 * @returns {Queue|null} The Bull queue instance
 */
export function getWebhookQueue() {
  return webhookQueue;
}

/**
 * Retry a failed job by its ID
 *
 * @param {string} jobId - The job ID to retry
 * @returns {Promise<Job>} The retried job
 */
export async function retryFailedJob(jobId) {
  if (!webhookQueue) {
    throw new Error('Webhook queue not initialized');
  }

  const job = await webhookQueue.getJob(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  if (await job.isFailed()) {
    await job.retry();
    console.log(`[WebhookQueue] 🔄 Retrying job ${jobId}`);
    return job;
  }

  throw new Error(`Job ${jobId} is not in failed state`);
}

/**
 * Get recent failed jobs for debugging
 *
 * @param {number} limit - Maximum number of jobs to return
 * @returns {Promise<Array>} Array of failed job data
 */
export async function getFailedJobs(limit = 20) {
  if (!webhookQueue) {
    return [];
  }

  const jobs = await webhookQueue.getFailed(0, limit - 1);
  return jobs.map(job => ({
    id: job.id,
    eventType: job.data.eventType,
    eventId: job.data.eventId,
    failedReason: job.failedReason,
    attemptsMade: job.attemptsMade,
    timestamp: job.timestamp,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn
  }));
}

export default {
  initializeWebhookQueue,
  enqueueWebhook,
  getQueueHealth,
  shutdownWebhookQueue,
  getWebhookQueue,
  retryFailedJob,
  getFailedJobs
};
