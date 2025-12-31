/**
 * OTP Service
 * In-memory OTP storage with TTL
 * In production, use Redis for distributed systems
 */
import logger from '../config/logger.js';

const otpStore = new Map();

/**
 * Store OTP for a user
 * @param {string} userId - User ID
 * @param {string} type - OTP type ('password_change', 'email_change', 'phone_verification')
 * @param {string} otp - The OTP code
 * @param {number} expiresAt - Expiry timestamp in milliseconds
 * @param {Object} metadata - Additional data (e.g., newEmail)
 */
export function storeOTP(userId, type, otp, expiresAt, metadata = {}) {
  const key = `${userId}:${type}`;
  otpStore.set(key, {
    otp,
    expiresAt,
    metadata,
    createdAt: Date.now(),
    attempts: 0,
  });

  logger.debug(`OTP stored for ${key}, expires in ${Math.round((expiresAt - Date.now()) / 1000)}s`);
}

/**
 * Retrieve OTP data for a user
 * @param {string} userId - User ID
 * @param {string} type - OTP type
 * @returns {Object|null} OTP data or null if not found
 */
export function getOTP(userId, type) {
  const key = `${userId}:${type}`;
  return otpStore.get(key) || null;
}

/**
 * Verify OTP for a user
 * @param {string} userId - User ID
 * @param {string} type - OTP type
 * @param {string} otp - OTP to verify
 * @returns {Object} Result with success status and message
 */
export function verifyOTP(userId, type, otp) {
  const key = `${userId}:${type}`;
  const stored = otpStore.get(key);

  if (!stored) {
    return { success: false, message: 'No OTP found. Please request a new code.' };
  }

  // Check expiry
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    return { success: false, message: 'OTP has expired. Please request a new code.' };
  }

  // Increment attempts
  stored.attempts += 1;

  // Check max attempts (5)
  if (stored.attempts > 5) {
    otpStore.delete(key);
    return { success: false, message: 'Too many attempts. Please request a new code.' };
  }

  // Verify OTP
  if (stored.otp !== otp) {
    return { success: false, message: 'Invalid OTP code.' };
  }

  return { success: true, metadata: stored.metadata };
}

/**
 * Delete OTP after successful use
 * @param {string} userId - User ID
 * @param {string} type - OTP type
 */
export function deleteOTP(userId, type) {
  const key = `${userId}:${type}`;
  otpStore.delete(key);
  logger.debug(`OTP deleted for ${key}`);
}

/**
 * Generate a random OTP code
 * @param {number} length - Length of OTP (default 6)
 * @returns {string} Generated OTP
 */
export function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

/**
 * Clean up expired OTPs
 */
export function cleanupExpiredOTPs() {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    logger.debug(`Cleaned up ${cleaned} expired OTPs`);
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);

export default {
  storeOTP,
  getOTP,
  verifyOTP,
  deleteOTP,
  generateOTP,
  cleanupExpiredOTPs,
};
