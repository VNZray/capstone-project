/**
 * Payment Refund Controller
 * Handles payment refund operations
 */

import db from "../../db.js";
import { handleDbError } from "../../utils/errorHandler.js";
import * as paymongoService from "../../services/paymongoService.js";

/**
 * Initiate refund for a payment
 * POST /api/payments/:id/refund
 * Auth: Required (Admin only)
 */
export async function initiateRefund(req, res) {
  try {
    const { id } = req.params;
    const { reason, notes, amount: partialAmount } = req.body;

    // 1. Fetch payment details
    const [paymentRows] = await db.query(
      `SELECT 
        p.id, p.payment_for, p.payment_for_id, p.status, p.amount, 
        p.payment_intent_id, p.paymongo_payment_id, p.payment_method, p.currency
       FROM payment p
       WHERE p.id = ?`,
      [id]
    );

    if (!paymentRows || paymentRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Payment not found" 
      });
    }

    const payment = paymentRows[0];

    // 2. Validate payment is refundable
    if (payment.status !== 'paid') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot refund payment with status: ${payment.status}` 
      });
    }

    // Get the actual PayMongo payment ID
    const paymongoPaymentId = payment.paymongo_payment_id;
    
    if (!paymongoPaymentId) {
      return res.status(400).json({ 
        success: false, 
        message: "Payment has no PayMongo payment ID (payment not completed via PayMongo)" 
      });
    }

    // 3. Calculate refund amount
    const refundAmountInCentavos = partialAmount 
      ? Math.round(partialAmount * 100) 
      : Math.round(payment.amount * 100);
    
    const refundMetadata = {
      payment_id: payment.id,
      payment_for: payment.payment_for,
      payment_for_id: payment.payment_for_id,
      refund_initiated_by: req.user?.id || 'system'
    };

    // 4. Call PayMongo refund API
    const refundResponse = await paymongoService.createRefund({
      paymentId: paymongoPaymentId,
      amount: partialAmount ? refundAmountInCentavos : null, // null = full refund
      reason: reason || 'requested_by_customer',
      notes: notes || 'Order cancellation',
      metadata: refundMetadata
    });

    const refund_id = refundResponse.id;
    const refund_status = refundResponse.attributes.status;

    // 5. Update payment record
    const newStatus = refund_status === 'succeeded' ? 'refunded' : 'pending_refund';
    
    await db.query(
      `UPDATE payment 
       SET status = ?, 
           refund_reference = ?, 
           metadata = JSON_SET(
             COALESCE(metadata, '{}'), 
             '$.refund_reason', ?, 
             '$.refund_notes', ?,
             '$.refund_amount_centavos', ?
           ),
           updated_at = ? 
       WHERE id = ?`,
      [newStatus, refund_id, reason || '', notes || '', refundAmountInCentavos, new Date(), id]
    );

    // 6. Update order payment status if applicable and refund succeeded
    if (payment.payment_for === 'order' && refund_status === 'succeeded') {
      await db.query(
        `UPDATE \`order\` 
         SET payment_status = 'refunded',
             refund_amount = ?
         WHERE id = ?`,
        [refundAmountInCentavos / 100, payment.payment_for_id]
      );
    }

    res.status(200).json({
      success: true,
      message: `Refund ${refund_status === 'succeeded' ? 'completed' : 'initiated'} successfully`,
      data: {
        refund_id,
        payment_id: payment.id,
        amount: refundAmountInCentavos / 100,
        currency: payment.currency,
        status: refund_status,
        reason: reason || 'requested_by_customer'
      }
    });

  } catch (error) {
    console.error("Error initiating refund:", error);
    
    if (error.message && error.message.includes('PayMongo')) {
      return res.status(502).json({ 
        success: false, 
        message: "Payment provider error. Please try again later.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: "Failed to initiate refund",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get refund status
 * GET /api/payments/:id/refund
 * Auth: Required (Admin or Owner)
 */
export async function getRefundStatus(req, res) {
  try {
    const { id } = req.params;

    // Fetch payment with refund info
    const [paymentRows] = await db.query(
      `SELECT 
        p.id, p.status, p.refund_reference, p.amount, p.currency,
        p.metadata, p.payment_for, p.payment_for_id
       FROM payment p
       WHERE p.id = ?`,
      [id]
    );

    if (!paymentRows || paymentRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Payment not found" 
      });
    }

    const payment = paymentRows[0];

    if (!payment.refund_reference) {
      return res.status(404).json({ 
        success: false, 
        message: "No refund found for this payment" 
      });
    }

    // Get refund details from PayMongo
    const refund = await paymongoService.getRefund(payment.refund_reference);

    res.status(200).json({
      success: true,
      data: {
        payment_id: payment.id,
        refund_id: payment.refund_reference,
        status: refund.attributes.status,
        amount: refund.attributes.amount / 100,
        currency: refund.attributes.currency,
        reason: refund.attributes.reason,
        created_at: refund.attributes.created_at
      }
    });

  } catch (error) {
    console.error("Error fetching refund status:", error);
    
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch refund status",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export default {
  initiateRefund,
  getRefundStatus
};
