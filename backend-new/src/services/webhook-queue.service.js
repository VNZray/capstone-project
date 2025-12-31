/**
 * Webhook Queue Service
 * Bull queue for processing webhooks asynchronously
 */
import Bull from 'bull';
import config from '../config/config.js';
import logger from '../config/logger.js';

let webhookQueue = null;

/**
 * Initialize the webhook queue
 * @returns {Bull.Queue} The webhook queue
 */
export function initializeQueue() {
  if (webhookQueue) {
    return webhookQueue;
  }

  const redisConfig = {
    host: config.redis?.host || 'localhost',
    port: config.redis?.port || 6379,
    password: config.redis?.password || undefined,
  };

  webhookQueue = new Bull('webhooks', {
    redis: redisConfig,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 100,
      removeOnFail: 500,
    },
  });

  // Log queue events
  webhookQueue.on('error', (error) => {
    logger.error('Webhook queue error:', error);
  });

  webhookQueue.on('failed', (job, error) => {
    logger.error(`Webhook job ${job.id} failed:`, {
      jobName: job.name,
      error: error.message,
      attempts: job.attemptsMade,
    });
  });

  webhookQueue.on('completed', (job) => {
    logger.debug(`Webhook job ${job.id} completed`);
  });

  webhookQueue.on('stalled', (job) => {
    logger.warn(`Webhook job ${job.id} stalled`);
  });

  logger.info('Webhook queue initialized');
  return webhookQueue;
}

/**
 * Get the webhook queue
 * @returns {Bull.Queue|null}
 */
export function getQueue() {
  return webhookQueue;
}

/**
 * Add a webhook to the queue
 * @param {string} type - Webhook type
 * @param {Object} data - Webhook data
 * @param {Object} options - Job options
 * @returns {Promise<Bull.Job>}
 */
export async function addWebhook(type, data, options = {}) {
  if (!webhookQueue) {
    throw new Error('Webhook queue not initialized');
  }

  const job = await webhookQueue.add(type, {
    type,
    data,
    receivedAt: new Date().toISOString(),
  }, {
    priority: options.priority || 0,
    delay: options.delay || 0,
    ...options,
  });

  logger.debug(`Added webhook job ${job.id} (type: ${type})`);
  return job;
}

/**
 * Add a PayMongo webhook to the queue
 * @param {Object} webhookData - PayMongo webhook payload
 * @returns {Promise<Bull.Job>}
 */
export async function addPaymongoWebhook(webhookData) {
  const eventType = webhookData.data?.attributes?.type || 'unknown';

  return addWebhook('paymongo', {
    eventId: webhookData.data?.id,
    eventType,
    resource: webhookData.data?.attributes?.data,
    raw: webhookData,
  }, {
    // High priority for payment events
    priority: eventType.includes('payment') ? 1 : 2,
  });
}

/**
 * Get queue statistics
 * @returns {Promise<Object>}
 */
export async function getQueueStats() {
  if (!webhookQueue) {
    return { error: 'Queue not initialized' };
  }

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    webhookQueue.getWaitingCount(),
    webhookQueue.getActiveCount(),
    webhookQueue.getCompletedCount(),
    webhookQueue.getFailedCount(),
    webhookQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + delayed,
  };
}

/**
 * Get failed jobs
 * @param {number} start - Start index
 * @param {number} end - End index
 * @returns {Promise<Array>}
 */
export async function getFailedJobs(start = 0, end = 10) {
  if (!webhookQueue) {
    return [];
  }

  const jobs = await webhookQueue.getFailed(start, end);
  return jobs.map(job => ({
    id: job.id,
    type: job.data.type,
    failedReason: job.failedReason,
    attempts: job.attemptsMade,
    timestamp: job.timestamp,
    data: job.data,
  }));
}

/**
 * Retry a failed job
 * @param {string} jobId - Job ID
 * @returns {Promise<void>}
 */
export async function retryJob(jobId) {
  if (!webhookQueue) {
    throw new Error('Queue not initialized');
  }

  const job = await webhookQueue.getJob(jobId);
  if (!job) {
    throw new Error('Job not found');
  }

  await job.retry();
  logger.info(`Retried webhook job ${jobId}`);
}

/**
 * Clean old completed jobs
 * @param {number} grace - Grace period in ms
 * @returns {Promise<Array>}
 */
export async function cleanCompletedJobs(grace = 3600000) {
  if (!webhookQueue) {
    return [];
  }

  const cleaned = await webhookQueue.clean(grace, 'completed');
  logger.info(`Cleaned ${cleaned.length} completed webhook jobs`);
  return cleaned;
}

/**
 * Close the queue
 * @returns {Promise<void>}
 */
export async function closeQueue() {
  if (webhookQueue) {
    await webhookQueue.close();
    webhookQueue = null;
    logger.info('Webhook queue closed');
  }
}

export default {
  initializeQueue,
  getQueue,
  addWebhook,
  addPaymongoWebhook,
  getQueueStats,
  getFailedJobs,
  retryJob,
  cleanCompletedJobs,
  closeQueue,
};
