/**
 * Discount Controller
 * Handles discount operations
 */
import { sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';
import { extractProcedureResult, extractSingleResult } from '../utils/helpers.js';

/**
 * Create a discount
 */
export const createDiscount = async (req, res, next) => {
  try {
    const {
      business_id,
      code,
      discount_type,
      discount_value,
      min_purchase,
      max_discount,
      start_date,
      end_date,
      usage_limit,
      is_active = true
    } = req.body;

    const id = crypto.randomUUID();
    const upperCode = code ? code.toUpperCase() : null;

    await sequelize.query(
      'CALL InsertDiscount(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [
          id, business_id, upperCode, discount_type, discount_value,
          min_purchase, max_discount, start_date, end_date, usage_limit, is_active
        ]
      }
    );

    const queryResult = await sequelize.query('CALL GetDiscountById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.status(201).success(result, 'Discount created successfully');
  } catch (error) {
    logger.error('Error creating discount:', error);
    next(error);
  }
};

/**
 * Get discount by ID
 */
export const getDiscount = async (req, res, next) => {
  try {
    const { id } = req.params;

    const queryResult = await sequelize.query('CALL GetDiscountById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Discount not found');
    }

    res.success(result);
  } catch (error) {
    logger.error('Error fetching discount:', error);
    next(error);
  }
};

/**
 * Get discounts for a business
 */
export const getBusinessDiscounts = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { page = 1, limit = 10, isActive } = req.query;

    let queryResult;
    if (isActive === 'true') {
      queryResult = await sequelize.query('CALL GetActiveDiscountsByBusinessId(?)', {
        replacements: [businessId]
      });
    } else {
      queryResult = await sequelize.query('CALL GetDiscountsByBusinessId(?)', {
        replacements: [businessId]
      });
    }
    const results = extractProcedureResult(queryResult);

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedResults = results.slice(offset, offset + parseInt(limit));

    res.success({
      data: paginatedResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: results.length
      }
    });
  } catch (error) {
    logger.error('Error fetching business discounts:', error);
    next(error);
  }
};

/**
 * Update discount
 */
export const updateDiscount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      code,
      discount_type,
      discount_value,
      min_purchase,
      max_discount,
      start_date,
      end_date,
      usage_limit,
      is_active
    } = req.body;

    const upperCode = code ? code.toUpperCase() : null;

    await sequelize.query(
      'CALL UpdateDiscount(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [
          id, upperCode, discount_type, discount_value,
          min_purchase, max_discount, start_date, end_date, usage_limit, is_active
        ]
      }
    );

    const queryResult = await sequelize.query('CALL GetDiscountById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.success(result, 'Discount updated successfully');
  } catch (error) {
    logger.error('Error updating discount:', error);
    next(error);
  }
};

/**
 * Delete discount
 */
export const deleteDiscount = async (req, res, next) => {
  try {
    const { id } = req.params;

    await sequelize.query('CALL DeleteDiscount(?)', {
      replacements: [id]
    });

    res.success(null, 'Discount deleted successfully');
  } catch (error) {
    logger.error('Error deleting discount:', error);
    next(error);
  }
};

/**
 * Validate discount code
 */
export const validateDiscount = async (req, res, next) => {
  try {
    const { code, businessId, amount } = req.body;
    const upperCode = code.toUpperCase();

    const queryResult = await sequelize.query('CALL GetActiveDiscountsByBusinessId(?)', {
      replacements: [businessId]
    });
    const discounts = extractProcedureResult(queryResult);

    const discount = discounts.find(d => d.code === upperCode);

    if (!discount) {
      res.status(400).success({ valid: false, message: 'Invalid discount code' });
      return;
    }

    // Check min purchase
    if (discount.min_purchase && parseFloat(amount) < parseFloat(discount.min_purchase)) {
      res.status(400).success({ valid: false, message: `Minimum purchase of ${discount.min_purchase} required` });
      return;
    }

    // Check usage limit
    if (discount.usage_limit && discount.times_used >= discount.usage_limit) {
      res.status(400).success({ valid: false, message: 'Discount usage limit reached' });
      return;
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.discount_type === 'percentage') {
      discountAmount = (parseFloat(amount) * parseFloat(discount.discount_value)) / 100;
      if (discount.max_discount && discountAmount > parseFloat(discount.max_discount)) {
        discountAmount = parseFloat(discount.max_discount);
      }
    } else {
      discountAmount = parseFloat(discount.discount_value);
    }

    const finalAmount = parseFloat(amount) - discountAmount;

    res.success({
      valid: true,
      discountAmount,
      finalAmount,
      discount: {
        id: discount.id,
        code: discount.code,
        discount_type: discount.discount_type,
        discount_value: discount.discount_value
      }
    });
  } catch (error) {
    logger.error('Error validating discount:', error);
    next(error);
  }
};

/**
 * Apply discount (validate and increment usage)
 */
export const applyDiscount = async (req, res, next) => {
  try {
    const { code, businessId, amount } = req.body;
    const upperCode = code.toUpperCase();

    const queryResult = await sequelize.query('CALL GetActiveDiscountsByBusinessId(?)', {
      replacements: [businessId]
    });
    const discounts = extractProcedureResult(queryResult);

    const discount = discounts.find(d => d.code === upperCode);

    if (!discount) {
      res.status(400).success({ valid: false, message: 'Invalid discount code' });
      return;
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.discount_type === 'percentage') {
      discountAmount = (parseFloat(amount) * parseFloat(discount.discount_value)) / 100;
      if (discount.max_discount && discountAmount > parseFloat(discount.max_discount)) {
        discountAmount = parseFloat(discount.max_discount);
      }
    } else {
      discountAmount = parseFloat(discount.discount_value);
    }

    const finalAmount = parseFloat(amount) - discountAmount;

    // Increment usage
    await sequelize.query(
      'UPDATE discounts SET times_used = times_used + 1 WHERE id = ?',
      { replacements: [discount.id] }
    );

    res.success({
      discountId: discount.id,
      discountAmount,
      finalAmount
    }, 'Discount applied');
  } catch (error) {
    logger.error('Error applying discount:', error);
    next(error);
  }
};

/**
 * Get active discounts for a business (public)
 */
export const getActiveDiscounts = async (req, res, next) => {
  try {
    const { businessId } = req.params;

    const queryResult = await sequelize.query('CALL GetActiveDiscountsByBusinessId(?)', {
      replacements: [businessId]
    });
    const results = extractProcedureResult(queryResult);

    res.success(results);
  } catch (error) {
    logger.error('Error fetching active discounts:', error);
    next(error);
  }
};

/**
 * Toggle discount status
 */
export const toggleDiscountStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingQuery = await sequelize.query('CALL GetDiscountById(?)', {
      replacements: [id]
    });
    const existing = extractSingleResult(existingQuery);

    if (!existing) {
      throw ApiError.notFound('Discount not found');
    }

    const newStatus = !existing.is_active;

    await sequelize.query(
      'UPDATE discounts SET is_active = ? WHERE id = ?',
      { replacements: [newStatus, id] }
    );

    const queryResult = await sequelize.query('CALL GetDiscountById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.success(result, `Discount ${newStatus ? 'activated' : 'deactivated'}`);
  } catch (error) {
    logger.error('Error toggling discount status:', error);
    next(error);
  }
};

export default {
  createDiscount,
  getDiscount,
  getBusinessDiscounts,
  updateDiscount,
  deleteDiscount,
  validateDiscount,
  applyDiscount,
  getActiveDiscounts,
  toggleDiscountStatus
};
