/**
 * Rate Limiter Middleware
 * Prevents abuse and brute force attacks
 */
import rateLimit from 'express-rate-limit';
import config from '../config/config.js';
import logger from '../config/logger.js';

/**
 * Default rate limiter configuration
 */
export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
    });
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  }
});

/**
 * Create custom rate limiter with specific settings
 * @param {Object} options - Rate limiter options
 */
export const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
    message: {
      success: false,
      message: options.message || 'Too many requests. Please try again later.'
    },
    ...options
  });
};

/**
 * Strict rate limiter for authentication endpoints
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts. Please try again after 15 minutes.'
});

/**
 * Lenient rate limiter for read operations
 */
export const readRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests. Please slow down.'
});

/**
 * Strict rate limiter for write operations
 */
export const writeRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many write requests. Please slow down.'
});

export default { rateLimiter, createRateLimiter, authRateLimiter, readRateLimiter, writeRateLimiter };
