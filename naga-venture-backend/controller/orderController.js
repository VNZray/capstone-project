import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../utils/errorHandler.js";

// ==================== ORDERS ====================

// Get all orders
export async function getAllOrders(req, res) {
  try {
    const [data] = await db.query("CALL GetAllOrders()");
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get orders by business ID
export async function getOrdersByBusinessId(req, res) {
  const { businessId } = req.params;
  try {
    const [data] = await db.query("CALL GetOrdersByBusinessId(?)", [businessId]);
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get orders by user ID
export async function getOrdersByUserId(req, res) {
  const { userId } = req.params;
  try {
    const [data] = await db.query("CALL GetOrdersByUserId(?)", [userId]);
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get order by ID
export async function getOrderById(req, res) {
  const { id } = req.params;
  try {
    const [results] = await db.query("CALL GetOrderById(?)", [id]);
    
    if (!results || results.length < 2 || results[0].length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderData = results[0][0];
    const items = results[1] || [];

    const result = {
      ...orderData,
      items: items
    };

    res.json(result);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Insert a new order
export async function insertOrder(req, res) {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const orderId = uuidv4();
    const { 
      business_id, 
      user_id, 
      items, 
      discount_id, 
      pickup_datetime, 
      special_instructions,
      payment_method 
    } = req.body;

    // Calculate order totals
    let subtotal = 0;
    const orderItems = [];
    
    for (const item of items) {
      const [product] = await connection.query("SELECT price FROM product WHERE id = ?", [item.product_id]);
      if (!product || product.length === 0) {
        throw new Error(`Product with ID ${item.product_id} not found`);
      }
      
      const unitPrice = product[0].price;
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;
      
      orderItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        special_requests: item.special_requests || null
      });
    }

    // Apply discount if provided
    let discountAmount = 0;
    if (discount_id) {
      try {
        const [discountData] = await connection.query("CALL ValidateDiscount(?, ?, ?)", [
          discount_id, subtotal, user_id
        ]);
        
        if (discountData && discountData.length > 0) {
          const discount = discountData[0];
          
          if (discount.discount_type === 'percentage') {
            discountAmount = (subtotal * discount.discount_value) / 100;
            if (discount.maximum_discount_amount) {
              discountAmount = Math.min(discountAmount, discount.maximum_discount_amount);
            }
          } else {
            discountAmount = discount.discount_value;
          }
          
          discountAmount = Math.min(discountAmount, subtotal);
        }
      } catch (discountError) {
        // If discount validation fails, continue without discount
        console.warn("Discount validation failed:", discountError.message);
        discount_id = null;
      }
    }

    const taxAmount = 0; // You can implement tax calculation logic here
    const totalAmount = subtotal - discountAmount + taxAmount;

    // Generate order number
    const timestamp = Date.now().toString().slice(-8);
    const orderNumber = `ORD-${timestamp}`;

    // Insert order using stored procedure
    const [orderResult] = await connection.query("CALL InsertOrder(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
      orderId, business_id, user_id, orderNumber, subtotal, discountAmount, taxAmount, totalAmount,
      discount_id || null, pickup_datetime, special_instructions || null, payment_method || 'cash_on_pickup'
    ]);

    // Insert order items and update stock
    for (const item of orderItems) {
      const itemId = uuidv4();
      
      // Insert order item using stored procedure
      await connection.query("CALL InsertOrderItem(?, ?, ?, ?, ?, ?, ?)", [
        itemId, orderId, item.product_id, item.quantity, item.unit_price, item.total_price, item.special_requests
      ]);

      // Update stock using stored procedure
      const historyId = uuidv4();
      try {
        await connection.query("CALL UpdateStockForOrder(?, ?, ?, ?, ?)", [
          item.product_id, item.quantity, orderNumber, user_id, historyId
        ]);
      } catch (stockError) {
        await connection.rollback();
        return res.status(400).json({ 
          message: `Insufficient stock for product ${item.product_id}`,
          error: stockError.message 
        });
      }
    }

    // Update discount usage count if discount was applied
    if (discount_id && discountAmount > 0) {
      await connection.query("CALL UpdateDiscountUsage(?)", [discount_id]);
    }

    await connection.commit();
    
    res.status(201).json({
      message: "Order created successfully",
      data: orderResult[0]
    });
  } catch (error) {
    await connection.rollback();
    return handleDbError(error, res);
  } finally {
    connection.release();
  }
}

// Update order status
export async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const [data] = await db.query("CALL UpdateOrderStatus(?, ?)", [id, status]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "Order status updated successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update payment status
export async function updatePaymentStatus(req, res) {
  const { id } = req.params;
  const { payment_status } = req.body;
  
  try {
    const [data] = await db.query("CALL UpdatePaymentStatus(?, ?)", [id, payment_status]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "Payment status updated successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Cancel order
export async function cancelOrder(req, res) {
  const { id } = req.params;
  const { cancellation_reason } = req.body;
  
  try {
    const [data] = await db.query("CALL CancelOrder(?, ?)", [id, cancellation_reason || null]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "Order cancelled successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get order statistics for business
export async function getOrderStatsByBusiness(req, res) {
  const { businessId } = req.params;
  const { period = '30' } = req.query; // days
  
  try {
    const [results] = await db.query("CALL GetOrderStatsByBusiness(?, ?)", [businessId, parseInt(period)]);
    
    if (!results || results.length < 3) {
      return res.status(404).json({ message: "Business not found or no data available" });
    }

    const overview = results[0][0];
    const daily_stats = results[1];
    const popular_products = results[2];

    res.json({
      overview: overview,
      daily_stats: daily_stats,
      popular_products: popular_products
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}
