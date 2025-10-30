import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../utils/errorHandler.js";

// ==================== DISCOUNTS ====================

// Get all discounts
export async function getAllDiscounts(req, res) {
  try {
    const [data] = await db.query("CALL GetAllDiscounts()");
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get discounts by business ID
export async function getDiscountsByBusinessId(req, res) {
  const { businessId } = req.params;
  try {
    const [data] = await db.query("CALL GetDiscountsByBusinessId(?)", [businessId]);
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get active discounts by business ID
export async function getActiveDiscountsByBusinessId(req, res) {
  const { businessId } = req.params;
  try {
    const [data] = await db.query("CALL GetActiveDiscountsByBusinessId(?)", [businessId]);
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get discount by ID
export async function getDiscountById(req, res) {
  const { id } = req.params;
  try {
    const [results] = await db.query("CALL GetDiscountById(?)", [id]);
    
    if (!results || results.length < 2 || results[0].length === 0) {
      return res.status(404).json({ message: "Discount not found" });
    }

    const discountData = results[0][0];
    const applicableProducts = results[1] || [];

    const result = {
      ...discountData,
      applicable_products: applicableProducts
    };

    res.json(result);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Insert a new discount (simplified structure)
export async function insertDiscount(req, res) {
  try {
    const id = uuidv4();
    const {
      business_id,
      name,
      description,
      start_datetime,
      end_datetime,
      status,
      applicable_products // Array of { product_id, discounted_price, stock_limit, purchase_limit }
    } = req.body;

    // Insert discount using stored procedure (simplified parameters, no discount_value)
    const [data] = await db.query("CALL InsertDiscount(?, ?, ?, ?, ?, ?, ?)", [
      id, business_id, name, description || null,
      start_datetime, end_datetime || null,
      status || 'active'
    ]);

    // Insert applicable products with discounted price, stock and purchase limits if provided
    if (applicable_products && applicable_products.length > 0) {
      for (const product of applicable_products) {
        const dpId = uuidv4();
        await db.query("CALL InsertDiscountProduct(?, ?, ?, ?, ?, ?)", [
          dpId, 
          id, 
          product.product_id,
          product.discounted_price,
          product.stock_limit || null,
          product.purchase_limit || null
        ]);
      }
    }
    
    res.status(201).json({
      message: "Discount created successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update discount (simplified structure)
export async function updateDiscount(req, res) {
  const { id } = req.params;
  try {
    const {
      name,
      description,
      start_datetime,
      end_datetime,
      status,
      applicable_products // Array of { product_id, discounted_price, stock_limit, purchase_limit }
    } = req.body;

    const [data] = await db.query("CALL UpdateDiscount(?, ?, ?, ?, ?, ?)", [
      id, name, description, start_datetime, end_datetime, 
      status
    ]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Discount not found" });
    }

    // Update applicable products if provided
    if (applicable_products !== undefined) {
      // Remove existing product associations
      await db.query("CALL DeleteDiscountProducts(?)", [id]);
      
      // Add new product associations with discounted price and limits
      if (applicable_products.length > 0) {
        for (const product of applicable_products) {
          const dpId = uuidv4();
          await db.query("CALL InsertDiscountProduct(?, ?, ?, ?, ?, ?)", [
            dpId, 
            id, 
            product.product_id,
            product.discounted_price,
            product.stock_limit || null,
            product.purchase_limit || null
          ]);
        }
      }
    }

    res.json({
      message: "Discount updated successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Delete discount
export async function deleteDiscount(req, res) {
  const { id } = req.params;
  try {
    await db.query("CALL DeleteDiscount(?)", [id]);
    res.json({ message: "Discount deleted successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Apply discount to order (validation) - Simplified
export async function validateDiscount(req, res) {
  const { discountId } = req.params;
  const { order_total, user_id, product_ids } = req.body;
  
  try {
    // Use stored procedure for validation (simplified - no minimum order check)
    const [data] = await db.query("CALL ValidateDiscount(?, ?, ?)", [
      discountId, order_total, user_id || null
    ]);

    if (!data || data.length === 0) {
      return res.status(400).json({ 
        message: "Discount validation failed" 
      });
    }

    const discountData = data[0];

    // Check if discount applies to specific products
    const [applicableProducts] = await db.query(
      "SELECT product_id, stock_limit, current_stock_used, purchase_limit FROM discount_product WHERE discount_id = ?",
      [discountId]
    );

    if (applicableProducts.length > 0 && product_ids && product_ids.length > 0) {
      const applicableProductIds = applicableProducts.map(p => p.product_id);
      const hasApplicableProduct = product_ids.some(id => applicableProductIds.includes(id));
      
      if (!hasApplicableProduct) {
        return res.status(400).json({ 
          message: "Discount is not applicable to the products in your order" 
        });
      }

      // Check stock limits for applicable products
      for (const product of applicableProducts) {
        if (product.stock_limit !== null && product.current_stock_used >= product.stock_limit) {
          return res.status(400).json({
            message: "Discount stock limit reached for one or more products"
          });
        }
      }
    }

    // Discount value is now fixed amount (not percentage)
    const discountAmount = Math.min(discountData.discount_value, order_total);

    res.json({
      valid: true,
      discount: {
        id: discountData.id,
        name: discountData.name,
        discount_value: discountData.discount_value,
        discount_amount: Number(discountAmount.toFixed(2))
      }
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update discount product stock (called when product is purchased with discount)
export async function updateDiscountProductStock(req, res) {
  const { discountId, productId } = req.params;
  const { quantity } = req.body;
  
  try {
    await db.query("CALL UpdateDiscountProductStock(?, ?, ?)", [discountId, productId, quantity || 1]);
    res.json({ message: "Discount product stock updated successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Batch update discount products (set stock and purchase limits for all products)
export async function batchUpdateDiscountProducts(req, res) {
  const { discountId } = req.params;
  const { stock_limit, purchase_limit } = req.body;
  
  try {
    await db.query("CALL BatchUpdateDiscountProducts(?, ?, ?)", [
      discountId, 
      stock_limit || null, 
      purchase_limit || null
    ]);
    res.json({ message: "Discount products updated successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get discount usage statistics
export async function getDiscountStats(req, res) {
  const { id } = req.params;
  
  try {
    const [results] = await db.query("CALL GetDiscountStats(?)", [id]);
    
    if (!results || results.length < 3) {
      return res.status(404).json({ message: "Discount not found" });
    }

    const discount = results[0][0];
    const statistics = results[1][0];
    const recent_orders = results[2];

    res.json({
      discount: discount,
      statistics: statistics,
      recent_orders: recent_orders
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update expired discounts - automatically mark discounts as 'expired' if end_datetime has passed
export async function updateExpiredDiscounts(req, res) {
  try {
    const [results] = await db.query("CALL UpdateExpiredDiscounts()");
    
    if (!results || results.length === 0) {
      return res.json({ 
        message: "No expired discounts to update",
        updated_count: 0 
      });
    }

    const result = results[0][0] || { updated_count: 0 };

    res.json({
      message: "Expired discounts updated successfully",
      updated_count: result.updated_count
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}
