/**
 * Category Controller
 * Handles categories and entity categories management
 * Uses stored procedures for database operations
 */
import { sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';

// ==================== HELPER FUNCTIONS ====================

/**
 * Build tree structure from flat category list
 * @param {Array} categories - Flat array of categories
 * @returns {Array} Tree structure
 */
function buildCategoryTree(categories) {
  const map = {};
  const roots = [];

  // Create map of all categories
  categories.forEach(cat => {
    map[cat.id] = { ...cat, children: [] };
  });

  // Build tree
  categories.forEach(cat => {
    if (cat.parent_category && map[cat.parent_category]) {
      map[cat.parent_category].children.push(map[cat.id]);
    } else {
      roots.push(map[cat.id]);
    }
  });

  return roots;
}

// ==================== LEGACY ENDPOINTS (deprecated - redirect to new system) ====================

/**
 * Get all types - deprecated, returns root-level categories applicable to businesses
 */
export const getAllTypes = async (req, res, next) => {
  try {
    const [data] = await sequelize.query(
      'CALL GetAllCategories(?, ?, ?)',
      { replacements: ['business', 'active', 0] }
    );

    // Transform to match old format
    const types = data.map(cat => ({
      id: cat.id,
      type: cat.title
    }));

    res.success(types);
  } catch (error) {
    logger.error('Error fetching types:', error);
    next(error);
  }
};

/**
 * Get all Accommodation and Shop types - deprecated
 */
export const getAccommodationAndShopTypes = async (req, res, next) => {
  try {
    const [data] = await sequelize.query(
      'CALL GetAllCategories(?, ?, ?)',
      { replacements: ['business', 'active', 0] }
    );

    const types = data
      .filter(cat => ['accommodation', 'shop'].includes(cat.alias?.toLowerCase()))
      .map(cat => ({
        id: cat.id,
        type: cat.title
      }));

    res.success(types);
  } catch (error) {
    logger.error('Error fetching Accommodation and Shop types:', error);
    next(error);
  }
};

/**
 * Get category by type id - deprecated, returns children of a parent category
 */
export const getLegacyCategory = async (req, res, next) => {
  const { id } = req.params;

  try {
    const [data] = await sequelize.query(
      'CALL GetCategoryChildren(?)',
      { replacements: [id] }
    );

    const categories = data.map(cat => ({
      id: cat.id,
      category: cat.title,
      type_id: cat.parent_category
    }));

    res.success(categories);
  } catch (error) {
    logger.error('Error fetching categories:', error);
    next(error);
  }
};

/**
 * Get type by ID - deprecated
 */
export const getTypeById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const [data] = await sequelize.query(
      'CALL GetCategoryById(?)',
      { replacements: [id] }
    );

    if (!data || data.length === 0) {
      throw ApiError.notFound('Type not found');
    }

    const cat = data[0];
    res.success({ id: cat.id, type: cat.title });
  } catch (error) {
    logger.error('Error fetching Type by ID:', error);
    next(error);
  }
};

/**
 * Get legacy category by ID - deprecated
 */
export const getLegacyCategoryById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const [data] = await sequelize.query(
      'CALL GetCategoryById(?)',
      { replacements: [id] }
    );

    if (!data || data.length === 0) {
      throw ApiError.notFound('Category not found');
    }

    const cat = data[0];
    res.success({
      id: cat.id,
      category: cat.title,
      type_id: cat.parent_category
    });
  } catch (error) {
    logger.error('Error fetching Category by ID:', error);
    next(error);
  }
};

// ==================== NEW HIERARCHICAL CATEGORY ENDPOINTS ====================

/**
 * Get all hierarchical categories with optional filters
 * Query params: applicable_to, status, parent_id
 */
export const getAllCategories = async (req, res, next) => {
  try {
    const { applicable_to, status, parent_id } = req.query;
    const parentId = parent_id === 'root' ? 0 : (parent_id || null);

    const [data] = await sequelize.query(
      'CALL GetAllCategories(?, ?, ?)',
      { replacements: [applicable_to || null, status || null, parentId] }
    );

    res.success(data);
  } catch (error) {
    logger.error('Error fetching categories:', error);
    next(error);
  }
};

/**
 * Get category tree for navigation (only active categories)
 * Query params: applicable_to
 */
export const getCategoryTree = async (req, res, next) => {
  try {
    const { applicable_to } = req.query;

    const [data] = await sequelize.query(
      'CALL GetCategoryTree(?)',
      { replacements: [applicable_to || null] }
    );

    // Transform flat list into tree structure
    const tree = buildCategoryTree(data);

    res.success(tree);
  } catch (error) {
    logger.error('Error fetching category tree:', error);
    next(error);
  }
};

/**
 * Get single category by ID
 */
export const getCategoryById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const [data] = await sequelize.query(
      'CALL GetCategoryById(?)',
      { replacements: [id] }
    );

    if (!data || data.length === 0) {
      throw ApiError.notFound('Category not found');
    }

    res.success(data[0]);
  } catch (error) {
    logger.error('Error fetching category by ID:', error);
    next(error);
  }
};

