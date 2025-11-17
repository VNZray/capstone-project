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
import { ensureUserRole, hasBusinessAccess } from "../utils/authHelpers.js";
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
    const userRole = await ensureUserRole(req);
    const allowed = await hasBusinessAccess(businessId, req.user, userRole);
    
    if (!allowed) {
      return res.status(403).json({
        message: "Forbidden: you do not have access to this business",
      });
    }

    const [data] = await db.query("CALL GetOrdersByBusinessId(?)", [businessId]);
    
    // Normalize status casing and amounts for frontend
    // Stored procedures return array of result sets, get first one
    const rows = Array.isArray(data) && Array.isArray(data[0]) ? data[0] : (Array.isArray(data) ? data : []);
    const normalized = rows.map((row) => ({
      ...row,
      status: row.status || 'pending',
      payment_status: row.payment_status || 'pending',
      payment_method: row.payment_method || 'cash_on_pickup',
      order_number: row.order_number || 'N/A',
      total_amount: typeof row.total_amount === 'number' ? row.total_amount : parseFloat(row.total_amount) || 0,
      subtotal: typeof row.subtotal === 'number' ? row.subtotal : parseFloat(row.subtotal) || 0,
      discount_amount: typeof row.discount_amount === 'number' ? row.discount_amount : parseFloat(row.discount_amount) || 0,
      tax_amount: typeof row.tax_amount === 'number' ? row.tax_amount : parseFloat(row.tax_amount) || 0,
    }));

    res.json(normalized);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get orders by user ID
