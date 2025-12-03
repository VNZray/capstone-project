import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";

// ==================== LEGACY ENDPOINTS (deprecated - redirect to new system) ====================

// get all types - deprecated, returns root-level categories applicable to businesses
export async function getAllTypes(request, response) {
  try {
    // Map to new system: return level 1 categories applicable to business
    const [data] = await db.query(
      "CALL GetAllCategories(?, ?, ?)",
      ['business', 'active', 0]  // root categories for business
    );
    // Transform to match old format
    const types = data[0].map(cat => ({
      id: cat.id,
      type: cat.title
    }));
    response.json(types);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// get all Accommodation and Shop types - deprecated
export const getAccommodationAndShopTypes = async (request, response) => {
  try {
    // Return root-level business categories (Accommodation, Shop)
    const [data] = await db.query(
      "CALL GetAllCategories(?, ?, ?)",
      ['business', 'active', 0]
    );
    const types = data[0]
      .filter(cat => ['accommodation', 'shop'].includes(cat.alias.toLowerCase()))
      .map(cat => ({
        id: cat.id,
        type: cat.title
      }));
    response.json(types);
  } catch (error) {
    console.error("Error fetching Accommodation and Shop types:", error);
    return handleDbError(error, response);
  }
};

// get category by type id - deprecated, returns children of a parent category
export const getCategory = async (request, response) => {
  const { id } = request.params;
  try {
    const [data] = await db.query("CALL GetCategoryChildren(?)", [id]);
    const categories = data[0].map(cat => ({
      id: cat.id,
      category: cat.title,
      type_id: cat.parent_category
    }));
    response.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return handleDbError(error, response);
  }
};

export const getTypeById = async (request, response) => {
  const { id } = request.params;
  try {
    const [data] = await db.query("CALL GetCategoryById(?)", [id]);
    if (!data[0] || data[0].length === 0) {
      return response.status(404).json({ message: "Type not found" });
    }
    const cat = data[0][0];
    response.json({ id: cat.id, type: cat.title });
  } catch (error) {
    console.error("Error fetching Type by ID:", error);
    return handleDbError(error, response);
  }
};

export const getCategoryById = async (request, response) => {
  const { id } = request.params;
  try {
    const [data] = await db.query("CALL GetCategoryById(?)", [id]);
    if (!data[0] || data[0].length === 0) {
      return response.status(404).json({ message: "Category not found" });
    }
    const cat = data[0][0];
    response.json({ 
      id: cat.id, 
      category: cat.title,
      type_id: cat.parent_category 
    });
  } catch (error) {
    console.error("Error fetching Category by ID:", error);
    return handleDbError(error, response);
  }
};

// ==================== NEW HIERARCHICAL CATEGORY ENDPOINTS ====================

/**
 * Get all hierarchical categories with optional filters
 * Query params: applicable_to, status, parent_id
 */
export const getAllCategories = async (request, response) => {
  try {
    const { applicable_to, status, parent_id } = request.query;
    const parentId = parent_id === 'root' ? 0 : (parent_id || null);
    
    const [data] = await db.query(
      "CALL GetAllCategories(?, ?, ?)",
      [applicable_to || null, status || null, parentId]
    );
    response.json(data[0]);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return handleDbError(error, response);
  }
};

/**
 * Get category tree for navigation (only active categories)
 * Query params: applicable_to
 */
export const getCategoryTree = async (request, response) => {
  try {
    const { applicable_to } = request.query;
    const [data] = await db.query("CALL GetCategoryTree(?)", [applicable_to || null]);
    
    // Transform flat list into tree structure
    const categories = data[0];
    const tree = buildCategoryTree(categories);
    
    response.json(tree);
  } catch (error) {
    console.error("Error fetching category tree:", error);
    return handleDbError(error, response);
  }
};

/**
 * Get single category by ID (new schema)
 */
export const getHierarchicalCategoryById = async (request, response) => {
  const { id } = request.params;
  try {
    const [data] = await db.query("CALL GetCategoryById(?)", [id]);
    if (!data[0] || data[0].length === 0) {
      return response.status(404).json({ message: "Category not found" });
    }
    response.json(data[0][0]);
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    return handleDbError(error, response);
  }
};

/**
 * Get children of a category
 */
export const getCategoryChildren = async (request, response) => {
  const { id } = request.params;
  try {
    const [data] = await db.query("CALL GetCategoryChildren(?)", [id]);
    response.json(data[0]);
  } catch (error) {
    console.error("Error fetching category children:", error);
    return handleDbError(error, response);
  }
};

/**
 * Create a new category
 */
export const createCategory = async (request, response) => {
  try {
    const { parent_category, alias, title, description, applicable_to, status, sort_order } = request.body;
    
    if (!alias || !title) {
      return response.status(400).json({ message: "alias and title are required" });
    }
    
    const [data] = await db.query(
      "CALL InsertCategory(?, ?, ?, ?, ?, ?, ?)",
      [parent_category || null, alias, title, description || null, applicable_to || 'all', status || 'active', sort_order || 0]
    );
    
    response.status(201).json({ id: data[0][0].id, message: "Category created successfully" });
  } catch (error) {
    console.error("Error creating category:", error);
    return handleDbError(error, response);
  }
};

/**
 * Update a category
 */
export const updateCategory = async (request, response) => {
  const { id } = request.params;
  try {
    const { parent_category, alias, title, description, applicable_to, status, sort_order } = request.body;
    
    const [data] = await db.query(
      "CALL UpdateCategory(?, ?, ?, ?, ?, ?, ?, ?)",
      [id, parent_category, alias || null, title || null, description, applicable_to || null, status || null, sort_order]
    );
    
    if (data[0][0].affected_rows === 0) {
      return response.status(404).json({ message: "Category not found" });
    }
    
    response.json({ message: "Category updated successfully" });
  } catch (error) {
    console.error("Error updating category:", error);
    return handleDbError(error, response);
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (request, response) => {
  const { id } = request.params;
  try {
    const [data] = await db.query("CALL DeleteCategory(?)", [id]);
    
    if (data[0][0].affected_rows === 0) {
      return response.status(404).json({ message: "Category not found" });
    }
    
    response.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return handleDbError(error, response);
  }
};

// ==================== ENTITY CATEGORIES ENDPOINTS ====================

/**
 * Get categories for an entity
 */
export const getEntityCategories = async (request, response) => {
  const { entityId, entityType } = request.params;
  try {
    const [data] = await db.query(
      "CALL GetEntityCategories(?, ?)",
      [entityId, entityType]
    );
    response.json(data[0]);
  } catch (error) {
    console.error("Error fetching entity categories:", error);
    return handleDbError(error, response);
  }
};

/**
 * Add category to an entity
 */
export const addEntityCategory = async (request, response) => {
  const { entityId, entityType } = request.params;
  const { category_id, level, is_primary } = request.body;
  
  try {
    if (!category_id) {
      return response.status(400).json({ message: "category_id is required" });
    }
    
    const [data] = await db.query(
      "CALL AddEntityCategory(?, ?, ?, ?, ?)",
      [entityId, entityType, category_id, level || 1, is_primary || false]
    );
    
    response.status(201).json({ id: data[0][0].id, message: "Category added to entity" });
  } catch (error) {
    console.error("Error adding entity category:", error);
    return handleDbError(error, response);
  }
};

/**
 * Remove category from an entity
 */
export const removeEntityCategory = async (request, response) => {
  const { entityId, entityType, categoryId } = request.params;
  
  try {
    const [data] = await db.query(
      "CALL RemoveEntityCategory(?, ?, ?)",
      [entityId, entityType, categoryId]
    );
    
    if (data[0][0].affected_rows === 0) {
      return response.status(404).json({ message: "Entity category not found" });
    }
    
    response.json({ message: "Category removed from entity" });
  } catch (error) {
    console.error("Error removing entity category:", error);
    return handleDbError(error, response);
  }
};

/**
 * Set primary category for an entity
 */
export const setEntityPrimaryCategory = async (request, response) => {
  const { entityId, entityType, categoryId } = request.params;
  
  try {
    const [data] = await db.query(
      "CALL SetEntityPrimaryCategory(?, ?, ?)",
      [entityId, entityType, categoryId]
    );
    
    response.json({ message: "Primary category set successfully" });
  } catch (error) {
    console.error("Error setting primary category:", error);
    return handleDbError(error, response);
  }
};

/**
 * Get all entities in a category
 */
export const getEntitiesByCategory = async (request, response) => {
  const { categoryId } = request.params;
  const { entity_type, include_children } = request.query;
  
  try {
    const [data] = await db.query(
      "CALL GetEntitiesByCategory(?, ?, ?)",
      [categoryId, entity_type || null, include_children === 'true']
    );
    response.json(data[0]);
  } catch (error) {
    console.error("Error fetching entities by category:", error);
    return handleDbError(error, response);
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Build tree structure from flat category list
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
