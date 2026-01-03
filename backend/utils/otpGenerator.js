import crypto from 'crypto';

/**
 * Generate a 6-digit OTP code
 * @returns {string} 6-digit OTP
 */
export function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Generate OTP with expiry time
 * @param {number} expiryMinutes - Minutes until OTP expires (default: 10)
 * @returns {Object} Object with otp and expiresAt timestamp
 */
export function generateOTPWithExpiry(expiryMinutes = 10) {
  const otp = generateOTP();
  const expiresAt = Date.now() + expiryMinutes * 60 * 1000;

  return { otp, expiresAt };
}

/**
 * Verify if OTP is still valid
 * @param {number} expiresAt - Timestamp when OTP expires
 * @returns {boolean} True if OTP is still valid
 */
export function isOTPValid(expiresAt) {
  return Date.now() < expiresAt;
}
