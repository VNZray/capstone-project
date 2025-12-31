/**
 * Express Application Configuration
 * Configures middleware, routes, and error handling
 */
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from './config/config.js';
import logger from './config/logger.js';

// Middleware imports
import { securityMiddleware } from './middlewares/security.js';
import { rateLimiter } from './middlewares/rate-limiter.js';
import { responseHandler } from './middlewares/response-handler.js';
import { notFoundHandler } from './middlewares/not-found-error.js';
import { errorHandler } from './middlewares/error-handler.js';

// Route imports
import healthRoutes from './routes/health.route.js';
import v1Routes from './routes/v1/index.js';

const app = express();

// ==============================================
// Security Middleware
// ==============================================
app.use(securityMiddleware);

// ==============================================
// CORS Configuration
// ==============================================
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = config.cors.allowedOrigins;

    if (allowedOrigins.includes(origin) || config.isDev) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Limit'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// ==============================================
// Body Parsing
// ==============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ==============================================
// Rate Limiting
// ==============================================
app.use(rateLimiter);

// ==============================================
// Response Handler
// ==============================================
app.use(responseHandler);

// ==============================================
// Request Logging (Development)
// ==============================================
if (config.isDev) {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.http(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
  });
}

// ==============================================
// API Routes
// ==============================================

// Health check routes (no versioning)
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);

// API v1 routes
app.use('/api/v1', v1Routes);

// Legacy routes (redirect to v1 for backward compatibility)
app.use('/api', (req, res, next) => {
  // If the path doesn't start with /v1, prepend it
  if (!req.path.startsWith('/v1') && !req.path.startsWith('/health')) {
    req.url = `/v1${req.url}`;
  }
  next();
}, v1Routes);

// ==============================================
// Error Handling
// ==============================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
