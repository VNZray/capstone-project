/**
 * Product Controller
 * Handles product operations
 */
import { sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { extractProcedureResult, extractSingleResult } from '../utils/helpers.js';
import logger from '../config/logger.js';

/**
 * Create a product
 */
export const createProduct = async (req, res, next) => {
  try {
    const {
      business_id,
      category_id,
      name,
      description,
      price,
      compare_at_price,
      sku,
      stock_quantity = 0,
      track_inventory = true,
      allow_backorder = false,
      is_available = true,
      images = []
    } = req.body;

    const id = crypto.randomUUID();
    await sequelize.query(
      'CALL InsertProduct(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [
          id, business_id, category_id, name, description, price,
          compare_at_price, sku, stock_quantity, track_inventory, allow_backorder, is_available
        ]
      }
    );

    // Add images if any
    for (let i = 0; i < images.length; i++) {
      const imageId = crypto.randomUUID();
      await sequelize.query(
        'INSERT INTO product_images (id, product_id, image_url, sort_order, created_at) VALUES (?, ?, ?, ?, NOW())',
        { replacements: [imageId, id, images[i], i] }
      );
    }

    const queryResult = await sequelize.query('CALL GetProductById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.status(201).success(result, 'Product created successfully');
  } catch (error) {
    logger.error('Error creating product:', error);
    next(error);
  }
};

/**
 * Get product by ID
 */
export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const queryResult = await sequelize.query('CALL GetProductById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Product not found');
    }

    // Get images
    const [images] = await sequelize.query(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order',
      { replacements: [id] }
    );

    res.success({
      ...result,
      images
    });
  } catch (error) {
    logger.error('Error fetching product:', error);
    next(error);
  }
};

/**
 * Get products for a business
 */
export const getBusinessProducts = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { page = 1, limit = 20, categoryId, search, isAvailable } = req.query;

    let queryResult;
    if (isAvailable === 'true') {
      queryResult = await sequelize.query('CALL GetAvailableProductsByBusinessId(?)', {
        replacements: [businessId]
      });
    } else {
      queryResult = await sequelize.query('CALL GetProductsByBusinessId(?)', {
        replacements: [businessId]
      });
    }
    let results = extractProcedureResult(queryResult);

    // Apply filters
    let filtered = results;
    if (categoryId) {
      filtered = filtered.filter(p => p.category_id === categoryId);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedResults = filtered.slice(offset, offset + parseInt(limit));

    res.success({
      data: paginatedResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filtered.length
      }
    });
  } catch (error) {
    logger.error('Error fetching business products:', error);
    next(error);
  }
};

/**
 * Update product
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      category_id,
      name,
      description,
      price,
      compare_at_price,
      sku,
      stock_quantity,
      track_inventory,
      allow_backorder,
      is_available,
      images
    } = req.body;

    await sequelize.query(
      'CALL UpdateProduct(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [
          id, category_id, name, description, price,
          compare_at_price, sku, stock_quantity, track_inventory, allow_backorder, is_available
        ]
      }
    );

    // Update images if provided
    if (images !== undefined) {
      // Remove old images
      await sequelize.query('DELETE FROM product_images WHERE product_id = ?', {
        replacements: [id]
      });

      // Add new images
      for (let i = 0; i < images.length; i++) {
        const imageId = crypto.randomUUID();
        await sequelize.query(
          'INSERT INTO product_images (id, product_id, image_url, sort_order, created_at) VALUES (?, ?, ?, ?, NOW())',
          { replacements: [imageId, id, images[i], i] }
        );
      }
    }

    const queryResult = await sequelize.query('CALL GetProductById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.success(result, 'Product updated successfully');
  } catch (error) {
    logger.error('Error updating product:', error);
    next(error);
  }
};

/**
 * Delete product
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    await sequelize.query('CALL DeleteProduct(?)', {
      replacements: [id]
    });

    res.success(null, 'Product deleted successfully');
  } catch (error) {
    logger.error('Error deleting product:', error);
    next(error);
  }
};

/**
 * Update product stock
 */
export const updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    await sequelize.query('CALL UpdateProductStock(?, ?)', {
      replacements: [id, quantity]
    });

    const queryResult = await sequelize.query('CALL GetProductById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.success(result, 'Stock updated');
  } catch (error) {
    logger.error('Error updating stock:', error);
    next(error);
  }
};

/**
 * Adjust stock (add or subtract)
 */
export const adjustStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adjustment, reason } = req.body;
    const userId = req.user.id;

    await sequelize.query('CALL AdjustProductStock(?, ?, ?, ?)', {
      replacements: [id, adjustment, reason, userId]
    });

    const queryResult = await sequelize.query('CALL GetProductById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.success(result, `Stock adjusted by ${adjustment}`);
  } catch (error) {
    logger.error('Error adjusting stock:', error);
    next(error);
  }
};

/**
 * Get stock history
 */
export const getStockHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const queryResult = await sequelize.query('CALL GetStockHistoryByProductId(?)', {
      replacements: [id]
    });
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
    logger.error('Error fetching stock history:', error);
    next(error);
  }
};

/**
 * Get low stock products
 */
export const getLowStockProducts = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { threshold = 10 } = req.query;

    const queryResult = await sequelize.query('CALL GetLowStockProducts(?, ?)', {
      replacements: [businessId, parseInt(threshold)]
    });
    const results = extractProcedureResult(queryResult);

    res.success(results);
  } catch (error) {
    logger.error('Error fetching low stock products:', error);
    next(error);
  }
};

/**
 * Toggle product availability
 */
export const toggleAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingQuery = await sequelize.query('CALL GetProductById(?)', {
      replacements: [id]
    });
    const existing = extractSingleResult(existingQuery);

    if (!existing) {
      throw ApiError.notFound('Product not found');
    }

    const newStatus = !existing.is_available;

    await sequelize.query(
      'UPDATE products SET is_available = ? WHERE id = ?',
      { replacements: [newStatus, id] }
    );

    const queryResult = await sequelize.query('CALL GetProductById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.success(result, `Product ${newStatus ? 'made available' : 'made unavailable'}`);
  } catch (error) {
    logger.error('Error toggling product availability:', error);
    next(error);
  }
};

/**
 * Bulk update products
 */
export const bulkUpdate = async (req, res, next) => {
  try {
    const { productIds, updates } = req.body;

    let updateQuery = 'UPDATE products SET ';
    const setClauses = [];
    const values = [];

    if (updates.is_available !== undefined) {
      setClauses.push('is_available = ?');
      values.push(updates.is_available);
    }
    if (updates.category_id !== undefined) {
      setClauses.push('category_id = ?');
      values.push(updates.category_id);
    }

    if (setClauses.length === 0) {
      throw ApiError.badRequest('No updates provided');
    }

    updateQuery += setClauses.join(', ');
    updateQuery += ` WHERE id IN (${productIds.map(() => '?').join(', ')})`;
    values.push(...productIds);

    await sequelize.query(updateQuery, { replacements: values });

    res.success({ updated: productIds.length }, `${productIds.length} products updated`);
  } catch (error) {
    logger.error('Error bulk updating products:', error);
    next(error);
  }
};

export default {
  createProduct,
  getProduct,
  getBusinessProducts,
  updateProduct,
  deleteProduct,
  updateStock,
  adjustStock,
  getStockHistory,
  getLowStockProducts,
  toggleAvailability,
  bulkUpdate
};
