/**
 * CSRF Protection Middleware
 * 
 * Implements double-submit cookie pattern for CSRF protection.
 * This is appropriate for SPAs where the same-origin policy is in effect.
 * 
 * For state-changing requests (POST, PUT, DELETE, PATCH), the middleware verifies:
 * 1. The presence of a CSRF token in the request header (X-CSRF-Token)
 * 2. The token matches the one stored in a secure HTTP-only cookie
 * 
 * Token generation should happen at login/session initialization.
 */

import crypto from "crypto";

// Token expiry time (24 hours in milliseconds)
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000;

// Cookie name for CSRF token
const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Generate a secure random CSRF token
 * @returns {string} A cryptographically secure random token
 */
export function generateCsrfToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Set CSRF token cookie on the response
 * @param {Response} res - Express response object
 * @param {string} token - The CSRF token to set
 * @param {boolean} secure - Whether to use secure cookie (true in production)
 */
export function setCsrfCookie(res, token, secure = process.env.NODE_ENV === "production") {
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: secure,
    sameSite: "strict",
    maxAge: TOKEN_EXPIRY,
    path: "/",
  });
}

/**
 * CSRF protection middleware
 * 
 * Skips validation for:
 * - Safe HTTP methods (GET, HEAD, OPTIONS)
 * - Routes that are explicitly excluded
 * 
 * For state-changing requests, requires:
 * - X-CSRF-Token header matching the csrf_token cookie
 * 
 * @param {Object} options - Configuration options
 * @param {string[]} options.excludePaths - Array of paths to exclude from CSRF protection
 * @param {boolean} options.enabled - Whether CSRF protection is enabled (default: true)
 * @returns {Function} Express middleware function
 */
export function csrfProtection(options = {}) {
  const {
    excludePaths = [],
    enabled = true,
  } = options;

  return (req, res, next) => {
    // Skip if CSRF protection is disabled
    if (!enabled) {
      return next();
    }

    // Skip for safe HTTP methods
    const safeMethods = ["GET", "HEAD", "OPTIONS"];
    if (safeMethods.includes(req.method.toUpperCase())) {
      return next();
    }

    // Skip for excluded paths (e.g., webhooks that need to receive external requests)
    const requestPath = req.path || req.url;
    if (excludePaths.some(path => requestPath.startsWith(path))) {
      return next();
    }

    // Get token from header
    const headerToken = req.headers[CSRF_HEADER_NAME];
    
    // Get token from cookie
    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];

    // Verify both tokens exist
    if (!headerToken || !cookieToken) {
      return res.status(403).json({
        error: "CSRF token missing",
        message: "Request rejected due to missing CSRF token",
      });
    }

    // Use timing-safe comparison to prevent timing attacks
    try {
      const headerBuffer = Buffer.from(headerToken, "utf8");
      const cookieBuffer = Buffer.from(cookieToken, "utf8");

      if (headerBuffer.length !== cookieBuffer.length) {
        return res.status(403).json({
          error: "CSRF token invalid",
          message: "Request rejected due to invalid CSRF token",
        });
      }

      if (!crypto.timingSafeEqual(headerBuffer, cookieBuffer)) {
        return res.status(403).json({
          error: "CSRF token mismatch",
          message: "Request rejected due to CSRF token mismatch",
        });
      }
    } catch (err) {
      console.error("CSRF validation error:", err);
      return res.status(403).json({
        error: "CSRF validation failed",
        message: "Request rejected due to CSRF validation error",
      });
    }

    // Token is valid, proceed
    next();
  };
}

/**
 * Endpoint handler to generate and return a new CSRF token
 * Call this endpoint after login to get a token for subsequent requests
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export function csrfTokenHandler(req, res) {
  const token = generateCsrfToken();
  setCsrfCookie(res, token);
  
  // Also return the token in the response so the client can use it in headers
  res.json({
    csrfToken: token,
    expiresIn: TOKEN_EXPIRY,
  });
}

/**
 * Alternative: Origin-based CSRF protection
 * Validates that requests come from allowed origins
 * This is a simpler approach that works well with CORS
 * 
 * @param {string[]} allowedOrigins - Array of allowed origins
 * @returns {Function} Express middleware function
 */
export function originBasedCsrfProtection(allowedOrigins = []) {
  return (req, res, next) => {
    // Skip for safe HTTP methods
    const safeMethods = ["GET", "HEAD", "OPTIONS"];
    if (safeMethods.includes(req.method.toUpperCase())) {
      return next();
    }

    // Check Origin header first (most reliable)
    const origin = req.headers.origin;
    if (origin) {
      if (allowedOrigins.includes(origin)) {
        return next();
      }
      return res.status(403).json({
        error: "CSRF origin check failed",
        message: "Request origin not allowed",
      });
    }

    // Fallback to Referer header if Origin is not present
    const referer = req.headers.referer;
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        const refererOrigin = refererUrl.origin;
        if (allowedOrigins.includes(refererOrigin)) {
          return next();
        }
      } catch (e) {
        // Invalid referer URL
      }
      return res.status(403).json({
        error: "CSRF referer check failed",
        message: "Request referer not allowed",
      });
    }

    // No Origin or Referer header - could be same-origin request
    // For maximum security, reject; for usability, allow
    // Here we allow for mobile app compatibility
    next();
  };
}

export default csrfProtection;
