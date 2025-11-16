// Input validation utilities for API endpoints

export const validateRequiredFields = (requiredFields) => {
  return (req, res, next) => {
    const missing = requiredFields.filter(field => 
      req.body[field] === undefined || req.body[field] === null || req.body[field] === ""
    );
    
    if (missing.length > 0) {
      return res.status(400).json({ 
        message: "Missing required fields", 
        fields: missing 
      });
    }
    
    next();
  };
};

export const validateUUID = (fieldName) => {
  return (req, res, next) => {
    const value = req.params[fieldName] || req.body[fieldName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (value && !uuidRegex.test(value)) {
      return res.status(400).json({ 
        message: `Invalid UUID format for ${fieldName}` 
      });
    }
    
    next();
  };
};

export const validateUUIDArray = (fieldName, { minLength = 0 } = {}) => {
  return (req, res, next) => {
    const values = req.body[fieldName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!Array.isArray(values)) {
      return res.status(400).json({
        message: `${fieldName} must be an array`
      });
    }

    if (values.length < minLength) {
      return res.status(400).json({
        message: `${fieldName} must contain at least ${minLength} item${minLength === 1 ? '' : 's'}`
      });
    }

    const invalidIds = values.filter((value) => !uuidRegex.test(value));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        message: `Invalid UUID format in ${fieldName}`,
        invalid: invalidIds
      });
    }

    next();
  };
};

export const validateRating = (req, res, next) => {
  const { rating } = req.body;
  
  if (rating && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
    return res.status(400).json({ 
      message: "Rating must be an integer between 1 and 5" 
    });
  }
  
  next();
};

export const validatePrice = (req, res, next) => {
  const { price, base_price, discount_value, minimum_order_amount } = req.body;
  
  const prices = [price, base_price, discount_value, minimum_order_amount].filter(p => p !== undefined);
  
  for (const p of prices) {
    if (p && (isNaN(p) || p < 0)) {
      return res.status(400).json({ 
        message: "Price values must be positive numbers" 
      });
    }
  }
  
  next();
};

export const validateEmail = (req, res, next) => {
  const { email } = req.body;
  
  if (email && !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ 
      message: "Invalid email format" 
    });
  }
  
  next();
};

export const validateStatus = (validStatuses) => {
  return (req, res, next) => {
    const { status } = req.body;
    
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Valid options: ${validStatuses.join(', ')}` 
      });
    }
    
    next();
  };
};

export const validateQuantity = (req, res, next) => {
  const { quantity, quantity_change } = req.body;
  
  if (quantity && (!Number.isInteger(quantity) || quantity <= 0)) {
    return res.status(400).json({ 
      message: "Quantity must be a positive integer" 
    });
  }
  
  if (quantity_change && !Number.isInteger(quantity_change)) {
    return res.status(400).json({ 
      message: "Quantity change must be an integer" 
    });
  }
  
  next();
};

export const validateDateRange = (req, res, next) => {
  const { start_datetime, end_datetime } = req.body;
  
  if (start_datetime && end_datetime) {
    const start = new Date(start_datetime);
    const end = new Date(end_datetime);
    
    if (end <= start) {
      return res.status(400).json({ 
        message: "End date must be after start date" 
      });
    }
  }
  
  next();
};

// Validation middleware combinations for different entities
export const productCategoryValidation = [
  validateRequiredFields(['business_id', 'name']),
  validateUUID('business_id')
];

export const productValidation = [
  validateRequiredFields(['business_id', 'category_ids', 'name', 'price']),
  validateUUID('business_id'),
  validateUUIDArray('category_ids', { minLength: 1 }),
  validatePrice
];

// Simplified discount validation (removed discount_type requirement)
export const discountValidation = [
  validateRequiredFields(['business_id', 'name', 'discount_value', 'start_datetime']),
  validateUUID('business_id'),
  validatePrice,
  validateDateRange,
  validateStatus(['active', 'inactive', 'expired', 'paused'])
];

export const serviceValidation = [
  validateRequiredFields(['business_id', 'service_category_id', 'name', 'base_price', 'price_type']),
  validateUUID('business_id'),
  validateUUID('service_category_id'),
  validatePrice
];

export const orderValidation = [
  validateRequiredFields(['business_id', 'user_id', 'items', 'pickup_datetime']),
  validateUUID('business_id'),
  validateUUID('user_id')
];

export const productReviewValidation = [
  validateRequiredFields(['product_id', 'user_id', 'rating']),
  validateUUID('product_id'),
  validateUUID('user_id'),
  validateRating
];

export const stockUpdateValidation = [
  validateRequiredFields(['quantity_change', 'change_type']),
  validateQuantity,
  validateStatus(['restock', 'sale', 'adjustment', 'expired'])
];
