import db from "../db.js";

/**
 * Category Procedures
 * Handles hierarchical categories and entity-category relationships
 * 
 * Categories table: Defines category hierarchy (parent_category for tree structure)
 * Entity_categories table: Links entities to categories with priority levels
 *   - level: 1=Primary, 2=Secondary, 3=Tertiary
 *   - is_primary: Boolean flag for quick primary lookups
 */

// ==================== CATEGORY CRUD ====================

/**
 * Get all categories with optional filters
 * @param {string|null} applicableTo - Filter by applicable_to (business, tourist_spot, event)
 * @param {string|null} status - Filter by status (active, inactive)
 * @param {number|null} parentId - Filter by parent (0 for root categories, null for all)
 */
export async function getAllCategories(applicableTo = null, status = null, parentId = null) {
  const [rows] = await db.query("CALL GetAllCategories(?, ?, ?)", [
    applicableTo,
    status,
    parentId
  ]);
  return rows[0];
}

/**
 * Get category tree for hierarchical display
 * @param {string|null} applicableTo - Filter by applicable_to
 */
export async function getCategoryTree(applicableTo = null) {
  const [rows] = await db.query("CALL GetCategoryTree(?)", [applicableTo]);
  return rows[0];
}

/**
 * Get single category by ID
 * @param {number} id - Category ID
 */
export async function getCategoryById(id) {
  const [rows] = await db.query("CALL GetCategoryById(?)", [id]);
  return rows[0]?.[0] || null;
}

/**
 * Get children of a category
 * @param {number} parentId - Parent category ID
 */
export async function getCategoryChildren(parentId) {
  const [rows] = await db.query("CALL GetCategoryChildren(?)", [parentId]);
  return rows[0];
}

/**
 * Insert a new category
 * @param {object} category - Category data
 */
export async function insertCategory(category) {
  const {
    parent_category = null,
    alias,
    title,
    description = null,
    applicable_to = 'all',
    status = 'active',
    sort_order = 0
  } = category;

  const [rows] = await db.query(
    "CALL InsertCategory(?, ?, ?, ?, ?, ?, ?)",
    [parent_category, alias, title, description, applicable_to, status, sort_order]
  );
  return rows[0]?.[0] || null;
}

/**
 * Update a category
 * @param {number} id - Category ID
 * @param {object} updates - Fields to update
 */
export async function updateCategory(id, updates) {
  const {
    parent_category,
    alias,
    title,
    description,
    applicable_to,
    status,
    sort_order
  } = updates;

  const [rows] = await db.query(
    "CALL UpdateCategory(?, ?, ?, ?, ?, ?, ?, ?)",
    [id, parent_category, alias, title, description, applicable_to, status, sort_order]
  );
  return rows[0]?.[0] || null;
}

/**
 * Delete a category
 * @param {number} id - Category ID
 */
export async function deleteCategory(id) {
  const [rows] = await db.query("CALL DeleteCategory(?)", [id]);
  return rows[0]?.[0] || null;
}

// ==================== ENTITY CATEGORIES ====================

/**
 * Get all categories for an entity
 * @param {string} entityId - Entity UUID
 * @param {string} entityType - Entity type (business, tourist_spot, event)
 */
export async function getEntityCategories(entityId, entityType) {
  const [rows] = await db.query("CALL GetEntityCategories(?, ?)", [entityId, entityType]);
  return rows[0];
}

/**
 * Add a category to an entity
 * @param {string} entityId - Entity UUID
 * @param {string} entityType - Entity type
 * @param {number} categoryId - Category ID
 * @param {number} level - Priority level (1=Primary, 2=Secondary, 3=Tertiary)
 * @param {boolean} isPrimary - Is this the primary category
 */
export async function addEntityCategory(entityId, entityType, categoryId, level = 1, isPrimary = false) {
  const [rows] = await db.query(
    "CALL AddEntityCategory(?, ?, ?, ?, ?)",
    [entityId, entityType, categoryId, level, isPrimary]
  );
  return rows[0]?.[0] || null;
}

/**
 * Remove a category from an entity
 * @param {string} entityId - Entity UUID
 * @param {string} entityType - Entity type
 * @param {number} categoryId - Category ID
 */
export async function removeEntityCategory(entityId, entityType, categoryId) {
  const [rows] = await db.query(
    "CALL RemoveEntityCategory(?, ?, ?)",
    [entityId, entityType, categoryId]
  );
  return rows[0]?.[0] || null;
}

/**
 * Set primary category for an entity
 * @param {string} entityId - Entity UUID
 * @param {string} entityType - Entity type
 * @param {number} categoryId - Category ID to set as primary
 */
export async function setEntityPrimaryCategory(entityId, entityType, categoryId) {
  const [rows] = await db.query(
    "CALL SetEntityPrimaryCategory(?, ?, ?)",
    [entityId, entityType, categoryId]
  );
  return rows[0]?.[0] || null;
}

/**
 * Get all entities in a category
 * @param {number} categoryId - Category ID
 * @param {string|null} entityType - Filter by entity type
 * @param {boolean} includeChildren - Include entities in child categories
 */
export async function getEntitiesByCategory(categoryId, entityType = null, includeChildren = false) {
  const [rows] = await db.query(
    "CALL GetEntitiesByCategory(?, ?, ?)",
    [categoryId, entityType, includeChildren]
  );
  return rows[0];
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Build tree structure from flat category list
 * @param {Array} categories - Flat array of categories
 * @returns {Array} Tree structure
 */
export function buildCategoryTree(categories) {
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

/**
 * Get category depth in tree (computed from parent chain)
 * @param {number} categoryId - Category ID
 * @returns {number} Depth level (1=root, 2=child, 3=grandchild)
 */
export async function getCategoryDepth(categoryId) {
  let depth = 1;
  let currentId = categoryId;
  
  while (currentId) {
    const category = await getCategoryById(currentId);
    if (!category || !category.parent_category) break;
    currentId = category.parent_category;
    depth++;
  }
  
  return depth;
}

export default {
  // Category CRUD
  getAllCategories,
  getCategoryTree,
  getCategoryById,
  getCategoryChildren,
  insertCategory,
  updateCategory,
  deleteCategory,
  
  // Entity categories
  getEntityCategories,
  addEntityCategory,
  removeEntityCategory,
  setEntityPrimaryCategory,
  getEntitiesByCategory,
  
  // Helpers
  buildCategoryTree,
  getCategoryDepth,
};
