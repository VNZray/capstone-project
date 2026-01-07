/**
 * Payment Query Controller
 * Handles payment retrieval and query operations
 */

import db from "../../db.js";
import { handleDbError } from "../../utils/errorHandler.js";
import { ensureUserRole, hasBusinessAccess } from "../../utils/authHelpers.js";

// Get all payments
export async function getAllPayments(req, res) {
  try {
    const [data] = await db.query("CALL GetAllPayments()");
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get payment by payer ID
export async function getPaymentByPayerId(req, res) {
  const { payer_id } = req.params;
  try {
    const userRole = await ensureUserRole(req);
    const roleName = userRole?.roleName || userRole;

    console.log('[getPaymentByPayerId] Request params:', { payer_id, userId: req.user?.id, roleName });

    if (roleName !== 'Admin' && req.user?.id !== payer_id) {
      console.log('[getPaymentByPayerId] Access denied:', {
        roleName,
        userId: req.user?.id,
        requestedPayerId: payer_id,
        match: req.user?.id === payer_id,
      });
      return res.status(403).json({ message: "Forbidden: you can only view your own payments" });
    }

    const [data] = await db.query("CALL GetPaymentByPayerId(?)", [payer_id]);
    if (!data[0] || data[0].length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    console.log('[getPaymentByPayerId] Returning', data[0].length, 'payments');
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get payment by ID
export async function getPaymentById(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL GetPaymentById(?)", [id]);
    if (!data[0] || data[0].length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const payment = data[0][0];

    // Ownership Validation (Phase 4)
    if (req.user) {
      const userId = req.user.id;
      const userRole = await ensureUserRole(req);
      const roleName = userRole?.roleName || userRole;

      if (roleName !== 'Admin') {
        // For tourists: must own the payment (payer_id match)
        if (roleName === 'Tourist' && payment.payer_id !== userId) {
          return res.status(403).json({
            message: "Forbidden: you can only view your own payments"
          });
        }

        // For business owners/staff: verify they own the business
        if (['Business Owner', 'Staff'].includes(roleName) && payment.payment_for === 'order') {
          const [orderCheck] = await db.query(
            `SELECT b.owner_id FROM \`order\` o
             JOIN business b ON b.id = o.business_id
             WHERE o.id = ?`,
            [payment.payment_for_id]
          );

          if (!orderCheck || orderCheck.length === 0 || orderCheck[0].owner_id !== userId) {
            return res.status(403).json({
              message: "Forbidden: you do not have access to this payment"
            });
          }
        }
      }
    }

    res.json(payment);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get payments by payment_for_id
export async function getPaymentByPaymentForId(req, res) {
  const { payment_for_id } = req.params;
  try {
    const [data] = await db.query("CALL GetPaymentByPaymentForId(?)", [payment_for_id]);
    if (!data[0] || data[0].length === 0) {
      return res.status(404).json({ message: "No payments found" });
    }
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get payments by business ID
export async function getPaymentByBusinessId(req, res) {
  try {
    const { business_id } = req.params;

    const userRole = await ensureUserRole(req);
    const allowed = await hasBusinessAccess(business_id, req.user, userRole);
    if (!allowed) {
      return res.status(403).json({
        message: "Forbidden: you do not have access to this business"
      });
    }

    const [rows] = await db.query("CALL GetPaymentsByBusinessId(?)", [business_id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get payment by order ID (convenience endpoint)
export async function getPaymentByOrderId(req, res) {
  const { order_id } = req.params;
  try {
    const [data] = await db.query(
      `SELECT * FROM payment WHERE payment_for = 'order' AND payment_for_id = ?`,
      [order_id]
    );

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No payment found for this order"
      });
    }

    res.json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

export default {
  getAllPayments,
  getPaymentByPayerId,
  getPaymentById,
  getPaymentByPaymentForId,
  getPaymentByBusinessId,
  getPaymentByOrderId
};
