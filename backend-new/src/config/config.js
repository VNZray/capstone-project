/**
 * Application Configuration
 * Centralized environment variable management with validation
 */
import 'dotenv/config';

// Validate required environment variables
const requiredEnvVars = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'DB_HOST',
  'DB_USER',
  'DB_NAME'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0 && process.env.NODE_ENV !== 'test') {
  throw new Error(`CRITICAL: Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // Server
  port: parseInt(process.env.PORT, 10) || 3000,

  // Database
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    name: process.env.DB_NAME || 'cityventure_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: 'mysql',
    timezone: '+08:00', // PHT (Asia/Manila)
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  },

  // JWT Configuration
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    algorithm: 'HS256'
  },

  // CORS
  cors: {
    frontendUrl: (process.env.FRONTEND_BASE_URL || 'http://localhost:5173').replace(/\/$/, ''),
    mobileDeepLink: (process.env.MOBILE_DEEP_LINK_BASE || 'cityventure://').replace(/\/$/, ''),
    allowedOrigins: [
      process.env.FRONTEND_BASE_URL || 'http://localhost:5173',
      'http://localhost:3000'
    ]
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined'
  },

  // Email (EmailJS)
  email: {
    serviceId: process.env.EMAILJS_SERVICE_ID,
    templateId: process.env.EMAILJS_TEMPLATE_ID,
    publicKey: process.env.EMAILJS_PUBLIC_KEY,
    privateKey: process.env.EMAILJS_PRIVATE_KEY
  },

  // Expo Push Notifications
  expo: {
    accessToken: process.env.EXPO_ACCESS_TOKEN
  },

  // PayMongo Payment Gateway
  payMongo: {
    secretKey: process.env.PAYMONGO_SECRET_KEY || '',
    publicKey: process.env.PAYMONGO_PUBLIC_KEY || '',
    webhookSecret: process.env.PAYMONGO_WEBHOOK_SECRET || ''
  }
};

export default config;
