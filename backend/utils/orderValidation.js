
/**
 * Order validation utilities
 * Provides schema validation for order creation and updates
 */

import {
  MIN_PICKUP_MINUTES,
  MAX_PICKUP_HOURS,
  VALID_ORDER_STATUSES,
  VALID_PAYMENT_STATUSES,
  VALID_PAYMENT_METHODS,
  PAYMONGO_PAYMENT_TYPES,
  ORDER_STATUS,
  PAYMENT_STATUS
} from '../constants/order.js';

/**
 * Validate order creation payload
 * @param {Object} payload - Order creation data
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validateOrderCreation(payload) {
  const errors = [];
  
  // Required fields
  if (!payload.business_id || typeof payload.business_id !== 'string') {
    errors.push({ field: 'business_id', message: 'Business ID is required and must be a valid UUID' });
  }
  
  // Items validation
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    errors.push({ field: 'items', message: 'Items array is required and must not be empty' });
  } else {
    payload.items.forEach((item, index) => {
      if (!item.product_id || typeof item.product_id !== 'string') {
        errors.push({ field: `items[${index}].product_id`, message: 'Product ID is required' });
      }
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
        errors.push({ field: `items[${index}].quantity`, message: 'Quantity must be a positive number' });
      }
      if (item.quantity > 999) {
        errors.push({ field: `items[${index}].quantity`, message: 'Quantity cannot exceed 999' });
      }
      if (item.special_requests && typeof item.special_requests !== 'string') {
        errors.push({ field: `items[${index}].special_requests`, message: 'Special requests must be a string' });
      }
      if (item.special_requests && item.special_requests.length > 500) {
        errors.push({ field: `items[${index}].special_requests`, message: 'Special requests cannot exceed 500 characters' });
      }
    });
  }
  
  // Pickup datetime validation
  if (!payload.pickup_datetime) {
    errors.push({ field: 'pickup_datetime', message: 'Pickup datetime is required' });
  } else {
    const pickupDate = new Date(payload.pickup_datetime);
    const now = new Date();
    
    if (isNaN(pickupDate.getTime())) {
      errors.push({ field: 'pickup_datetime', message: 'Invalid datetime format' });
    } else {
      // Calculate time boundaries
      const minPickupTime = new Date(now.getTime() + MIN_PICKUP_MINUTES * 60 * 1000);
      const maxPickupTime = new Date(now.getTime() + MAX_PICKUP_HOURS * 60 * 60 * 1000);
      
      if (pickupDate <= now) {
        errors.push({ field: 'pickup_datetime', message: 'Pickup datetime must be in the future' });
      } else if (pickupDate < minPickupTime) {
        errors.push({ 
          field: 'pickup_datetime', 
          message: `Pickup time must be at least ${MIN_PICKUP_MINUTES} minutes from now` 
        });
      } else if (pickupDate > maxPickupTime) {
        errors.push({ 
          field: 'pickup_datetime', 
          message: `Pickup time cannot be more than ${MAX_PICKUP_HOURS} hours from now` 
        });
      }
    }
  }
  
  // Payment method validation
  if (!payload.payment_method || !VALID_PAYMENT_METHODS.includes(payload.payment_method)) {
    errors.push({ field: 'payment_method', message: 'Payment method must be either "cash_on_pickup" or "paymongo"' });
  }
  
  // Payment method type validation (required for paymongo)
  if (payload.payment_method === 'paymongo') {
    if (!payload.payment_method_type || !PAYMONGO_PAYMENT_TYPES.includes(payload.payment_method_type)) {
      errors.push({ 
        field: 'payment_method_type', 
        message: `Payment method type is required for PayMongo and must be one of: ${PAYMONGO_PAYMENT_TYPES.join(', ')}` 
      });
    }
  }
  
  // Optional fields validation
  if (payload.special_instructions && typeof payload.special_instructions !== 'string') {
    errors.push({ field: 'special_instructions', message: 'Special instructions must be a string' });
  }
  if (payload.special_instructions && payload.special_instructions.length > 1000) {
    errors.push({ field: 'special_instructions', message: 'Special instructions cannot exceed 1000 characters' });
  }
  
  if (payload.discount_id && typeof payload.discount_id !== 'string') {
    errors.push({ field: 'discount_id', message: 'Discount ID must be a valid UUID' });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get pickup time constraints for client reference
 * @returns {Object} { minMinutes, maxHours }
 */
export function getPickupTimeConstraints() {
  return {
    minMinutes: MIN_PICKUP_MINUTES,
    maxHours: MAX_PICKUP_HOURS
  };
}

/**
 * Sanitize string input to prevent XSS
 * @param {string} input 
 * @returns {string}
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}

/**
 * Generate a 6-digit arrival code
 * @returns {string}
 */
export function generateArrivalCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate order number with timestamp
 * @returns {string}
 */
export function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-8);
  return `ORD-${timestamp}`;
}

/**
 * Validate status update payload
 * @param {string} status 
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateStatus(status) {
  if (!status || !VALID_ORDER_STATUSES.includes(status)) {
    return {
      valid: false,
      error: `Status must be one of: ${VALID_ORDER_STATUSES.join(', ')}`
    };
  }
  
  return { valid: true };
}

/**
 * Validate payment status
 * @param {string} paymentStatus 
 * @returns {Object} { valid: boolean, error: string }
 */
export function validatePaymentStatus(paymentStatus) {
  if (!paymentStatus || !VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
    return {
      valid: false,
      error: `Payment status must be one of: ${VALID_PAYMENT_STATUSES.join(', ')}`
    };
  }
  
  return { valid: true };
}
