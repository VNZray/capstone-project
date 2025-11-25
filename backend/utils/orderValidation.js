
/**
 * Order validation utilities
 * Provides schema validation for order creation and updates
 */

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
    } else if (pickupDate <= now) {
      errors.push({ field: 'pickup_datetime', message: 'Pickup datetime must be in the future' });
    }
  }
  
  // Payment method validation
  const validPaymentMethods = ['cash_on_pickup', 'paymongo'];
  if (!payload.payment_method || !validPaymentMethods.includes(payload.payment_method)) {
    errors.push({ field: 'payment_method', message: 'Payment method must be either "cash_on_pickup" or "paymongo"' });
  }
  
  // Payment method type validation (required for paymongo)
  if (payload.payment_method === 'paymongo') {
    const validPaymentTypes = ['gcash', 'card', 'paymaya', 'grab_pay', 'qrph'];
    if (!payload.payment_method_type || !validPaymentTypes.includes(payload.payment_method_type)) {
      errors.push({ 
        field: 'payment_method_type', 
        message: 'Payment method type is required for PayMongo and must be one of: gcash, card, paymaya, grab_pay, qrph' 
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
  const validStatuses = [
    'pending',
    'accepted',
    'preparing',
    'ready_for_pickup',
    'picked_up',
    'cancelled_by_user',
    'cancelled_by_business',
    'failed_payment'
  ];
  
  if (!status || !validStatuses.includes(status)) {
    return {
      valid: false,
      error: `Status must be one of: ${validStatuses.join(', ')}`
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
  const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
  
  if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
    return {
      valid: false,
      error: `Payment status must be one of: ${validStatuses.join(', ')}`
    };
  }
  
  return { valid: true };
}
