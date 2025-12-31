/**
 * Security Middleware
 * Comprehensive security headers and protections
 */
import helmet from 'helmet';
import hpp from 'hpp';
import config from '../config/config.js';

/**
 * Helmet security headers configuration
 */
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: !config.isDev,
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true
});

/**
 * HTTP Parameter Pollution protection
 */
const hppConfig = hpp({
  whitelist: [
    // Allow multiple values for these parameters
    'category',
    'status',
    'amenities',
    'tags',
    'ids'
  ]
});

/**
 * Custom security headers
 */
const customSecurityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Restrict browser features
  res.setHeader('Permissions-Policy',
    'geolocation=(self), microphone=(), camera=(), payment=()'
  );

  // Cache control for API responses
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
  }

  next();
};

/**
 * Sanitize request body to prevent NoSQL injection and XSS
 * Note: In Express 5, req.query is read-only, so we only sanitize req.body
 */
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;

    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove potential XSS vectors
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '');

        // Remove MongoDB operators
        if (obj[key].startsWith('$')) {
          delete obj[key];
        }
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
    return obj;
  };

  // Only sanitize body - query is read-only in Express 5
  if (req.body && typeof req.body === 'object') {
    sanitize(req.body);
  }

  next();
};

/**
 * Combined security middleware
 */
export const securityMiddleware = [
  helmetConfig,
  hppConfig,
  customSecurityHeaders,
  sanitizeInput
];

export default { securityMiddleware };
