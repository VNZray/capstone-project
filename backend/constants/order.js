/**
 * Order Constants
 * Centralized configuration for order-related values
 * 
 * @see docs/ORDERING_SYSTEM_AUDIT.md - Phase 5
 */

// =============================================================================
// Amount Limits (in centavos)
// =============================================================================

/**
 * Minimum amount for Cash on Pickup orders
 * PayMongo Checkout Sessions support ₱1.00 minimum
 */
export const MIN_AMOUNT_CASH_ON_PICKUP = 100; // ₱1.00

/**
 * Minimum amount for PayMongo Payment Intents
 * Payment Intents require ₱20.00 minimum
 */
export const MIN_AMOUNT_PAYMONGO = 2000; // ₱20.00

/**
 * Minimum amount for PayMongo Checkout Sessions
 */
export const MIN_AMOUNT_CHECKOUT_SESSION = 100; // ₱1.00

// =============================================================================
// Time Limits
// =============================================================================

/**
 * Minimum minutes from now for pickup time
 * Allows preparation time for orders
 */
export const MIN_PICKUP_MINUTES = parseInt(process.env.MIN_PICKUP_MINUTES || '30', 10);

/**
 * Maximum hours from now for pickup time
 * Prevents orders too far in advance
 */
export const MAX_PICKUP_HOURS = parseInt(process.env.MAX_PICKUP_HOURS || '72', 10);

/**
 * Grace period for order cancellation (in seconds)
 * Tourist can cancel within this window after placing order
 */
export const CANCELLATION_GRACE_SECONDS = parseInt(process.env.CANCELLATION_GRACE_PERIOD || '10', 10);

/**
 * Grace period in milliseconds (for backward compatibility)
 */
export const CANCELLATION_GRACE_MS = parseInt(process.env.CANCEL_GRACE_PERIOD_MS || '10000', 10);

// =============================================================================
// Order Status Values
// =============================================================================

/**
 * Valid order statuses (lowercase - database standard)
 */
export const ORDER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  PREPARING: 'preparing',
  READY_FOR_PICKUP: 'ready_for_pickup',
  PICKED_UP: 'picked_up',
  CANCELLED_BY_USER: 'cancelled_by_user',
  CANCELLED_BY_BUSINESS: 'cancelled_by_business',
  FAILED_PAYMENT: 'failed_payment'
};

/**
 * All valid order status values as array
 */
export const VALID_ORDER_STATUSES = Object.values(ORDER_STATUS);

/**
 * Terminal statuses (order cannot be modified)
 */
export const TERMINAL_ORDER_STATUSES = [
  ORDER_STATUS.PICKED_UP,
  ORDER_STATUS.CANCELLED_BY_USER,
  ORDER_STATUS.CANCELLED_BY_BUSINESS,
  ORDER_STATUS.FAILED_PAYMENT
];

/**
 * Active statuses (order is in progress)
 */
export const ACTIVE_ORDER_STATUSES = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.ACCEPTED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY_FOR_PICKUP
];

// =============================================================================
// Payment Status Values
// =============================================================================

/**
 * Valid payment statuses
 */
export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PENDING: 'pending', // Alias for unpaid (used interchangeably)
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

/**
 * All valid payment status values as array
 */
export const VALID_PAYMENT_STATUSES = Object.values(PAYMENT_STATUS);

// =============================================================================
// Payment Methods
// =============================================================================

/**
 * Valid payment methods
 */
export const PAYMENT_METHOD = {
  CASH_ON_PICKUP: 'cash_on_pickup',
  PAYMONGO: 'paymongo'
};

/**
 * All valid payment methods as array
 */
export const VALID_PAYMENT_METHODS = Object.values(PAYMENT_METHOD);

/**
 * Valid PayMongo payment types
 */
export const PAYMONGO_PAYMENT_TYPES = ['gcash', 'card', 'paymaya', 'grab_pay', 'qrph', 'billease'];

// =============================================================================
// Status Transition Rules
// =============================================================================

/**
 * Allowed status transitions by role
 * Format: { fromStatus: { role: [allowedToStatuses] } }
 */
