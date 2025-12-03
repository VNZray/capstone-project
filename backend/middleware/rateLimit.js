/**
 * Rate Limiting Middleware
 * 
 * Simple in-memory rate limiter for authentication endpoints.
 * Protects against brute-force attacks on login and token refresh.
 * 
 * For production with multiple server instances, consider using
 * Redis-based rate limiting (e.g., express-rate-limit with redis-store).
 * 
 * @module middleware/rateLimit
 */

// In-memory store for rate limiting
// Key: IP address or identifier, Value: { count, resetTime }
const rateLimitStore = new Map();

// Cleanup interval - remove expired entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000);

/**
 * Creates a rate limiting middleware
 * @param {Object} options - Rate limit configuration
 * @param {number} options.windowMs - Time window in milliseconds (default: 15 minutes)
 * @param {number} options.maxAttempts - Maximum attempts within window (default: 5 for auth, 100 for general)
 * @param {string} options.message - Error message to return when rate limited
 * @param {boolean} options.useEmail - Use email from request body as additional key (for login endpoints)
 * @returns {Function} Express middleware
 */
export function createRateLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    maxAttempts = 100,
    message = 'Too many requests, please try again later.',
    useEmail = false,
  } = options;

  return (req, res, next) => {
    // Build rate limit key from IP (and optionally email for login)
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    let key = ip;
    
    if (useEmail && req.body?.email) {
      // For login, also track by email to prevent distributed attacks
      key = `${ip}:${req.body.email.toLowerCase()}`;
    }

    const now = Date.now();
    let entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      entry = {
        count: 1,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, entry);
    } else {
      entry.count++;
    }

    // Set rate limit headers for client visibility
    const remaining = Math.max(0, maxAttempts - entry.count);
    const resetSeconds = Math.ceil((entry.resetTime - now) / 1000);
    
    res.setHeader('X-RateLimit-Limit', maxAttempts);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));

    if (entry.count > maxAttempts) {
      console.warn(`[RateLimit] Blocked request from ${key} (${entry.count} attempts)`);
      
      return res.status(429).json({
        message,
        retryAfter: resetSeconds,
      });
    }

    next();
  };
}

/**
 * Pre-configured rate limiter for login endpoint
 * - 5 attempts per 15 minutes per IP + email combination
 * - Helps prevent brute-force password attacks
 */
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 5,
  message: 'Too many login attempts. Please try again in 15 minutes.',
  useEmail: true,
});

/**
 * Pre-configured rate limiter for token refresh endpoint
 * - 30 attempts per 15 minutes per IP
 * - Allows normal refresh cycles but prevents abuse
 */
export const refreshRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 30,
  message: 'Too many refresh attempts. Please try again later.',
  useEmail: false,
});

/**
 * Pre-configured rate limiter for registration endpoint
 * - 3 attempts per hour per IP
 * - Prevents mass account creation
 */
export const registrationRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxAttempts: 3,
  message: 'Too many registration attempts. Please try again in an hour.',
  useEmail: true,
});

/**
 * Pre-configured rate limiter for password reset endpoint
 * - 3 attempts per hour per IP + email
 * - Prevents email bombing
 */
export const passwordResetRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxAttempts: 3,
  message: 'Too many password reset requests. Please try again in an hour.',
  useEmail: true,
});

/**
 * General API rate limiter
 * - 100 requests per minute per IP
 * - Basic DoS protection for all endpoints
 */
export const generalRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxAttempts: 100,
  message: 'Too many requests. Please slow down.',
  useEmail: false,
});

export default {
  createRateLimiter,
  loginRateLimiter,
  refreshRateLimiter,
  registrationRateLimiter,
  passwordResetRateLimiter,
  generalRateLimiter,
};
