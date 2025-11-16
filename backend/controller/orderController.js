import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../utils/errorHandler.js";
import { 
  validateOrderCreation, 
  sanitizeString, 
  generateArrivalCode, 
  generateOrderNumber,
  validateStatus
} from "../utils/orderValidation.js";
import orderTransitionService from "../services/orderTransitionService.js";
import * as paymongoService from "../services/paymongoService.js";
import * as socketService from "../services/socketService.js";
import * as notificationHelper from "../services/notificationHelper.js";

// Environment configuration
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "http://localhost:5173";

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
  const requestingUserId = req.user?.id;
  const userRole = req.user?.role;
  
  // Authorization: user can only view own orders unless admin
  if (userRole !== 'Admin' && userId !== requestingUserId) {
    return res.status(403).json({ 
      message: "Forbidden: you can only view your own orders" 
    });
  }
  
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
  const userId = req.user?.id;
  const userRole = req.user?.role;
  
  try {
    const [results] = await db.query("CALL GetOrderById(?)", [id]);
    
    if (!results || results.length < 2 || results[0].length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderData = results[0][0];
    const items = results[1] || [];
    
    // Authorization check: user must own the order or be business owner/staff/admin
    if (userRole !== 'Admin') {
      const isTouristOwner = userRole === 'Tourist' && orderData.user_id === userId;
      
      // For business owners/staff, check if they own the business
      const isBusinessOwner = ['Owner', 'Staff'].includes(userRole) && orderData.business_id;
      
      if (!isTouristOwner && !isBusinessOwner) {
        // Additional check: verify business ownership
        if (isBusinessOwner) {
          const [businessCheck] = await db.query(
            "SELECT id FROM business WHERE id = ? AND owner_id = ?",
            [orderData.business_id, userId]
          );
          
          if (!businessCheck || businessCheck.length === 0) {
            return res.status(403).json({ 
              message: "Forbidden: you do not have access to this order" 
            });
          }
        } else {
          return res.status(403).json({ 
            message: "Forbidden: you do not have access to this order" 
          });
        }
      }
    }

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
  // Validate payload first
  const validation = validateOrderCreation(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      message: "Validation failed",
      errors: validation.errors
    });
  }

  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const orderId = uuidv4();
    
    // Extract user_id from authenticated user (req.user set by authenticate middleware)
    const user_id = req.user?.id;
    if (!user_id) {
      await connection.rollback();
      return res.status(401).json({ message: "User authentication required" });
    }
    
    const { 
      business_id, 
      items, 
      discount_id, 
      pickup_datetime, 
      special_instructions,
      payment_method,
      payment_method_type
    } = req.body;

    // Sanitize string inputs
    const sanitizedInstructions = special_instructions ? sanitizeString(special_instructions) : null;

    // Calculate order totals
    let subtotal = 0;
    const orderItems = [];
    
    for (const item of items) {
      const [product] = await connection.query("SELECT price, is_unavailable FROM product WHERE id = ?", [item.product_id]);
      if (!product || product.length === 0) {
        await connection.rollback();
        return res.status(400).json({ 
          message: `Product with ID ${item.product_id} not found` 
        });
      }
      
      // Check if product is temporarily unavailable
      if (product[0].is_unavailable) {
        await connection.rollback();
        return res.status(400).json({ 
          message: `Product is currently unavailable and cannot be ordered`,
          product_id: item.product_id
        });
      }
      
      const unitPrice = product[0].price;
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;
      
      orderItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        special_requests: item.special_requests ? sanitizeString(item.special_requests) : null
      });
    }

    // Apply discount if provided
    let discountAmount = 0;
    let finalDiscountId = discount_id || null;
    
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
        finalDiscountId = null;
      }
    }

    const taxAmount = 0; // Tax calculation can be implemented here
    const totalAmount = subtotal - discountAmount + taxAmount;

    // Generate order number and arrival code
    const orderNumber = generateOrderNumber();
    const arrivalCode = generateArrivalCode();

    // Insert order using stored procedure with new parameters
    const [orderResult] = await connection.query(
      "CALL InsertOrder(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
      [
        orderId, 
        business_id, 
        user_id, 
        orderNumber, 
        subtotal, 
        discountAmount, 
        taxAmount, 
        totalAmount,
        finalDiscountId, 
        pickup_datetime, 
        sanitizedInstructions, 
        payment_method || 'cash_on_pickup',
        payment_method_type || null,
        arrivalCode
      ]
    );

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
    if (finalDiscountId && discountAmount > 0) {
      await connection.query("CALL UpdateDiscountUsage(?)", [finalDiscountId]);
    }

    await connection.commit();
    
    // ========== PayMongo Integration ==========
    // If payment method is PayMongo, initiate payment
    let paymentData = null;
    
    if (payment_method === 'paymongo' && payment_method_type) {
      try {
        const amountInCentavos = Math.round(totalAmount * 100);
        
        if (amountInCentavos < 100) {
          return res.status(400).json({ 
            success: false, 
            message: "Order amount too low for PayMongo (minimum 1.00 PHP)" 
          });
        }

        const metadata = {
          order_id: orderId,
          order_number: orderNumber,
          business_id: business_id,
          user_id: user_id
        };

        const successUrl = `${FRONTEND_BASE_URL}/orders/${orderId}/payment-success`;
        const failedUrl = `${FRONTEND_BASE_URL}/orders/${orderId}/payment-failed`;

        let paymongoResponse;
        let provider_reference;
        let checkout_url = null;
        let payment_intent_id = null;

        // Create source for e-wallets or payment intent for cards
        if (['gcash', 'grab_pay', 'paymaya'].includes(payment_method_type)) {
          paymongoResponse = await paymongoService.createSource({
            amount: amountInCentavos,
            type: payment_method_type,
            currency: 'PHP',
            redirect: {
              success: successUrl,
              failed: failedUrl
            },
            metadata
          });

          provider_reference = paymongoResponse.data.id;
          checkout_url = paymongoResponse.data.attributes.redirect?.checkout_url;

          // Update order with source ID
          await db.query(
            `UPDATE \`order\` SET paymongo_source_id = ? WHERE id = ?`,
            [provider_reference, orderId]
          );

        } else if (payment_method_type === 'card') {
          paymongoResponse = await paymongoService.createPaymentIntent({
            amount: amountInCentavos,
            currency: 'PHP',
            description: `Payment for order ${orderNumber}`,
            statement_descriptor: `Order ${orderNumber}`,
            metadata
          });

          provider_reference = paymongoResponse.data.id;
          payment_intent_id = provider_reference;

          // Update order with checkout ID
          await db.query(
            `UPDATE \`order\` SET paymongo_checkout_id = ? WHERE id = ?`,
            [provider_reference, orderId]
          );

        } else {
          return res.status(400).json({ 
            success: false, 
            message: `Unsupported payment method type: ${payment_method_type}` 
          });
        }

        // Create payment record
        const payment_id = uuidv4();
        await db.query(
          `CALL InsertPayment(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            payment_id,
            'Tourist',
            'online',
            payment_method_type,
            totalAmount,
            'pending',
            'order',
            user_id,
            orderId,
            new Date()
          ]
        );

        // Store provider reference
        await db.query(
          `UPDATE payment 
           SET provider_reference = ?, 
               currency = 'PHP', 
               metadata = ?
           WHERE id = ?`,
          [provider_reference, JSON.stringify(metadata), payment_id]
        );

        paymentData = {
          payment_id,
          provider_reference,
          checkout_url,
          payment_intent_id,
          payment_method_type
        };

      } catch (paymentError) {
        console.error("PayMongo payment initiation failed:", paymentError);
        
        // Don't fail the order, but return warning
        paymentData = {
          error: true,
          message: "Payment initiation failed. Please complete payment manually."
        };
      }
    }
    
    // Return spec-compliant response with optional payment data
    const response = {
      order_id: orderId,
      order_number: orderNumber,
      arrival_code: arrivalCode,
      status: "pending",
      payment_status: "pending",
      total_amount: totalAmount
    };

    if (paymentData) {
      response.payment = paymentData;
    }

    // ========== Socket.IO Event (Phase 5) ==========
    // Emit new order event to business and user
    try {
      const orderData = {
        id: orderId,
        order_number: orderNumber,
        business_id: business_id,
        user_id: user_id,
        status: 'pending',
        payment_status: 'pending',
        total_amount: totalAmount,
        arrival_code: arrivalCode,
        created_at: new Date()
      };
      
      socketService.emitNewOrder(orderData);
      
      // Trigger notifications (push + email + DB)
      await notificationHelper.triggerNewOrderNotifications(orderData);
    } catch (socketError) {
      console.error('Failed to emit new order event:', socketError);
      // Don't fail the request, just log
    }

    res.status(201).json(response);
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
    // Validate status format
    const statusValidation = validateStatus(status);
    if (!statusValidation.valid) {
      return res.status(400).json({ message: statusValidation.error });
    }
    
    // Get current order with payment info for validation (Phase 4)
    const [currentOrder] = await db.query(
      "SELECT status, payment_method, payment_status FROM `order` WHERE id = ?", 
      [id]
    );
    
    if (!currentOrder || currentOrder.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    const order = currentOrder[0];
    const currentStatus = order.status;
    
    // Get actor role from authenticated user
    const actorRole = req.user?.role || 'tourist';
    
    // Check if transition is allowed (with payment validation)
    const transitionCheck = orderTransitionService.canTransition(
      currentStatus, 
      status, 
      actorRole,
      order  // Pass full order object for payment validation
    );
    
    if (!transitionCheck.allowed) {
      return res.status(403).json({ 
        message: "Status transition not allowed",
        reason: transitionCheck.reason,
        current_status: currentStatus,
        requested_status: status
      });
    }
    
    // Proceed with status update
    const [data] = await db.query("CALL UpdateOrderStatus(?, ?)", [id, status]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const updatedOrder = data[0];

    // ========== Socket.IO Event (Phase 5) ==========
    // Emit order updated event
    try {
      const orderData = {
        id: id,
        order_number: updatedOrder.order_number || order.order_number,
        business_id: updatedOrder.business_id || order.business_id,
        user_id: updatedOrder.user_id || order.user_id,
        status: status,
        payment_status: updatedOrder.payment_status || order.payment_status,
        updated_at: new Date()
      };
      
      socketService.emitOrderUpdated(orderData, currentStatus);
      
      // Trigger notifications
      await notificationHelper.triggerOrderUpdateNotifications(orderData, currentStatus);
    } catch (socketError) {
      console.error('Failed to emit order updated event:', socketError);
    }

    res.json({
      message: "Order status updated successfully",
      data: updatedOrder
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
    // Get current order details including payment info
    const [orderData] = await db.query(
      `SELECT o.status, o.created_at, o.payment_status, o.payment_method, o.total_amount,
              p.id as payment_id, p.provider_reference, p.status as payment_db_status
       FROM \`order\` o
       LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
       WHERE o.id = ?`, 
      [id]
    );
    
    if (!orderData || orderData.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    const order = orderData[0];
    const actorRole = req.user?.role || 'tourist';
    
    // Get grace period from environment (default 10 seconds)
    const graceSeconds = parseInt(process.env.ORDER_GRACE_SECONDS || '10', 10);
    
    // Validate cancellation using transition service
    const cancellationCheck = orderTransitionService.validateCancellation(
      order,
      actorRole,
      graceSeconds
    );
    
    if (!cancellationCheck.allowed) {
      return res.status(403).json({ 
        message: "Cancellation not allowed",
        reason: cancellationCheck.reason
      });
    }
    
    // Sanitize cancellation reason
    const sanitizedReason = cancellation_reason ? sanitizeString(cancellation_reason) : null;
    
    // ========== PayMongo Refund Integration ==========
    // If payment was made via PayMongo and is paid, initiate refund
    let refundData = null;
    
    if (order.payment_method === 'paymongo' && 
        order.payment_status === 'paid' && 
        order.payment_id && 
        order.provider_reference) {
      
      try {
        console.log(`Initiating refund for order ${id}, payment ${order.payment_id}`);
        
        const amountInCentavos = Math.round(order.total_amount * 100);
        
        const refundMetadata = {
          payment_id: order.payment_id,
          order_id: id,
          cancellation_reason: sanitizedReason || 'Order cancelled',
          cancelled_by: cancellationCheck.cancelled_by
        };

        const refundResponse = await paymongoService.createRefund({
          payment_id: order.provider_reference,
          amount: amountInCentavos,
          reason: 'requested_by_customer',
          notes: sanitizedReason || '',
          metadata: refundMetadata
        });

        const refund_id = refundResponse.data.id;
        const refund_status = refundResponse.data.attributes.status;

        // Update payment record with refund reference
        await db.query(
          `UPDATE payment 
           SET status = 'refunded', 
               refund_reference = ?, 
               metadata = JSON_SET(COALESCE(metadata, '{}'), '$.refund_reason', ?, '$.cancelled_by', ?),
               updated_at = ? 
           WHERE id = ?`,
          [refund_id, sanitizedReason || 'Order cancelled', cancellationCheck.cancelled_by, new Date(), order.payment_id]
        );

        refundData = {
          refund_id,
          status: refund_status,
          amount: order.total_amount,
          currency: 'PHP'
        };

        console.log(`Refund initiated successfully: ${refund_id}, status: ${refund_status}`);

      } catch (refundError) {
        console.error("PayMongo refund failed:", refundError);
        
        // Don't block cancellation, but log the error
        refundData = {
          error: true,
          message: "Refund initiation failed. Manual refund may be required."
        };
      }
    }
    
    // Call stored procedure with cancelled_by parameter
    const [data] = await db.query(
      "CALL CancelOrder(?, ?, ?)", 
      [id, sanitizedReason, cancellationCheck.cancelled_by]
    );

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const response = {
      message: "Order cancelled successfully",
      data: data[0],
      cancelled_by: cancellationCheck.cancelled_by
    };

    if (refundData) {
      response.refund = refundData;
    }

    // ========== Socket.IO Event (Phase 5) ==========
    // Emit order cancelled event
    try {
      const cancelledStatus = cancellationCheck.cancelled_by === 'user' ? 'cancelled_by_user' : 'cancelled_by_business';
      
      const orderData = {
        id: id,
        order_number: data[0].order_number || order.order_number,
        business_id: order.business_id,
        user_id: order.user_id,
        status: cancelledStatus,
        payment_status: refundData ? 'refunded' : order.payment_status,
        updated_at: new Date()
      };
      
      socketService.emitOrderUpdated(orderData, order.status);
      
      // Trigger notifications
      await notificationHelper.triggerOrderUpdateNotifications(orderData, order.status);
    } catch (socketError) {
      console.error('Failed to emit order cancelled event:', socketError);
    }

    res.json(response);
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

// Verify arrival code
export async function verifyArrivalCode(req, res) {
  const { businessId } = req.params;
  const { arrival_code } = req.body;
  
  try {
    const [data] = await db.query("CALL VerifyArrivalCode(?, ?)", [businessId, arrival_code]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Invalid arrival code or order not found" });
    }

    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Mark customer as arrived for order
export async function markCustomerArrivedForOrder(req, res) {
  const { id } = req.params;
  
  try {
    const [data] = await db.query("CALL MarkCustomerArrivedForOrder(?)", [id]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "Customer arrival recorded successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Mark order as ready for pickup
export async function markOrderAsReady(req, res) {
  const { id } = req.params;
  
  try {
    const [data] = await db.query("CALL MarkOrderAsReady(?)", [id]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "Order marked as ready for pickup",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Mark order as picked up
export async function markOrderAsPickedUp(req, res) {
  const { id } = req.params;
  
  try {
    const [data] = await db.query("CALL MarkOrderAsPickedUp(?)", [id]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "Order marked as picked up and completed",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}
