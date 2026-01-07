/**
 * Refund Controller
 * 
 * Handles HTTP requests for refund and cancellation operations.
 * Thin controller - delegates business logic to RefundService.
 * 
 * Endpoints:
 * - POST /api/orders/:orderId/refund - Request refund for paid order
 * - POST /api/orders/:orderId/cancel-request - Cancel cash on pickup order
 * - GET /api/orders/:orderId/refund-eligibility - Check if eligible for refund
 * - GET /api/orders/:orderId/refund-status - Get refund status
 * - GET /api/refunds/my - Get user's refund history
 * - GET /api/refunds/:refundId - Get refund details
 * 
 * @see services/refundService.js
 */

import * as refundService from '../../services/refundService.js';
import { handleDbError } from '../../utils/errorHandler.js';
import { ensureUserRole } from '../../utils/authHelpers.js';

// ============= Refund Eligibility =============

/**
 * Check if an order is eligible for refund/cancellation
 * GET /api/orders/:orderId/refund-eligibility
 * Auth: Required (Tourist)
 */
export async function checkRefundEligibility(req, res) {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const eligibility = await refundService.checkOrderRefundEligibility(orderId, userId);

    res.status(200).json({
      success: true,
      data: {
        orderId,
        eligible: eligibility.eligible,
        canCancel: eligibility.canCancel,
        reason: eligibility.reason,
        paymentMethod: eligibility.paymentMethod,
        amount: eligibility.amount,
        requiresCustomerService: eligibility.requiresCustomerService,
        actions: getAvailableActions(eligibility)
      }
    });

  } catch (error) {
    console.error('[RefundController] Error checking eligibility:', error);
    return handleDbError(error, res);
  }
}

/**
 * Get available actions based on eligibility
 */
function getAvailableActions(eligibility) {
  const actions = [];

  if (eligibility.eligible) {
    actions.push({
      action: 'refund',
      label: 'Request Refund',
      description: `Request a full refund of ₱${eligibility.amount?.toFixed(2) || '0.00'}`,
      endpoint: 'POST /api/orders/:orderId/refund'
    });
  }

  if (eligibility.canCancel) {
    actions.push({
      action: 'cancel',
      label: 'Cancel Order',
      description: 'Cancel this cash on pickup order',
      endpoint: 'POST /api/orders/:orderId/cancel-request'
    });
  }

  if (eligibility.requiresCustomerService) {
    actions.push({
      action: 'customer_service',
      label: 'Contact Customer Service',
      description: 'This order has been processed. Please contact customer service for assistance.',
      endpoint: null
    });
  }

  return actions;
}

// ============= Refund Request =============

/**
 * Request refund for a paid order
 * POST /api/orders/:orderId/refund
 * Auth: Required (Tourist)
 * 
 * Body:
 * - reason: string (optional, default: 'requested_by_customer')
 * - notes: string (optional)
 * - amount: number (optional, for partial refund)
 */
export async function requestOrderRefund(req, res) {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;
    const { reason, notes, amount } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Validate reason if provided
    const validReasons = Object.values(refundService.REFUND_REASONS);
    if (reason && !validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: `Invalid reason. Must be one of: ${validReasons.join(', ')}`
      });
    }

    const result = await refundService.createOrderRefundRequest({
      orderId,
      userId,
      reason: reason || refundService.REFUND_REASONS.REQUESTED_BY_CUSTOMER,
      notes,
      amount: amount ? parseFloat(amount) : null
    });

    if (!result.success) {
      const statusCode = result.requiresCustomerService ? 409 : 400;
      return res.status(statusCode).json({
        success: false,
        message: result.error,
        requiresCustomerService: result.requiresCustomerService,
        canCancel: result.canCancel
      });
    }

    res.status(200).json({
      success: true,
      message: result.refund.message,
      data: {
        refundId: result.refund.id,
        status: result.refund.status,
        amount: result.refund.amount,
        paymongoRefundId: result.refund.paymongoRefundId
      }
    });

  } catch (error) {
    console.error('[RefundController] Error requesting refund:', error);
    
    if (error.message?.includes('PayMongo')) {
      return res.status(502).json({
        success: false,
        message: 'Payment provider error. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    return handleDbError(error, res);
  }
}

// ============= Cancellation Request =============

/**
 * Cancel a cash on pickup order
 * POST /api/orders/:orderId/cancel-request
 * Auth: Required (Tourist)
 * 
 * Body:
 * - reason: string (optional)
 * - notes: string (optional)
 */
export async function cancelOrderRequest(req, res) {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;
    const { reason, notes } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const result = await refundService.cancelCashOnPickupOrder({
      orderId,
      userId,
      reason: reason || 'changed_mind',
      notes
    });

    if (!result.success) {
      const statusCode = result.requiresCustomerService ? 409 : 400;
      return res.status(statusCode).json({
        success: false,
        message: result.error,
        requiresCustomerService: result.requiresCustomerService,
        shouldRefund: result.shouldRefund
      });
    }

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.order
    });

  } catch (error) {
    console.error('[RefundController] Error cancelling order:', error);
    return handleDbError(error, res);
  }
}

