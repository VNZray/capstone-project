/**
 * Token Cleanup Service
 * Periodically cleans up expired refresh tokens
 */
import { RefreshToken, sequelize } from '../models/index.js';
import { Op } from 'sequelize';
import logger from '../config/logger.js';

let cleanupInterval = null;

/**
 * Clean up expired tokens
 * @returns {Promise<number>} Number of tokens deleted
 */
export async function cleanupExpiredTokens() {
  try {
    const result = await RefreshToken.destroy({
      where: {
        [Op.or]: [
          { expires_at: { [Op.lt]: new Date() } },
          { revoked: true },
        ],
      },
    });

    if (result > 0) {
      logger.info(`Token cleanup: Removed ${result} expired/revoked tokens`);
    }

    return result;
  } catch (error) {
    logger.error('Token cleanup error:', error);
    return 0;
  }
}

/**
 * Clean up all tokens for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of tokens deleted
 */
export async function cleanupUserTokens(userId) {
  try {
    const result = await RefreshToken.destroy({
      where: { user_id: userId },
    });

    logger.debug(`Cleaned up ${result} tokens for user ${userId}`);
    return result;
  } catch (error) {
    logger.error(`Failed to cleanup tokens for user ${userId}:`, error);
    return 0;
  }
}

/**
 * Clean up old revoked tokens (keep recent ones for audit)
 * @param {number} daysOld - Delete tokens older than this many days
 * @returns {Promise<number>} Number of tokens deleted
 */
export async function cleanupOldRevokedTokens(daysOld = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await RefreshToken.destroy({
      where: {
        revoked: true,
        updated_at: { [Op.lt]: cutoffDate },
      },
    });

    if (result > 0) {
      logger.info(`Cleaned up ${result} old revoked tokens`);
    }

    return result;
  } catch (error) {
    logger.error('Failed to cleanup old revoked tokens:', error);
    return 0;
  }
}

/**
 * Get token statistics
 * @returns {Promise<Object>} Token stats
 */
export async function getTokenStats() {
  try {
    const [stats] = await sequelize.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN revoked = 1 THEN 1 ELSE 0 END) as revoked,
        SUM(CASE WHEN expires_at < NOW() THEN 1 ELSE 0 END) as expired,
        SUM(CASE WHEN revoked = 0 AND expires_at > NOW() THEN 1 ELSE 0 END) as active
      FROM refresh_tokens
    `, { type: sequelize.QueryTypes.SELECT });

    return stats || { total: 0, revoked: 0, expired: 0, active: 0 };
  } catch (error) {
    logger.error('Failed to get token stats:', error);
    return { total: 0, revoked: 0, expired: 0, active: 0 };
  }
}

/**
 * Start the cleanup scheduler
 * @param {number} intervalMinutes - Interval between cleanups in minutes
 */
export function startCleanupScheduler(intervalMinutes = 60) {
  if (cleanupInterval) {
    logger.warn('Token cleanup scheduler already running');
    return;
  }

  const intervalMs = intervalMinutes * 60 * 1000;

  // Run immediately on start
  cleanupExpiredTokens();

  // Schedule periodic cleanup
  cleanupInterval = setInterval(async () => {
    await cleanupExpiredTokens();
    // Also clean up old revoked tokens once a day
    if (new Date().getHours() === 3) { // Run at 3 AM
      await cleanupOldRevokedTokens(30);
    }
  }, intervalMs);

  logger.info(`Token cleanup scheduler started (interval: ${intervalMinutes} minutes)`);
}

/**
 * Stop the cleanup scheduler
 */
export function stopCleanupScheduler() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    logger.info('Token cleanup scheduler stopped');
  }
}

export default {
  cleanupExpiredTokens,
  cleanupUserTokens,
  cleanupOldRevokedTokens,
  getTokenStats,
  startCleanupScheduler,
  stopCleanupScheduler,
};
