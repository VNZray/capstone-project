/**
 * Token Cleanup Service
 * Handles automatic cleanup of expired refresh tokens from the database
 *
 * @module services/tokenCleanupService
 */

import db from '../db.js';

// Cleanup interval: every 6 hours (in milliseconds)
const CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000;

// How long to keep revoked tokens for audit purposes (in days)
const REVOKED_TOKEN_RETENTION_DAYS = 30;

let cleanupIntervalId = null;

/**
 * Remove expired and old revoked tokens from the database
 * @returns {Promise<{expired: number, revoked: number}>} Count of deleted tokens
 */
export async function cleanupExpiredTokens() {
  try {
    // Delete expired tokens (past their expires_at date)
    const [expiredResult] = await db.query(
      'DELETE FROM refresh_tokens WHERE expires_at < NOW()'
    );

    // Delete revoked tokens older than retention period
    const [revokedResult] = await db.query(
      `DELETE FROM refresh_tokens
       WHERE revoked = TRUE
       AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [REVOKED_TOKEN_RETENTION_DAYS]
    );

    const expiredCount = expiredResult?.affectedRows || 0;
    const revokedCount = revokedResult?.affectedRows || 0;

    if (expiredCount > 0 || revokedCount > 0) {
      console.log(`[TokenCleanup] Removed ${expiredCount} expired and ${revokedCount} old revoked tokens`);
    }

    return { expired: expiredCount, revoked: revokedCount };
  } catch (error) {
    console.error('[TokenCleanup] Error cleaning up tokens:', error.message);
    throw error;
  }
}

/**
 * Start the automatic token cleanup scheduler
 */
export function startTokenCleanupScheduler() {
  if (cleanupIntervalId) {
    console.warn('[TokenCleanup] Scheduler already running');
    return;
  }

  // Run initial cleanup
  cleanupExpiredTokens().catch(err =>
    console.error('[TokenCleanup] Initial cleanup failed:', err.message)
  );

  // Schedule periodic cleanup
  cleanupIntervalId = setInterval(() => {
    cleanupExpiredTokens().catch(err =>
      console.error('[TokenCleanup] Scheduled cleanup failed:', err.message)
    );
  }, CLEANUP_INTERVAL_MS);

  console.log(`[TokenCleanup] Scheduler started (every ${CLEANUP_INTERVAL_MS / 1000 / 60 / 60} hours)`);
}

/**
 * Stop the automatic token cleanup scheduler
 */
export function stopTokenCleanupScheduler() {
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
    console.log('[TokenCleanup] Scheduler stopped');
  }
}

/**
 * Get token statistics for monitoring
 * @returns {Promise<{total: number, active: number, revoked: number, expired: number}>}
 */
export async function getTokenStats() {
  try {
    const [rows] = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN revoked = FALSE AND expires_at > NOW() THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN revoked = TRUE THEN 1 ELSE 0 END) as revoked,
        SUM(CASE WHEN expires_at <= NOW() THEN 1 ELSE 0 END) as expired
      FROM refresh_tokens
    `);

    return rows[0] || { total: 0, active: 0, revoked: 0, expired: 0 };
  } catch (error) {
    console.error('[TokenCleanup] Error getting token stats:', error.message);
    throw error;
  }
}

export default {
  cleanupExpiredTokens,
  startTokenCleanupScheduler,
  stopTokenCleanupScheduler,
  getTokenStats,
};