export const STATUS_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: {
    Tourist: [ORDER_STATUS.CANCELLED_BY_USER], // Within grace period only
    Business_Owner: [ORDER_STATUS.ACCEPTED, ORDER_STATUS.CANCELLED_BY_BUSINESS],
    Business_Staff: [ORDER_STATUS.ACCEPTED, ORDER_STATUS.CANCELLED_BY_BUSINESS],
    Admin: [ORDER_STATUS.ACCEPTED, ORDER_STATUS.CANCELLED_BY_BUSINESS],
    System: [ORDER_STATUS.FAILED_PAYMENT]
  },
  [ORDER_STATUS.ACCEPTED]: {
    Business_Owner: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED_BY_BUSINESS],
    Business_Staff: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED_BY_BUSINESS],
    Admin: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED_BY_BUSINESS]
  },
  [ORDER_STATUS.PREPARING]: {
    Business_Owner: [ORDER_STATUS.READY_FOR_PICKUP, ORDER_STATUS.CANCELLED_BY_BUSINESS],
    Business_Staff: [ORDER_STATUS.READY_FOR_PICKUP, ORDER_STATUS.CANCELLED_BY_BUSINESS],
    Admin: [ORDER_STATUS.READY_FOR_PICKUP, ORDER_STATUS.CANCELLED_BY_BUSINESS]
  },
  [ORDER_STATUS.READY_FOR_PICKUP]: {
    Business_Owner: [ORDER_STATUS.PICKED_UP, ORDER_STATUS.CANCELLED_BY_BUSINESS],
    Business_Staff: [ORDER_STATUS.PICKED_UP, ORDER_STATUS.CANCELLED_BY_BUSINESS],
    Admin: [ORDER_STATUS.PICKED_UP, ORDER_STATUS.CANCELLED_BY_BUSINESS]
  }
};

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Check if a status is terminal (no further transitions allowed)
 * @param {string} status - Order status
 * @returns {boolean}
 */
export function isTerminalStatus(status) {
  return TERMINAL_ORDER_STATUSES.includes(status?.toLowerCase());
}

/**
 * Check if a status is active (order in progress)
 * @param {string} status - Order status
 * @returns {boolean}
 */
export function isActiveStatus(status) {
  return ACTIVE_ORDER_STATUSES.includes(status?.toLowerCase());
}

/**
 * Get allowed next statuses for a given status and role
 * @param {string} currentStatus - Current order status
 * @param {string} role - User role
 * @returns {string[]} Array of allowed next statuses
 */
export function getAllowedTransitions(currentStatus, role) {
  const statusLower = currentStatus?.toLowerCase();
  const transitions = STATUS_TRANSITIONS[statusLower];
  
  if (!transitions) return [];
  
  return transitions[role] || [];
}

/**
 * Normalize status to lowercase (database format)
 * @param {string} status - Status in any casing
 * @returns {string} Lowercase status
 */
export function normalizeStatus(status) {
  if (!status) return ORDER_STATUS.PENDING;
  return status.toString().toLowerCase();
}

/**
 * Convert status to uppercase (for mobile app compatibility)
 * @param {string} status - Status in any casing
 * @returns {string} Uppercase status with underscores
 */
export function toUpperStatus(status) {
  if (!status) return 'PENDING';
  return status.toString().toUpperCase();
}

// =============================================================================
// Default Export
// =============================================================================

export default {
  // Amounts
  MIN_AMOUNT_CASH_ON_PICKUP,
  MIN_AMOUNT_PAYMONGO,
  MIN_AMOUNT_CHECKOUT_SESSION,
  
  // Time limits
  MIN_PICKUP_MINUTES,
  MAX_PICKUP_HOURS,
  CANCELLATION_GRACE_SECONDS,
  CANCELLATION_GRACE_MS,
  
  // Status enums
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  
  // Status arrays
  VALID_ORDER_STATUSES,
  VALID_PAYMENT_STATUSES,
  VALID_PAYMENT_METHODS,
  TERMINAL_ORDER_STATUSES,
  ACTIVE_ORDER_STATUSES,
  PAYMONGO_PAYMENT_TYPES,
  
  // Transition rules
  STATUS_TRANSITIONS,
  
  // Utility functions
  isTerminalStatus,
  isActiveStatus,
  getAllowedTransitions,
  normalizeStatus,
  toUpperStatus
};
