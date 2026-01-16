// Order Workflow Controllers - State transitions and lifecycle actions
import db from "../../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../../utils/errorHandler.js";
import { validateStatus, sanitizeString } from "../../utils/orderValidation.js";
import { ensureUserRole, hasBusinessAccess } from "../../utils/authHelpers.js";
import orderTransitionService from "../../services/orderTransitionService.js";
import * as paymongoService from "../../services/paymongoService.js";
import * as socketService from "../../services/socketService.js";
import * as notificationHelper from "../../services/notificationHelper.js";
import * as auditService from "../../services/auditService.js";
import { getCompleteOrderForSocket } from "./utils.js";

/**
 * Update order status
 * PUT /api/orders/:id/status
 */
export async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const userRole = await ensureUserRole(req);
    const roleName = userRole?.roleName || userRole;

    // Validate status format
    const statusValidation = validateStatus(status);
    if (!statusValidation.valid) {
      return res.status(400).json({ message: statusValidation.error });
    }

    // Get current order with payment info for validation
    const [currentOrder] = await db.query(
      "SELECT * FROM `order` WHERE id = ?",
      [id]
    );

    if (!currentOrder || currentOrder.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = currentOrder[0];
    const currentStatus = order.status;

    if (roleName !== "Admin" && roleName !== "Tourism Officer") {
      const allowed = await hasBusinessAccess(
        order.business_id,
        req.user,
        userRole
      );
      if (!allowed) {
        return res.status(403).json({
          message: "Forbidden: you do not manage this business",
        });
      }
    }

    // Get actor role from authenticated user
    const actorRole = roleName || "tourist";

    // Check if transition is allowed (with payment validation)
    const transitionCheck = orderTransitionService.canTransition(
      currentStatus,
      status,
      actorRole,
      order // Pass full order object for payment validation
    );

    if (!transitionCheck.allowed) {
      return res.status(403).json({
        message: "Status transition not allowed",
        reason: transitionCheck.reason,
        current_status: currentStatus,
        requested_status: status,
      });
    }

    // Proceed with status update
    const [data] = await db.query("CALL UpdateOrderStatus(?, ?)", [id, status]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const updatedOrder = data[0];

    // ========== Audit Logging ==========
    const actor = {
      id: req.user?.id,
      role: userRole,
      ip:
        req.ip ||
        req.headers["x-forwarded-for"] ||
        req.connection?.remoteAddress,
    };

    await auditService.logStatusChange({
      orderId: id,
      oldStatus: currentStatus,
      newStatus: status,
      actor,
    });

    // Fetch complete order for socket emission
    try {
      const completeOrderData = await getCompleteOrderForSocket(id);
      socketService.emitOrderUpdated(completeOrderData, currentStatus);
      await notificationHelper.triggerOrderUpdateNotifications(
        completeOrderData,
        currentStatus
      );
    } catch (socketError) {
      console.error("Failed to emit order updated event:", socketError);
    }

    res.json({
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Update payment status
 * PUT /api/orders/:id/payment-status
 */
export async function updatePaymentStatus(req, res) {
  const { id } = req.params;
  const { payment_status } = req.body;

  try {
    const [data] = await db.query("CALL UpdatePaymentStatus(?, ?)", [
      id,
      payment_status,
    ]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "Payment status updated successfully",
      data: data[0],
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Cancel order
 * POST /api/orders/:id/cancel
 */
export async function cancelOrder(req, res) {
  const { id } = req.params;
  // Safely extract cancellation_reason with explicit null check
  // This handles cases where req.body may be undefined (e.g., empty POST requests)
  const body = req.body || {};
  const cancellation_reason = body.cancellation_reason || null;

  try {
    const userRole = await ensureUserRole(req);
    const roleName = userRole?.roleName || userRole;

    // Get current order details including payment info from payment table
    const [orderData] = await db.query(
      `SELECT o.status, o.created_at, o.total_amount,
              o.business_id, o.user_id, o.order_number,
              p.id as payment_id, p.payment_intent_id, p.status as payment_status, p.payment_method
       FROM \`order\` o
       LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
       WHERE o.id = ?`,
      [id]
    );

    if (!orderData || orderData.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orderData[0];
    const actorRole = roleName || "tourist";

    // Ownership checks
    if (roleName === "Tourist" && order.user_id !== req.user?.id) {
      return res.status(403).json({
        message: "Forbidden: you can only cancel your own orders",
      });
    }

    if (["Business Owner", "Staff"].includes(roleName)) {
      const allowed = await hasBusinessAccess(
        order.business_id,
        req.user,
        userRole
      );
      if (!allowed) {
        return res.status(403).json({
          message: "Forbidden: you do not manage this business",
        });
      }
    }

    // Get grace period from environment (default 10 seconds)
    const graceSeconds = parseInt(process.env.ORDER_GRACE_SECONDS || "10", 10);

    // Validate cancellation using transition service
    const cancellationCheck = orderTransitionService.validateCancellation(
      order,
      actorRole,
      graceSeconds
    );

    if (!cancellationCheck.allowed) {
      return res.status(403).json({
        message: "Cancellation not allowed",
        reason: cancellationCheck.reason,
      });
    }

    // Sanitize cancellation reason
    const sanitizedReason = cancellation_reason
      ? sanitizeString(cancellation_reason)
      : null;

    // ========== PayMongo Refund Integration ==========
    let refundData = null;

    if (
      order.payment_method === "paymongo" &&
      order.payment_status === "paid" &&
      order.payment_id &&
      order.payment_intent_id
    ) {
      try {
        const refundAmount = Math.round(order.total_amount * 100); // Convert to centavos

        const refundResponse = await paymongoService.createRefund(
          order.payment_intent_id,
          refundAmount,
          `Refund for order ${order.order_number}`,
          {
            order_id: id,
            order_number: order.order_number,
            cancelled_by: cancellationCheck.cancelled_by,
          }
        );

        refundData = {
          refund_id: refundResponse.id,
          amount: refundResponse.attributes.amount / 100,
          status: refundResponse.attributes.status,
          reason: refundResponse.attributes.reason,
        };

        // Update payment record with refund info
        await db.query(
          `UPDATE payment 
           SET status = 'refunded', 
               refund_reference = ?
           WHERE id = ?`,
          [refundResponse.id, order.payment_id]
        );

        console.log(
          `[cancelOrder] ✅ Refund initiated for order ${order.order_number}`
        );
      } catch (refundError) {
        console.error(
          `[cancelOrder] ❌ Refund failed for order ${order.order_number}:`,
          refundError.message
        );
        // Continue with cancellation even if refund fails
        // Business can manually process refund later
      }
    }

    // Call stored procedure with cancelled_by parameter
    const [data] = await db.query("CALL CancelOrder(?, ?, ?)", [
      id,
      sanitizedReason,
      cancellationCheck.cancelled_by,
    ]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Fetch order items to return with the cancelled order (so frontend can restore cart)
    const [orderItems] = await db.query(
      `SELECT oi.*, p.name as product_name, p.image_url as product_image
       FROM order_item oi 
       LEFT JOIN product p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [id]
    );

    const cancelledOrderWithItems = {
      ...data[0],
      items: orderItems || [],
    };

    // ========== Audit Logging ==========
    const actor = {
      id: req.user?.id,
      role: userRole,
      ip:
        req.ip ||
        req.headers["x-forwarded-for"] ||
        req.connection?.remoteAddress,
    };

    await auditService.logCancellation({
      orderId: id,
      previousStatus: order.status,
      cancelledBy: cancellationCheck.cancelled_by,
      actor,
      reason: sanitizedReason,
    });

    // Log refund if applicable
    if (refundData) {
      await auditService.logPaymentUpdate({
        orderId: id,
        oldStatus: "paid",
        newStatus: "refunded",
        actor,
        paymentDetails: {
          refund_id: refundData.refund_id,
          refund_amount: refundData.amount,
          refund_status: refundData.status,
        },
      });
    }

    const response = {
      message: "Order cancelled successfully",
      data: cancelledOrderWithItems,
      cancelled_by: cancellationCheck.cancelled_by,
    };

    if (refundData) {
      response.refund = refundData;
    }

    // Fetch complete order for socket emission
    try {
      const completeOrderData = await getCompleteOrderForSocket(id);
      const cancelledStatus =
        cancellationCheck.cancelled_by === "user"
          ? "cancelled_by_user"
          : "cancelled_by_business";
      completeOrderData.status = cancelledStatus;
      if (refundData) {
        completeOrderData.payment_status = "refunded";
      }

      socketService.emitOrderUpdated(completeOrderData, order.status);
      await notificationHelper.triggerOrderUpdateNotifications(
        completeOrderData,
        order.status
      );
    } catch (socketError) {
      console.error("Failed to emit order cancelled event:", socketError);
    }

    res.json(response);
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Verify arrival code
 * POST /api/orders/business/:businessId/verify-arrival
 */
export async function verifyArrivalCode(req, res) {
  const { businessId } = req.params;
  const { arrival_code } = req.body;

  try {
    const userRole = await ensureUserRole(req);
    const allowed = await hasBusinessAccess(businessId, req.user, userRole);
    if (!allowed) {
      return res.status(403).json({
        message: "Forbidden: you do not have access to this business",
      });
    }

    const [data] = await db.query("CALL VerifyArrivalCode(?, ?)", [
      businessId,
      arrival_code,
    ]);

    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ message: "Invalid arrival code or order not found" });
    }

    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Mark customer as arrived for order
 * POST /api/orders/:id/arrived
 */
export async function markCustomerArrivedForOrder(req, res) {
  const { id } = req.params;

  try {
    const userRole = await ensureUserRole(req);
    const roleName = userRole?.roleName || userRole;

    const [orderRows] = await db.query(
      "SELECT id, business_id, user_id FROM `order` WHERE id = ?",
      [id]
    );

    if (!orderRows || orderRows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orderRows[0];

    if (roleName !== "Admin" && roleName !== "Tourism Officer") {
      const allowed = await hasBusinessAccess(
        order.business_id,
        req.user,
        userRole
      );
      if (!allowed) {
        return res.status(403).json({
          message: "Forbidden: you do not manage this business",
        });
      }
    }

    const [data] = await db.query("CALL MarkCustomerArrivedForOrder(?)", [id]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "Customer arrival recorded successfully",
      data: data[0],
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Mark order as ready for pickup
 * POST /api/orders/:id/ready
 */
export async function markOrderAsReady(req, res) {
  const { id } = req.params;

  try {
    const userRole = await ensureUserRole(req);
    const roleName = userRole?.roleName || userRole;

    const [orderRows] = await db.query(
      `SELECT o.id, o.order_number, o.status, o.business_id, o.user_id,
              p.status as payment_status, p.payment_method
       FROM \`order\` o
       LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
       WHERE o.id = ?`,
      [id]
    );

    if (!orderRows || orderRows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orderRows[0];

    if (roleName !== "Admin" && roleName !== "Tourism Officer") {
      const allowed = await hasBusinessAccess(
        order.business_id,
        req.user,
        userRole
      );
      if (!allowed) {
        return res.status(403).json({
          message: "Forbidden: you do not manage this business",
        });
      }
    }

    const transitionCheck = orderTransitionService.canTransition(
      order.status,
      "ready_for_pickup",
      roleName || "tourist",
      order
    );

    if (!transitionCheck.allowed) {
      return res.status(403).json({
        message: "Status transition not allowed",
        reason: transitionCheck.reason,
        current_status: order.status,
        requested_status: "ready_for_pickup",
      });
    }

    const [data] = await db.query("CALL MarkOrderAsReady(?)", [id]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const updatedOrder = data[0];

    // ========== Audit Logging ==========
    const actor = {
      id: req.user?.id,
      role: userRole,
      ip:
        req.ip ||
        req.headers["x-forwarded-for"] ||
        req.connection?.remoteAddress,
    };

    await auditService.logPickupEvent({
      orderId: id,
      eventType: auditService.EVENT_TYPES.MARKED_READY,
      actor,
      metadata: { order_number: order.order_number },
    });

    // Fetch complete order for socket emission
    try {
      const completeOrderData = await getCompleteOrderForSocket(id);
      socketService.emitOrderUpdated(completeOrderData, order.status);
      await notificationHelper.triggerOrderUpdateNotifications(
        completeOrderData,
        order.status
      );
    } catch (socketError) {
      console.error("Failed to emit order ready event:", socketError);
    }

    res.json({
      message: "Order marked as ready for pickup",
      data: updatedOrder,
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Mark order as picked up
 * POST /api/orders/:id/picked-up
 */
export async function markOrderAsPickedUp(req, res) {
  const { id } = req.params;

  try {
    const userRole = await ensureUserRole(req);
    const roleName = userRole?.roleName || userRole;

    const [orderRows] = await db.query("SELECT * FROM `order` WHERE id = ?", [
      id,
    ]);

    if (!orderRows || orderRows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orderRows[0];

    if (roleName !== "Admin" && roleName !== "Tourism Officer") {
      const allowed = await hasBusinessAccess(
        order.business_id,
        req.user,
        userRole
      );
      if (!allowed) {
        return res.status(403).json({
          message: "Forbidden: you do not manage this business",
        });
      }
    }

    const transitionCheck = orderTransitionService.canTransition(
      order.status,
      "picked_up",
      roleName || "tourist",
      order
    );

    if (!transitionCheck.allowed) {
      return res.status(403).json({
        message: "Status transition not allowed",
        reason: transitionCheck.reason,
        current_status: order.status,
        requested_status: "picked_up",
      });
    }

    const [data] = await db.query("CALL MarkOrderAsPickedUp(?)", [id]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const updatedOrder = data[0];

    // ========== Audit Logging ==========
    const actor = {
      id: req.user?.id,
      role: userRole,
      ip:
        req.ip ||
        req.headers["x-forwarded-for"] ||
        req.connection?.remoteAddress,
    };

    await auditService.logPickupEvent({
      orderId: id,
      eventType: auditService.EVENT_TYPES.PICKED_UP,
      actor,
      metadata: { order_number: order.order_number },
    });

    // Fetch complete order for socket emission
    try {
      const completeOrderData = await getCompleteOrderForSocket(id);
      socketService.emitOrderUpdated(completeOrderData, order.status);
      await notificationHelper.triggerOrderUpdateNotifications(
        completeOrderData,
        order.status
      );
    } catch (socketError) {
      console.error("Failed to emit order picked up event:", socketError);
    }

    res.json({
      message: "Order marked as picked up and completed",
      data: updatedOrder,
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}
