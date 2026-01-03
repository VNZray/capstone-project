/**
 * In-memory OTP storage service
 * In production, this should use Redis or similar cache
 */

const otpStore = new Map();

/**
 * Store OTP for a user
 * @param {string} userId - User ID
 * @param {string} type - OTP type ('password_change', 'email_change')
 * @param {string} otp - The OTP code
 * @param {number} expiresAt - Expiry timestamp
 * @param {Object} metadata - Additional data (e.g., newEmail)
 */
export function storeOTP(userId, type, otp, expiresAt, metadata = {}) {
  const key = `${userId}:${type}`;
  otpStore.set(key, { otp, expiresAt, metadata, createdAt: Date.now() });

  console.log(`[OTP Store] Stored OTP for ${key}: ${otp} (expires in ${Math.round((expiresAt - Date.now()) / 1000)}s)`);
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

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    return { success: false, message: 'OTP has expired. Please request a new code.' };
  }

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
  console.log(`[OTP Store] Deleted OTP for ${key}`);
}

/**
 * Clean up expired OTPs (should be run periodically)
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
    console.log(`[OTP Store] Cleaned up ${cleaned} expired OTPs`);
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);
