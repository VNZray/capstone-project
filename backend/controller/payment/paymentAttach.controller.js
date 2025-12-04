/**
 * Payment Attach Controller
 * Handles Payment Method attachment to Payment Intent for PIPM workflow
 * 
 * This handles the server-side attachment for e-wallets (gcash, paymaya)
 * Card payments should be attached client-side using the public key.
 */

import db from "../../db.js";
import { handleDbError } from "../../utils/errorHandler.js";
import * as paymongoService from "../../services/paymongoService.js";

/**
 * Attach Payment Method to Payment Intent (Server-side for e-wallets)
 * POST /api/payments/intent/:id/attach
 * Body: { payment_method_type: string, return_url: string, billing?: object }
 * Auth: Required (Tourist role)
 * 
 * For e-wallets: This endpoint creates the payment method and attaches it
 * For card payments: Use client-side attachment with public key + client_key
 */
export async function attachPaymentMethodToIntent(req, res) {
  try {
    const { id } = req.params; // Payment Intent ID
    const { payment_method_type, return_url, billing } = req.body;
    const user_id = req.user.id;

    // Validate input
    if (!payment_method_type) {
      return res.status(400).json({ 
        success: false, 
        message: "payment_method_type is required" 
      });
    }

    if (!return_url) {
      return res.status(400).json({ 
        success: false, 
        message: "return_url is required for e-wallet payments" 
      });
    }

    // 1. Find the order associated with this payment intent (from payment table)
    const [orderRows] = await db.query(
      `SELECT o.id, o.user_id, o.order_number, o.total_amount, o.status,
              p.status as payment_status
       FROM \`order\` o 
       JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
       WHERE p.payment_intent_id = ?`,
      [id]
    );

    if (!orderRows || orderRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Payment Intent not found or not associated with any order" 
      });
    }

    const order = orderRows[0];

    // Validate ownership
    if (order.user_id !== user_id) {
      return res.status(403).json({ 
        success: false, 
        message: "You are not authorized to attach payment method to this intent" 
      });
    }

    // Validate order status
    if (order.payment_status === 'paid') {
      return res.status(400).json({ 
        success: false, 
        message: "Payment already completed for this order" 
      });
    }

    // 2. Validate payment method type for server-side attachment
    const validEwalletTypes = ['gcash', 'paymaya'];
    if (!validEwalletTypes.includes(payment_method_type)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid payment method type for server-side attachment. Use: ${validEwalletTypes.join(', ')}. For card payments, use client-side attachment.`
      });
    }

    // 3. Create Payment Method for e-wallet
    const paymentMethod = await paymongoService.createPaymentMethod({
      type: payment_method_type,
      billing: billing || {},
      metadata: {
        order_id: order.id,
        order_number: order.order_number
      }
    });

    // 4. Attach Payment Method to Payment Intent
    const updatedIntent = await paymongoService.attachPaymentIntent(
      id,
      paymentMethod.id,
      return_url
    );

    // 5. Update payment record with payment_method_id and payment_method
    // Map payment_method_type to valid enum values
    const paymentMethodMap = {
      'gcash': 'gcash',
      'paymaya': 'paymaya',
      'card': 'card'
    };
    const mappedPaymentMethod = paymentMethodMap[payment_method_type] || 'card';

    await db.query(
      `UPDATE payment 
       SET payment_method_id = ?,
           payment_method = ?,
           updated_at = ?
       WHERE payment_for = 'order' 
         AND payment_for_id = ?`,
      [paymentMethod.id, mappedPaymentMethod, new Date(), order.id]
    );

    // 6. Handle next_action (redirect for e-wallets)
    const nextAction = updatedIntent.attributes.next_action;
    const intentStatus = updatedIntent.attributes.status;

    res.status(200).json({
      success: true,
      message: "Payment method attached successfully",
      data: {
        payment_intent_id: id,
        payment_method_id: paymentMethod.id,
        status: intentStatus, // 'awaiting_next_action' or 'processing'
        next_action: nextAction, // Contains redirect URL for e-wallets
        redirect_url: nextAction?.redirect?.url || null,
        order_id: order.id,
        order_number: order.order_number
      }
    });

  } catch (error) {
    console.error("Error attaching payment method:", error);
    
    if (error.message && error.message.includes('PayMongo')) {
      return res.status(502).json({ 
        success: false, 
        message: "Payment provider error. Please try again later.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: "Failed to attach payment method",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Create Payment Method and return for client-side attachment
 * POST /api/payments/method
 * Body: { type: string, billing?: object }
 * Auth: Required (Tourist role)
 * 
 * This creates a payment method that can be attached client-side.
 * Useful for pre-creating e-wallet payment methods before attachment.
 */
export async function createPaymentMethod(req, res) {
  try {
    const { type, billing, order_id } = req.body;
    const user_id = req.user.id;

    // Validate input
    if (!type) {
      return res.status(400).json({ 
        success: false, 
        message: "type is required" 
      });
    }

    // Validate payment method type
    const validTypes = ['gcash', 'paymaya', 'card'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid payment method type. Must be one of: ${validTypes.join(', ')}. For card payments, create payment method client-side.`
      });
    }

    // If order_id provided, validate ownership
    if (order_id) {
      const [orderRows] = await db.query(
        `SELECT user_id FROM \`order\` WHERE id = ?`,
        [order_id]
      );

      if (!orderRows || orderRows.length === 0 || orderRows[0].user_id !== user_id) {
        return res.status(403).json({ 
          success: false, 
          message: "You are not authorized to create payment method for this order" 
        });
      }
    }

    // Create Payment Method
    const paymentMethod = await paymongoService.createPaymentMethod({
      type,
      billing: billing || {},
      metadata: {
        user_id,
        order_id: order_id || null
      }
    });

    res.status(201).json({
      success: true,
      message: "Payment method created successfully",
      data: {
        payment_method_id: paymentMethod.id,
        type: paymentMethod.attributes.type,
        created_at: paymentMethod.attributes.created_at
      }
    });

  } catch (error) {
    console.error("Error creating payment method:", error);
    
    if (error.message && error.message.includes('PayMongo')) {
      return res.status(502).json({ 
        success: false, 
        message: "Payment provider error. Please try again later.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: "Failed to create payment method",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export default {
  attachPaymentMethodToIntent,
  createPaymentMethod
};
