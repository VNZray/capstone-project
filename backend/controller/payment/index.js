/**
 * Payment Controllers Index
 * Re-exports all payment controller functions for backward compatibility
 * 
 * PIPM Workflow Controllers:
 * - paymentIntent.controller.js - Create & retrieve payment intents
 * - paymentAttach.controller.js - Attach payment methods
 * - paymentWebhook.controller.js - Handle webhooks
 * - paymentQuery.controller.js - Query payments
 * - paymentRefund.controller.js - Handle refunds
 * - paymentCrud.controller.js - CRUD operations
 */

// Payment Intent (PIPM Step 1)
export { 
  initiatePayment,
  createPaymentIntentForOrder,
  getPaymentIntentStatus 
} from './paymentIntent.controller.js';

// Payment Method Attachment (PIPM Step 2-3)
export { 
  attachPaymentMethodToIntent,
  createPaymentMethod 
} from './paymentAttach.controller.js';

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

// CRUD Operations
export {
  insertPayment,
  updatePayment,
  deletePayment
} from './paymentCrud.controller.js';