export async function getOrdersByUserId(req, res) {
  const { userId } = req.params;
  const requestingUserId = req.user?.id;
  if (!requestingUserId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const userRole = await ensureUserRole(req);

  // Only admins may request arbitrary user IDs; everyone else is forced to their own ID
  const effectiveUserId = userRole === 'Admin' ? userId : requestingUserId;
  
  try {
    const [data] = await db.query("CALL GetOrdersByUserId(?)", [effectiveUserId]);

    // Normalize status casing for frontend (expects UPPER_SNAKE)
    // Stored procedures return array of result sets, get first one
    const rows = Array.isArray(data) && Array.isArray(data[0]) ? data[0] : (Array.isArray(data) ? data : []);
    const normalized = rows.map((row) => ({
      ...row,
      status: (row.status || 'pending').toString().toUpperCase(),
      payment_status: (row.payment_status || 'pending').toString().toUpperCase(),
      payment_method: row.payment_method || 'cash_on_pickup',
      order_number: row.order_number || 'N/A',
      total_amount: typeof row.total_amount === 'number' ? row.total_amount : parseFloat(row.total_amount) || 0,
      subtotal: typeof row.subtotal === 'number' ? row.subtotal : parseFloat(row.subtotal) || 0,
      discount_amount: typeof row.discount_amount === 'number' ? row.discount_amount : parseFloat(row.discount_amount) || 0,
      tax_amount: typeof row.tax_amount === 'number' ? row.tax_amount : parseFloat(row.tax_amount) || 0,
    }));

    res.json(normalized);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get order by ID
export async function getOrderById(req, res) {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = await ensureUserRole(req);
  
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
      const isBusinessMember = await hasBusinessAccess(orderData.business_id, req.user, userRole);

      if (!isTouristOwner && !isBusinessMember) {
        return res.status(403).json({ 
          message: "Forbidden: you do not have access to this order" 
        });
      }
    }

    // Normalize amounts for frontend (MySQL DECIMAL returns as string)
    const normalizedOrder = {
      ...orderData,
      total_amount: typeof orderData.total_amount === 'number' ? orderData.total_amount : parseFloat(orderData.total_amount) || 0,
      subtotal: typeof orderData.subtotal === 'number' ? orderData.subtotal : parseFloat(orderData.subtotal) || 0,
      discount_amount: typeof orderData.discount_amount === 'number' ? orderData.discount_amount : parseFloat(orderData.discount_amount) || 0,
      tax_amount: typeof orderData.tax_amount === 'number' ? orderData.tax_amount : parseFloat(orderData.tax_amount) || 0,
    };

    // Normalize item amounts
    const normalizedItems = items.map((item) => ({
      ...item,
      unit_price: typeof item.unit_price === 'number' ? item.unit_price : parseFloat(item.unit_price) || 0,
      total_price: typeof item.total_price === 'number' ? item.total_price : parseFloat(item.total_price) || 0,
    }));

    const result = {
      ...normalizedOrder,
      items: normalizedItems
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
      const [product] = await connection.query("SELECT price, status FROM product WHERE id = ?", [item.product_id]);
      if (!product || product.length === 0) {
        await connection.rollback();
        return res.status(400).json({ 
          message: `Product with ID ${item.product_id} not found` 
        });
      }
      
      // Check if product is temporarily unavailable
      const productStatus = product[0].status;
      const isUnavailable = product[0].is_unavailable || ['inactive', 'out_of_stock'].includes((productStatus || '').toLowerCase());
      if (isUnavailable) {
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

    // Normalize pickup datetime to Date object for MySQL
    const pickupDateObj = new Date(pickup_datetime);
    if (isNaN(pickupDateObj.getTime())) {
      await connection.rollback();
      return res.status(400).json({ 
        message: "Invalid pickup datetime format" 
      });
    }

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
        pickupDateObj, 
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
    // If payment method is PayMongo, create checkout session immediately
    let checkout_url = null;
    
    console.log(`[insertOrder] Order ${orderNumber} created, payment_method: ${payment_method}`);
    
    if (payment_method === 'paymongo') {
      try {
        // Prepare line items for checkout
        const lineItems = orderItems.map((item) => ({
          currency: 'PHP',
          amount: Math.round(item.unit_price * 100),
          name: item.product_name || `Product ${item.product_id}`,
          quantity: item.quantity,
        }));

        // Get product names for line items (orderItems don't have names yet)
        for (let i = 0; i < orderItems.length; i++) {
          const [productData] = await connection.query(
            "SELECT name, image_url FROM product WHERE id = ?",
            [orderItems[i].product_id]
          );
          if (productData && productData.length > 0) {
            lineItems[i].name = productData[0].name;
            if (productData[0].image_url) {
              lineItems[i].images = [productData[0].image_url];
            }
          }
        }

        // Prepare redirect URLs (these are HTTP URLs for PayMongo API)
        const redirectBase = process.env.PAYMONGO_REDIRECT_BASE || process.env.FRONTEND_BASE_URL || "http://localhost:5173";
        const successUrl = `${redirectBase}/orders/${orderId}/payment-success`;
        const cancelUrl = `${redirectBase}/orders/${orderId}/payment-cancel`;

        // Create PayMongo checkout session
        const checkoutSession = await paymongoService.createCheckoutSession({
          orderId,
          orderNumber,
          amount: Math.round(totalAmount * 100), // Convert to centavos
          lineItems,
          successUrl,
          cancelUrl,
          description: `Order ${orderNumber}`,
          metadata: {
            order_id: orderId,
            order_number: orderNumber,
            business_id: business_id,
            user_id: user_id,
            total_amount: totalAmount.toString(),
          }
        });

        checkout_url = checkoutSession.attributes.checkout_url;
        const provider_reference = checkoutSession.id;

        // Create payment record
        const payment_id = uuidv4();
        await connection.query(
          `CALL InsertPayment(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            payment_id,
            'Tourist',
            'online',
            payment_method_type || 'paymongo',
            totalAmount,
            'pending',
            'order',
            user_id,
            orderId,
            new Date()
          ]
        );

        // Store provider reference
        await connection.query(
          `UPDATE payment 
           SET provider_reference = ?, currency = 'PHP' 
           WHERE id = ?`,
          [provider_reference, payment_id]
        );

        console.log(`[insertOrder] ✅ PayMongo checkout created for order ${orderNumber}`);
        console.log(`[insertOrder] 🔗 Checkout URL: ${checkout_url}`);
        console.log(`[insertOrder] 📝 Provider reference (checkout session ID): ${provider_reference}`);

      } catch (paymongoError) {
        console.error(`[insertOrder] ❌ PayMongo checkout creation failed for order ${orderNumber}:`, paymongoError.message);
        // Don't fail the order, but log the error
        // checkout_url will remain null and frontend can handle retry via /payments/initiate
      }
    }
    
    // Return spec-compliant response (spec.md §7)
    const response = {
      order_id: orderId,
      order_number: orderNumber,
      arrival_code: arrivalCode,
      status: "pending",
      payment_status: "pending",
      total_amount: totalAmount
    };

    // Add checkout_url for PayMongo orders
    if (checkout_url) {
      response.checkout_url = checkout_url;
    }

    // ========== Real-time Notifications ==========
    // For PayMongo orders: SKIP notifications until payment is confirmed via webhook
    // For COP orders: Emit immediately since no payment confirmation needed
    if (payment_method === 'cash_on_pickup') {
      console.log(`[insertOrder] 📢 Emitting notifications for COP order ${orderNumber}`);
      
      try {
        const [userEmailResult] = await db.query(
          "SELECT email FROM user WHERE id = ?",
          [user_id]
        );
        const userEmail = userEmailResult?.[0]?.email || 'unknown@email.com';

        // Fetch all order items
        const [itemsResult] = await db.query(
          "SELECT * FROM order_item WHERE order_id = ?",
          [orderId]
        );
        const itemsData = itemsResult || [];

        // Fetch discount name if discount was applied
        let discountName = null;
        if (finalDiscountId) {
          const [discountResult] = await db.query(
            "SELECT discount_name FROM discount WHERE id = ?",
            [finalDiscountId]
          );
          discountName = discountResult?.[0]?.discount_name;
        }

        const completeOrderData = {
          id: orderId,
          order_number: orderNumber,
          business_id: business_id,
          user_id: user_id,
          user_email: userEmail,
          status: 'pending',
          payment_status: 'pending',
          payment_method: payment_method,
          subtotal: subtotal,
          discount_amount: discountAmount,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          pickup_datetime: pickup_datetime,
          special_instructions: sanitizedInstructions,
          arrival_code: arrivalCode,
          discount_name: discountName,
          item_count: itemsData.length,
          items: itemsData,
          created_at: new Date()
        };

        socketService.emitNewOrder(completeOrderData);
        await notificationHelper.triggerNewOrderNotifications(completeOrderData);
        
        console.log(`[insertOrder] ✅ COP order notifications sent`);
      } catch (socketError) {
        console.error(`[insertOrder] ❌ Failed to emit notifications:`, socketError);
      }
    } else {
      console.log(`[insertOrder] ⏳ PayMongo order ${orderNumber} - notifications deferred until payment confirmation`);
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
    const userRole = await ensureUserRole(req);

    // Validate status format
    const statusValidation = validateStatus(status);
    if (!statusValidation.valid) {
      return res.status(400).json({ message: statusValidation.error });
    }
    
    // Get current order with payment info for validation (Phase 4)
    const [currentOrder] = await db.query(
      "SELECT * FROM `order` WHERE id = ?", 
      [id]
    );
    
    if (!currentOrder || currentOrder.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    const order = currentOrder[0];
    const currentStatus = order.status;

    if (userRole !== 'Admin') {
      const allowed = await hasBusinessAccess(order.business_id, req.user, userRole);
      if (!allowed) {
        return res.status(403).json({
          message: "Forbidden: you do not manage this business",
        });
      }
    }
    
    // Get actor role from authenticated user
    const actorRole = userRole || 'tourist';
    
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

    // ========== Fetch Complete Order for Socket Emission ==========
    // Get user email and all order details for socket event
    try {
      const [userEmailResult] = await db.query(
        "SELECT email FROM user WHERE id = ?",
        [updatedOrder.user_id]
      );
      const userEmail = userEmailResult?.[0]?.email || 'unknown@email.com';

      // Fetch all order items
      const [itemsResult] = await db.query(
        "SELECT * FROM order_item WHERE order_id = ?",
        [id]
      );
      const itemsData = itemsResult || [];

      // Fetch discount name if exists
      let discountName = null;
      if (updatedOrder.discount_id) {
        const [discountResult] = await db.query(
          "SELECT discount_name FROM discount WHERE id = ?",
          [updatedOrder.discount_id]
        );
        discountName = discountResult?.[0]?.discount_name;
      }

      // Send complete order data through socket
      const completeOrderData = {
        id: updatedOrder.id,
        order_number: updatedOrder.order_number,
        business_id: updatedOrder.business_id,
        user_id: updatedOrder.user_id,
        user_email: userEmail,
        status: updatedOrder.status,
        payment_status: updatedOrder.payment_status,
        payment_method: updatedOrder.payment_method || 'cash_on_pickup',
        subtotal: updatedOrder.subtotal,
        discount_amount: updatedOrder.discount_amount || 0,
        tax_amount: updatedOrder.tax_amount || 0,
        total_amount: updatedOrder.total_amount,
        pickup_datetime: updatedOrder.pickup_datetime,
        special_instructions: updatedOrder.special_instructions,
        arrival_code: updatedOrder.arrival_code,
        discount_name: discountName,
        item_count: itemsData.length,
        items: itemsData,
        ready_at: updatedOrder.ready_at,
        picked_up_at: updatedOrder.picked_up_at,
        updated_at: updatedOrder.updated_at || new Date()
      };

      socketService.emitOrderUpdated(completeOrderData, currentStatus);
      
      // Trigger notifications
      await notificationHelper.triggerOrderUpdateNotifications(completeOrderData, currentStatus);
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
    const userRole = await ensureUserRole(req);

    // Get current order details including payment info
    const [orderData] = await db.query(
      `SELECT o.status, o.created_at, o.payment_status, o.payment_method, o.total_amount,
              o.business_id, o.user_id, o.order_number,
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
    const actorRole = userRole || 'tourist';

    // Ownership checks
    if (userRole === 'Tourist' && order.user_id !== req.user?.id) {
      return res.status(403).json({
        message: "Forbidden: you can only cancel your own orders"
      });
    }
    
    if (['Business Owner', 'Staff'].includes(userRole)) {
      const allowed = await hasBusinessAccess(order.business_id, req.user, userRole);
      if (!allowed) {
        return res.status(403).json({
          message: "Forbidden: you do not manage this business"
        });
      }
    }
    
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

    // ========== Fetch Complete Order for Socket Emission ==========
    // Get user email and all order details for cancellation event
    try {
      const [userEmailResult] = await db.query(
        "SELECT email FROM user WHERE id = ?",
        [order.user_id]
      );
      const userEmail = userEmailResult?.[0]?.email || 'unknown@email.com';

      // Fetch all order items
      const [itemsResult] = await db.query(
        "SELECT * FROM order_item WHERE order_id = ?",
        [id]
      );
      const itemsData = itemsResult || [];

      // Fetch discount name if exists
      let discountName = null;
      if (order.discount_id) {
        const [discountResult] = await db.query(
          "SELECT discount_name FROM discount WHERE id = ?",
          [order.discount_id]
        );
        discountName = discountResult?.[0]?.discount_name;
      }

      const cancelledStatus = cancellationCheck.cancelled_by === 'user' ? 'cancelled_by_user' : 'cancelled_by_business';

      // Send complete order data through socket
      const completeOrderData = {
        id: id,
        order_number: data[0].order_number || order.order_number,
        business_id: order.business_id,
        user_id: order.user_id,
        user_email: userEmail,
        status: cancelledStatus,
        payment_status: refundData ? 'refunded' : order.payment_status,
        payment_method: order.payment_method || 'cash_on_pickup',
        subtotal: order.subtotal,
        discount_amount: order.discount_amount || 0,
        tax_amount: order.tax_amount || 0,
        total_amount: order.total_amount,
        pickup_datetime: order.pickup_datetime,
        special_instructions: order.special_instructions,
        arrival_code: order.arrival_code,
        discount_name: discountName,
        item_count: itemsData.length,
        items: itemsData,
        updated_at: new Date()
      };

      socketService.emitOrderUpdated(completeOrderData, order.status);
      
      // Trigger notifications
      await notificationHelper.triggerOrderUpdateNotifications(completeOrderData, order.status);
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
    const userRole = await ensureUserRole(req);
    const allowed = await hasBusinessAccess(businessId, req.user, userRole);
    if (!allowed) {
      return res.status(403).json({
        message: "Forbidden: you do not have access to this business"
      });
    }

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
    const userRole = await ensureUserRole(req);
    const allowed = await hasBusinessAccess(businessId, req.user, userRole);
    if (!allowed) {
      return res.status(403).json({
        message: "Forbidden: you do not have access to this business"
      });
    }

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
    const userRole = await ensureUserRole(req);

    const [orderRows] = await db.query(
      "SELECT id, business_id, user_id FROM `order` WHERE id = ?",
      [id]
    );

    if (!orderRows || orderRows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orderRows[0];

    if (userRole !== 'Admin') {
      const allowed = await hasBusinessAccess(order.business_id, req.user, userRole);
      if (!allowed) {
        return res.status(403).json({
          message: "Forbidden: you do not manage this business"
        });
      }
    }

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
    const userRole = await ensureUserRole(req);

    const [orderRows] = await db.query(
      "SELECT id, order_number, status, payment_method, payment_status, business_id, user_id FROM `order` WHERE id = ?",
      [id]
    );

    if (!orderRows || orderRows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orderRows[0];

    if (userRole !== 'Admin') {
      const allowed = await hasBusinessAccess(order.business_id, req.user, userRole);
      if (!allowed) {
        return res.status(403).json({
          message: "Forbidden: you do not manage this business"
        });
      }
    }

    const transitionCheck = orderTransitionService.canTransition(
      order.status,
      'ready_for_pickup',
      userRole || 'tourist',
      order
    );

    if (!transitionCheck.allowed) {
      return res.status(403).json({
        message: "Status transition not allowed",
        reason: transitionCheck.reason,
        current_status: order.status,
        requested_status: 'ready_for_pickup'
      });
    }

    const [data] = await db.query("CALL MarkOrderAsReady(?)", [id]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const updatedOrder = data[0];

    // ========== Fetch Complete Order for Socket Emission ==========
    try {
      const [userEmailResult] = await db.query(
        "SELECT email FROM user WHERE id = ?",
        [order.user_id]
      );
      const userEmail = userEmailResult?.[0]?.email || 'unknown@email.com';

      const [itemsResult] = await db.query(
        "SELECT * FROM order_item WHERE order_id = ?",
        [id]
      );
      const itemsData = itemsResult || [];

      let discountName = null;
      if (updatedOrder.discount_id) {
        const [discountResult] = await db.query(
          "SELECT discount_name FROM discount WHERE id = ?",
          [updatedOrder.discount_id]
        );
        discountName = discountResult?.[0]?.discount_name;
      }

      const completeOrderData = {
        id,
        order_number: updatedOrder.order_number || order.order_number,
        business_id: order.business_id,
        user_id: order.user_id,
        user_email: userEmail,
        status: 'ready_for_pickup',
        payment_status: updatedOrder.payment_status || order.payment_status,
        payment_method: updatedOrder.payment_method || 'cash_on_pickup',
        subtotal: updatedOrder.subtotal,
        discount_amount: updatedOrder.discount_amount || 0,
        tax_amount: updatedOrder.tax_amount || 0,
        total_amount: updatedOrder.total_amount,
        pickup_datetime: updatedOrder.pickup_datetime,
        special_instructions: updatedOrder.special_instructions,
        arrival_code: updatedOrder.arrival_code,
        discount_name: discountName,
        item_count: itemsData.length,
        items: itemsData,
        ready_at: updatedOrder.ready_at,
        updated_at: new Date()
      };

      socketService.emitOrderUpdated(completeOrderData, order.status);
      await notificationHelper.triggerOrderUpdateNotifications(completeOrderData, order.status);
    } catch (socketError) {
      console.error('Failed to emit order ready event:', socketError);
    }

    res.json({
      message: "Order marked as ready for pickup",
      data: updatedOrder
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Mark order as picked up
export async function markOrderAsPickedUp(req, res) {
  const { id } = req.params;
  
  try {
    const userRole = await ensureUserRole(req);

    const [orderRows] = await db.query(
      "SELECT * FROM `order` WHERE id = ?",
      [id]
    );

    if (!orderRows || orderRows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orderRows[0];

    if (userRole !== 'Admin') {
      const allowed = await hasBusinessAccess(order.business_id, req.user, userRole);
      if (!allowed) {
        return res.status(403).json({
          message: "Forbidden: you do not manage this business"
        });
      }
    }

    const transitionCheck = orderTransitionService.canTransition(
      order.status,
      'picked_up',
      userRole || 'tourist',
      order
    );

    if (!transitionCheck.allowed) {
      return res.status(403).json({
        message: "Status transition not allowed",
        reason: transitionCheck.reason,
        current_status: order.status,
        requested_status: 'picked_up'
      });
    }

    const [data] = await db.query("CALL MarkOrderAsPickedUp(?)", [id]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const updatedOrder = data[0];

    // ========== Fetch Complete Order for Socket Emission ==========
    try {
      const [userEmailResult] = await db.query(
        "SELECT email FROM user WHERE id = ?",
        [order.user_id]
      );
      const userEmail = userEmailResult?.[0]?.email || 'unknown@email.com';

      const [itemsResult] = await db.query(
        "SELECT * FROM order_item WHERE order_id = ?",
        [id]
      );
      const itemsData = itemsResult || [];

      let discountName = null;
      if (updatedOrder.discount_id) {
        const [discountResult] = await db.query(
          "SELECT discount_name FROM discount WHERE id = ?",
          [updatedOrder.discount_id]
        );
        discountName = discountResult?.[0]?.discount_name;
      }

      const completeOrderData = {
        id,
        order_number: updatedOrder.order_number || order.order_number,
        business_id: order.business_id,
        user_id: order.user_id,
        user_email: userEmail,
        status: 'picked_up',
        payment_status: updatedOrder.payment_status || order.payment_status,
        payment_method: updatedOrder.payment_method || 'cash_on_pickup',
        subtotal: updatedOrder.subtotal,
        discount_amount: updatedOrder.discount_amount || 0,
        tax_amount: updatedOrder.tax_amount || 0,
        total_amount: updatedOrder.total_amount,
        pickup_datetime: updatedOrder.pickup_datetime,
        special_instructions: updatedOrder.special_instructions,
        arrival_code: updatedOrder.arrival_code,
        discount_name: discountName,
        item_count: itemsData.length,
        items: itemsData,
        picked_up_at: updatedOrder.picked_up_at,
        updated_at: new Date()
      };

      socketService.emitOrderUpdated(completeOrderData, order.status);
      await notificationHelper.triggerOrderUpdateNotifications(completeOrderData, order.status);
    } catch (socketError) {
      console.error('Failed to emit order picked up event:', socketError);
    }

    res.json({
      message: "Order marked as picked up and completed",
      data: updatedOrder
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

