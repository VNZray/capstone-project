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

// Insert a new discount
export async function insertDiscount(req, res) {
  try {
    const id = uuidv4();
    const {
      business_id,
      name,
      description,
      discount_type,
      discount_value,
      minimum_order_amount,
      maximum_discount_amount,
      start_datetime,
      end_datetime,
      usage_limit,
      usage_limit_per_customer,
      status,
      applicable_products
    } = req.body;

    // Insert discount using stored procedure
    const [data] = await db.query("CALL InsertDiscount(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
      id, business_id, name, description || null, discount_type, discount_value,
      minimum_order_amount || 0, maximum_discount_amount || null, start_datetime,
      end_datetime || null, usage_limit || null, usage_limit_per_customer || null,
      status || 'active'
    ]);

    // Insert applicable products if provided
    if (applicable_products && applicable_products.length > 0) {
      for (const productId of applicable_products) {
        const dpId = uuidv4();
        await db.query("CALL InsertDiscountProduct(?, ?, ?)", [dpId, id, productId]);
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

// Update discount
export async function updateDiscount(req, res) {
  const { id } = req.params;
  try {
    const {
      name,
      description,
      discount_type,
      discount_value,
      minimum_order_amount,
      maximum_discount_amount,
      start_datetime,
      end_datetime,
      usage_limit,
      usage_limit_per_customer,
      status,
      applicable_products
    } = req.body;

    const [data] = await db.query("CALL UpdateDiscount(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
      id, name, description, discount_type, discount_value, minimum_order_amount,
      maximum_discount_amount, start_datetime, end_datetime, usage_limit,
      usage_limit_per_customer, status
    ]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Discount not found" });
    }

    // Update applicable products if provided
    if (applicable_products !== undefined) {
      // Remove existing product associations
      await db.query("CALL DeleteDiscountProducts(?)", [id]);
      
      // Add new product associations
      if (applicable_products.length > 0) {
        for (const productId of applicable_products) {
          const dpId = uuidv4();
          await db.query("CALL InsertDiscountProduct(?, ?, ?)", [dpId, id, productId]);
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

// Apply discount to order (validation)
export async function validateDiscount(req, res) {
  const { discountId } = req.params;
  const { order_total, user_id, product_ids } = req.body;
  
  try {
    // Use stored procedure for validation
    const [data] = await db.query("CALL ValidateDiscount(?, ?, ?)", [
      discountId, order_total, user_id || null
    ]);

    if (!data || data.length === 0) {
      return res.status(400).json({ 
        message: "Discount validation failed" 
      });
    }

    const discountData = data[0];

    // Check if discount applies to specific products (still need this logic as it's complex)
    const [applicableProducts] = await db.query(
      "SELECT product_id FROM discount_product WHERE discount_id = ?",
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
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discountData.discount_type === 'percentage') {
      discountAmount = (order_total * discountData.discount_value) / 100;
      if (discountData.maximum_discount_amount) {
        discountAmount = Math.min(discountAmount, discountData.maximum_discount_amount);
      }
    } else {
      discountAmount = discountData.discount_value;
    }

    // Ensure discount doesn't exceed order total
    discountAmount = Math.min(discountAmount, order_total);

    res.json({
      valid: true,
      discount: {
        id: discountData.id,
        name: discountData.name,
        discount_type: discountData.discount_type,
        discount_value: discountData.discount_value,
        discount_amount: Number(discountAmount.toFixed(2))
      }
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update discount usage count (called when order is completed)
export async function updateDiscountUsage(req, res) {
  const { discountId } = req.params;
  
  try {
    await db.query("CALL UpdateDiscountUsage(?)", [discountId]);
    res.json({ message: "Discount usage count updated successfully" });
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
