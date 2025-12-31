/**
 * Services Index
 * Exports all service modules
 */

// Authentication & Authorization
export * as authService from './auth.service.js';
export * as otpService from './otp.service.js';
export * as permissionService from './permission.service.js';
export * as roleService from './role.service.js';

// Core Business Services
export * as businessService from './business.service.js';

// Notification Services
export * as socketService from './socket.service.js';
export * as expoPushService from './expo-push.service.js';
export * as notificationService from './notification.service.js';

// Payment Services
export * as paymongoService from './paymongo.service.js';
export * as paymentFulfillmentService from './payment-fulfillment.service.js';
export * as refundService from './refund.service.js';

// Order & Booking Services
export * as orderTransitionService from './order-transition.service.js';
export * as auditService from './audit.service.js';

// Background Services
export * as tokenCleanupService from './token-cleanup.service.js';
export * as abandonedOrderCleanupService from './abandoned-order-cleanup.service.js';

// Webhook Services
export * as webhookQueueService from './webhook-queue.service.js';
export * as webhookProcessorService from './webhook-processor.service.js';

// Default export with all services
export default {
  // Auth
  auth: () => import('./auth.service.js'),
  otp: () => import('./otp.service.js'),
  permission: () => import('./permission.service.js'),
  role: () => import('./role.service.js'),

  // Business
  business: () => import('./business.service.js'),

  // Notifications
  socket: () => import('./socket.service.js'),
  expoPush: () => import('./expo-push.service.js'),
  notification: () => import('./notification.service.js'),

  // Payments
  paymongo: () => import('./paymongo.service.js'),
  paymentFulfillment: () => import('./payment-fulfillment.service.js'),
  refund: () => import('./refund.service.js'),

  // Orders
  orderTransition: () => import('./order-transition.service.js'),
  audit: () => import('./audit.service.js'),

  // Background
  tokenCleanup: () => import('./token-cleanup.service.js'),
  abandonedOrderCleanup: () => import('./abandoned-order-cleanup.service.js'),

  // Webhooks
  webhookQueue: () => import('./webhook-queue.service.js'),
  webhookProcessor: () => import('./webhook-processor.service.js'),
};