// ============= Refund Status =============

/**
 * Get refund status for an order
 * GET /api/orders/:orderId/refund-status
 * Auth: Required (Tourist, Business Owner, Admin)
 */
export async function getOrderRefundStatus(req, res) {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;
    const userRole = await ensureUserRole(req);
    const roleName = userRole?.roleName || userRole;

    const refunds = await refundService.getRefundsByResourceId(
      refundService.REFUND_FOR.ORDER,
      orderId
    );

    if (!refunds || refunds.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No refund requests found for this order'
      });
    }

    // Filter by ownership if Tourist
    if (roleName === 'Tourist') {
      const ownedRefunds = refunds.filter(r => r.requested_by === userId);
      if (ownedRefunds.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      return res.status(200).json({
        success: true,
        data: ownedRefunds
      });
    }

    res.status(200).json({
      success: true,
      data: refunds
    });

  } catch (error) {
    console.error('[RefundController] Error getting refund status:', error);
    return handleDbError(error, res);
  }
}

// ============= Refund Queries =============

/**
 * Get user's refund history
 * GET /api/refunds/my
 * Auth: Required (Tourist)
 */
export async function getMyRefunds(req, res) {
  try {
    const userId = req.user?.id;
    const { limit = 50, offset = 0 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const refunds = await refundService.getRefundsByUserId(
      userId,
      parseInt(limit),
      parseInt(offset)
    );

    res.status(200).json({
      success: true,
      data: refunds,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: refunds.length
      }
    });

  } catch (error) {
    console.error('[RefundController] Error getting user refunds:', error);
    return handleDbError(error, res);
  }
}

/**
 * Get refund by ID
 * GET /api/refunds/:refundId
 * Auth: Required (Tourist, Admin)
 */
export async function getRefundById(req, res) {
  try {
    const { refundId } = req.params;
    const userId = req.user?.id;
    const userRole = await ensureUserRole(req);
    const roleName = userRole?.roleName || userRole;

    const refund = await refundService.getRefundById(refundId);

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: 'Refund not found'
      });
    }

    // Ownership check for Tourist
    if (roleName === 'Tourist' && refund.requested_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: refund
    });

  } catch (error) {
    console.error('[RefundController] Error getting refund:', error);
    return handleDbError(error, res);
  }
}

// ============= Business/Admin Endpoints =============

/**
 * Get refund statistics for a business
 * GET /api/refunds/business/:businessId/stats
 * Auth: Required (Business Owner, Admin)
 */
export async function getBusinessRefundStats(req, res) {
  try {
    const { businessId } = req.params;
    const { startDate, endDate } = req.query;

    // Default to last 30 days if not specified
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end - 30 * 24 * 60 * 60 * 1000);

    const stats = await refundService.getRefundStatsByBusinessId(
      businessId,
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0]
    );

    res.status(200).json({
      success: true,
      data: stats,
      period: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('[RefundController] Error getting business stats:', error);
    return handleDbError(error, res);
  }
}

// ============= Booking Refunds =============

/**
 * Check booking refund eligibility
 * GET /api/bookings/:bookingId/refund-eligibility
 * Auth: Required (Tourist)
 */
export async function checkBookingRefundEligibility(req, res) {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const eligibility = await refundService.checkBookingRefundEligibility(bookingId, userId);

    res.status(200).json({
      success: true,
      data: {
        bookingId,
        eligible: eligibility.eligible,
        reason: eligibility.reason,
        paymentMethod: eligibility.paymentMethod,
        amount: eligibility.amount,
        requiresCustomerService: eligibility.requiresCustomerService
      }
    });

  } catch (error) {
    console.error('[RefundController] Error checking booking eligibility:', error);
    return handleDbError(error, res);
  }
}

/**
 * Request refund for a booking
 * POST /api/bookings/:bookingId/refund
 * Auth: Required (Tourist)
 */
export async function requestBookingRefund(req, res) {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.id;
    const { reason, notes, amount } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const result = await refundService.createBookingRefundRequest({
      bookingId,
      userId,
      reason: reason || refundService.REFUND_REASONS.REQUESTED_BY_CUSTOMER,
      notes,
      amount: amount ? parseFloat(amount) : null
    });

    if (!result.success) {
      const statusCode = result.requiresCustomerService ? 409 : 400;
      return res.status(statusCode).json({
        success: false,
        message: result.error,
        requiresCustomerService: result.requiresCustomerService
      });
    }

    res.status(200).json({
      success: true,
      message: result.refund.message,
      data: {
        refundId: result.refund.id,
        status: result.refund.status,
        amount: result.refund.amount,
        paymongoRefundId: result.refund.paymongoRefundId
      }
    });

  } catch (error) {
    console.error('[RefundController] Error requesting booking refund:', error);
    return handleDbError(error, res);
  }
}

export default {
  // Order refunds
  checkRefundEligibility,
  requestOrderRefund,
  cancelOrderRequest,
  getOrderRefundStatus,
  
  // Booking refunds
  checkBookingRefundEligibility,
  requestBookingRefund,
  
  // Queries
  getMyRefunds,
  getRefundById,
  getBusinessRefundStats
};
