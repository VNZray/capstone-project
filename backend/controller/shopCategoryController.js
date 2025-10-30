import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../utils/errorHandler.js";

// ==================== SHOP CATEGORIES ====================

// Get all shop categories
export async function getAllShopCategories(req, res) {
  try {
    const [data] = await db.query("CALL GetAllShopCategories()");
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get shop categories by business ID
export async function getShopCategoriesByBusinessId(req, res) {
  const { businessId } = req.params;
  try {
    const [data] = await db.query("CALL GetShopCategoriesByBusinessId(?)", [businessId]);
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get shop categories by business ID and type
export async function getShopCategoriesByBusinessIdAndType(req, res) {
  const { businessId } = req.params;
  const { type } = req.query;
  
  if (!type || !['product', 'service', 'both'].includes(type)) {
    return res.status(400).json({ 
      message: "Valid category type is required (product, service, or both)" 
    });
  }
  
  try {
    const [data] = await db.query("CALL GetShopCategoriesByBusinessIdAndType(?, ?)", [
      businessId, 
      type
    ]);
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get shop category by ID
export async function getShopCategoryById(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL GetShopCategoryById(?)", [id]);
    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Shop category not found" });
    }
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Insert a new shop category
export async function insertShopCategory(req, res) {
  try {
    const id = uuidv4();
    const { business_id, name, description, category_type, display_order, status } = req.body;

    // Validate category_type
    if (category_type && !['product', 'service', 'both'].includes(category_type)) {
      return res.status(400).json({ 
        message: "Invalid category type. Must be 'product', 'service', or 'both'" 
      });
    }

    const [data] = await db.query("CALL InsertShopCategory(?, ?, ?, ?, ?, ?, ?)", [
      id, 
      business_id, 
      name, 
      description || null, 
      category_type || 'both',
      display_order || 0, 
      status || 'active'
    ]);
    
    res.status(201).json({
      message: "Shop category created successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update shop category
export async function updateShopCategory(req, res) {
  const { id } = req.params;
  try {
    const { name, description, category_type, display_order, status } = req.body;

    // Validate category_type if provided
    if (category_type && !['product', 'service', 'both'].includes(category_type)) {
      return res.status(400).json({ 
        message: "Invalid category type. Must be 'product', 'service', or 'both'" 
      });
    }

    const [data] = await db.query("CALL UpdateShopCategory(?, ?, ?, ?, ?, ?)", [
      id, 
      name, 
      description, 
      category_type,
      display_order, 
      status
    ]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Shop category not found" });
    }

    res.json({
      message: "Shop category updated successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Delete shop category
export async function deleteShopCategory(req, res) {
  const { id } = req.params;
  try {
    await db.query("CALL DeleteShopCategory(?)", [id]);
    res.json({ message: "Shop category deleted successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get category statistics
export async function getShopCategoryStats(req, res) {
  const { businessId } = req.params;
  try {
    const [data] = await db.query("CALL GetShopCategoryStats(?)", [businessId]);
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}