/**
 * Get children of a category
 */
export const getCategoryChildren = async (req, res, next) => {
  const { id } = req.params;

  try {
    const [data] = await sequelize.query(
      'CALL GetCategoryChildren(?)',
      { replacements: [id] }
    );

    res.success(data);
  } catch (error) {
    logger.error('Error fetching category children:', error);
    next(error);
  }
};

/**
 * Create a new category
 */
export const createCategory = async (req, res, next) => {
  try {
    const { parent_category, alias, title, description, applicable_to, status, sort_order } = req.body;

    if (!alias || !title) {
      throw ApiError.badRequest('Alias and title are required');
    }

    const [data] = await sequelize.query(
      'CALL InsertCategory(?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [
          parent_category || null,
          alias,
          title,
          description || null,
          applicable_to || 'all',
          status || 'active',
          sort_order || 0
        ]
      }
    );

    res.created({ id: data[0].id, message: 'Category created successfully' });
  } catch (error) {
    logger.error('Error creating category:', error);
    next(error);
  }
};

/**
 * Update a category
 */
export const updateCategory = async (req, res, next) => {
  const { id } = req.params;

  try {
    const { parent_category, alias, title, description, applicable_to, status, sort_order } = req.body;

    const [data] = await sequelize.query(
      'CALL UpdateCategory(?, ?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [
          id,
          parent_category,
          alias || null,
          title || null,
          description,
          applicable_to || null,
          status || null,
          sort_order
        ]
      }
    );

    if (data[0].affected_rows === 0) {
      throw ApiError.notFound('Category not found');
    }

    res.success({ message: 'Category updated successfully' });
  } catch (error) {
    logger.error('Error updating category:', error);
    next(error);
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (req, res, next) => {
  const { id } = req.params;

  try {
    const [data] = await sequelize.query(
      'CALL DeleteCategory(?)',
      { replacements: [id] }
    );

    if (data[0].affected_rows === 0) {
      throw ApiError.notFound('Category not found');
    }

    res.success({ message: 'Category deleted successfully' });
  } catch (error) {
    logger.error('Error deleting category:', error);
    next(error);
  }
};

// ==================== ENTITY CATEGORIES ENDPOINTS ====================

/**
 * Get categories for an entity
 */
export const getEntityCategories = async (req, res, next) => {
  const { entityId, entityType } = req.params;

  try {
    const [data] = await sequelize.query(
      'CALL GetEntityCategories(?, ?)',
      { replacements: [entityId, entityType] }
    );

    res.success(data);
  } catch (error) {
    logger.error('Error fetching entity categories:', error);
    next(error);
  }
};

/**
 * Add category to an entity
 */
export const addEntityCategory = async (req, res, next) => {
  const { entityId, entityType } = req.params;
  const { category_id, level, is_primary } = req.body;

  try {
    if (!category_id) {
      throw ApiError.badRequest('category_id is required');
    }

    const [data] = await sequelize.query(
      'CALL AddEntityCategory(?, ?, ?, ?, ?)',
      { replacements: [entityId, entityType, category_id, level || 1, is_primary || false] }
    );

    res.created({ id: data[0].id, message: 'Category added to entity' });
  } catch (error) {
    logger.error('Error adding entity category:', error);
    next(error);
  }
};

/**
 * Remove category from an entity
 */
export const removeEntityCategory = async (req, res, next) => {
  const { entityId, entityType, categoryId } = req.params;

  try {
    const [data] = await sequelize.query(
      'CALL RemoveEntityCategory(?, ?, ?)',
      { replacements: [entityId, entityType, categoryId] }
    );

    if (data[0].affected_rows === 0) {
      throw ApiError.notFound('Entity category not found');
    }

    res.success({ message: 'Category removed from entity' });
  } catch (error) {
    logger.error('Error removing entity category:', error);
    next(error);
  }
};

/**
 * Set primary category for an entity
 */
export const setEntityPrimaryCategory = async (req, res, next) => {
  const { entityId, entityType, categoryId } = req.params;

  try {
    await sequelize.query(
      'CALL SetEntityPrimaryCategory(?, ?, ?)',
      { replacements: [entityId, entityType, categoryId] }
    );

    res.success({ message: 'Primary category set successfully' });
  } catch (error) {
    logger.error('Error setting primary category:', error);
    next(error);
  }
};

/**
 * Get all entities in a category
 */
export const getEntitiesByCategory = async (req, res, next) => {
  const { categoryId } = req.params;
  const { entity_type, include_children } = req.query;

  try {
    const [data] = await sequelize.query(
      'CALL GetEntitiesByCategory(?, ?, ?)',
      { replacements: [categoryId, entity_type || null, include_children === 'true'] }
    );

    res.success(data);
  } catch (error) {
    logger.error('Error fetching entities by category:', error);
    next(error);
  }
};
