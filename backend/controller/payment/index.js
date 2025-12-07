/**
 * Payment Controllers Index
 * Re-exports all payment controller functions
 * 
 * PIPM Workflow Controllers:
 * - paymentWorkflow.controller.js - Unified payment workflow for orders & bookings (PRIMARY)
 * - paymentWebhook.controller.js - Handle webhooks
 * - paymentQuery.controller.js - Query payments
 * - paymentRefund.controller.js - Handle refunds
 * 
 * NOTE: Generic CRUD operations have been removed for security.
 * Payments must be created via initiateUnifiedPayment (PayMongo) and
 * updated only via webhooks.
 * 
 * DEPRECATED (consolidated into paymentWorkflow.controller.js):
 * - paymentIntent.controller.js - DELETED
 * - paymentAttach.controller.js - DELETED
 */

// Unified Payment Workflow (Orders & Bookings) - PRIMARY ENTRY POINT
export {
  initiateUnifiedPayment,
  getUnifiedPaymentStatus,
  verifyUnifiedPayment
} from './paymentWorkflow.controller.js';

// Webhook Handler
export { 
  handleWebhook,
  processWebhookEvent 
} from './paymentWebhook.controller.js';

// Payment Queries
export {
  getAllPayments,
  getPaymentByPayerId,
  getPaymentById,
  getPaymentByPaymentForId,
  getPaymentByBusinessId,
  getPaymentByOrderId
} from './paymentQuery.controller.js';

// Refunds
export {
  initiateRefund,
  getRefundStatus
} from './paymentRefund.controller.js';
