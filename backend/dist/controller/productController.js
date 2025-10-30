import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../utils/errorHandler.js";

// ==================== PRODUCT CATEGORIES ====================

// Get all product categories
export async function getAllProductCategories(req, res) {
  try {
    const [data] = await db.query("CALL GetAllProductCategories()");
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get product categories by business ID
export async function getProductCategoriesByBusinessId(req, res) {
  const { businessId } = req.params;
  try {
    const [data] = await db.query("CALL GetProductCategoriesByBusinessId(?)", [businessId]);
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get product category by ID
export async function getProductCategoryById(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL GetProductCategoryById(?)", [id]);
    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Product category not found" });
    }
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Insert a new product category
export async function insertProductCategory(req, res) {
  try {
    const id = uuidv4();
    const { business_id, name, description, display_order, status } = req.body;

    const [data] = await db.query("CALL InsertProductCategory(?, ?, ?, ?, ?, ?)", [
      id, business_id, name, description || null, display_order || 0, status || 'active'
    ]);
    
    res.status(201).json({
      message: "Product category created successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update product category
export async function updateProductCategory(req, res) {
  const { id } = req.params;
  try {
    const { name, description, display_order, status } = req.body;

    const [data] = await db.query("CALL UpdateProductCategory(?, ?, ?, ?, ?)", [
      id, name, description, display_order, status
    ]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Product category not found" });
    }

    res.json({
      message: "Product category updated successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Delete product category
export async function deleteProductCategory(req, res) {
  const { id } = req.params;
  try {
    await db.query("CALL DeleteProductCategory(?)", [id]);
    res.json({ message: "Product category deleted successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// ==================== PRODUCTS ====================

// Get all products
export async function getAllProducts(req, res) {
  try {
    const [data] = await db.query("CALL GetAllProducts()");
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get products by business ID
export async function getProductsByBusinessId(req, res) {
  const { businessId } = req.params;
  try {
    const [data] = await db.query("CALL GetProductsByBusinessId(?)", [businessId]);
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get products by category ID
export async function getProductsByCategoryId(req, res) {
  const { categoryId } = req.params;
  try {
    const [data] = await db.query("CALL GetProductsByCategoryId(?)", [categoryId]);
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get product by ID
export async function getProductById(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL GetProductById(?)", [id]);
    
    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Insert a new product
export async function insertProduct(req, res) {
  try {
    const productId = uuidv4();
    const stockId = uuidv4();
    const { business_id, product_category_id, name, description, price, image_url, status } = req.body;

    const [data] = await db.query("CALL InsertProduct(?, ?, ?, ?, ?, ?, ?, ?, ?)", [
      productId, business_id, product_category_id, name, description || null, 
      price, image_url || null, status || 'active', stockId
    ]);
    
    res.status(201).json({
      message: "Product created successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update product
export async function updateProduct(req, res) {
  const { id } = req.params;
  try {
    const { product_category_id, name, description, price, image_url, status } = req.body;

    const [data] = await db.query("CALL UpdateProduct(?, ?, ?, ?, ?, ?, ?)", [
      id, product_category_id, name, description, price, image_url, status
    ]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Delete product
export async function deleteProduct(req, res) {
  const { id } = req.params;
  try {
    await db.query("CALL DeleteProduct(?)", [id]);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// ==================== PRODUCT STOCK ====================

// Get stock for product
export async function getProductStock(req, res) {
  const { productId } = req.params;
  try {
    const [data] = await db.query("CALL GetProductStock(?)", [productId]);
    
    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Product stock not found" });
    }
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update product stock
export async function updateProductStock(req, res) {
  const { productId } = req.params;
  const { quantity_change, change_type, notes, created_by } = req.body;
  
  try {
    const historyId = uuidv4();

    const [data] = await db.query("CALL UpdateProductStock(?, ?, ?, ?, ?, ?)", [
      productId, quantity_change, change_type, notes || null, created_by || null, historyId
    ]);

    res.json({
      message: "Product stock updated successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get stock history for product
export async function getProductStockHistory(req, res) {
  const { productId } = req.params;
  try {
    const [data] = await db.query("CALL GetProductStockHistory(?)", [productId]);
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}
