/**
 * Shop Category Controller
 * Handles shop category operations
 */
import { sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';
import { extractProcedureResult, extractSingleResult } from '../utils/helpers.js';

/**
 * Create a category
 */
export const createCategory = async (req, res, next) => {
  try {
    const { business_id, name, description, parent_id, sort_order = 0 } = req.body;

    const id = crypto.randomUUID();
    await sequelize.query(
      'CALL InsertShopCategory(?, ?, ?, ?, ?, ?)',
      { replacements: [id, business_id, name, description, parent_id, sort_order] }
    );

    const queryResult = await sequelize.query('CALL GetShopCategoryById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.status(201).success(result, 'Category created successfully');
  } catch (error) {
    logger.error('Error creating category:', error);
    next(error);
  }
};

/**
 * Get category by ID
 */
export const getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const queryResult = await sequelize.query('CALL GetShopCategoryById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Category not found');
    }

    res.success(result);
  } catch (error) {
    logger.error('Error fetching category:', error);
    next(error);
  }
};

/**
 * Get categories for a business
 */
export const getBusinessCategories = async (req, res, next) => {
  try {
    const { businessId } = req.params;

    const queryResult = await sequelize.query('CALL GetAllShopCategories()');
    const results = extractProcedureResult(queryResult);

    // Filter by business_id if the procedure returns all categories
    const filtered = results.filter(c => c.business_id === businessId);

    res.success(filtered);
  } catch (error) {
    logger.error('Error fetching business categories:', error);
    next(error);
  }
};

/**
 * Get categories with counts
 */
export const getCategoriesWithCounts = async (req, res, next) => {
  try {
    const { businessId } = req.params;

    const queryResult = await sequelize.query('CALL GetAllShopCategories()');
    const categories = extractProcedureResult(queryResult);

    // Filter by business_id
    const filtered = categories.filter(c => c.business_id === businessId);

    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      filtered.map(async (category) => {
        const [products] = await sequelize.query(
          'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
          { replacements: [category.id] }
        );
        return {
          ...category,
          product_count: products[0]?.count || 0
        };
      })
    );

    res.success(categoriesWithCounts);
  } catch (error) {
    logger.error('Error fetching categories with counts:', error);
    next(error);
  }
};

/**
 * Update category
 */
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, parent_id, sort_order } = req.body;

    await sequelize.query(
      'CALL UpdateShopCategory(?, ?, ?, ?, ?)',
      { replacements: [id, name, description, parent_id, sort_order] }
    );

    const queryResult = await sequelize.query('CALL GetShopCategoryById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.success(result, 'Category updated successfully');
  } catch (error) {
    logger.error('Error updating category:', error);
    next(error);
  }
};

/**
 * Delete category
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    await sequelize.query('CALL DeleteShopCategory(?)', {
      replacements: [id]
    });

    res.success(null, 'Category deleted successfully');
  } catch (error) {
    logger.error('Error deleting category:', error);
    next(error);
  }
};

/**
 * Reorder categories
 */
export const reorderCategories = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { orderMap } = req.body;

    // orderMap is expected to be an object like { categoryId: sortOrder, ... }
    for (const [categoryId, sortOrder] of Object.entries(orderMap)) {
      await sequelize.query(
        'UPDATE shop_categories SET sort_order = ? WHERE id = ?',
        { replacements: [sortOrder, categoryId] }
      );
    }

    const queryResult = await sequelize.query('CALL GetAllShopCategories()');
    const results = extractProcedureResult(queryResult);
    const filtered = results.filter(c => c.business_id === businessId);

    res.success(filtered, 'Categories reordered successfully');
  } catch (error) {
    logger.error('Error reordering categories:', error);
    next(error);
  }
};

export default {
  createCategory,
  getCategory,
  getBusinessCategories,
  getCategoriesWithCounts,
  updateCategory,
  deleteCategory,
  reorderCategories
};
