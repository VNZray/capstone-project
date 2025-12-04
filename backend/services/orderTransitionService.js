
/**
 * Order State Transition Service
 * Enforces allowed status transitions based on current status and actor role
 * Implements state machine logic from spec.md Section 5
 */

/**
 * Allowed transitions map
 * Key: current status, Value: { nextStates: [], requiredRoles: [] }
 * Note: Role names are lowercase to match normalized actorRole in canTransition()
 */
const TRANSITION_RULES = {
  pending: {
    accepted: ['business owner', 'staff', 'admin'],
    cancelled_by_business: ['business owner', 'staff', 'admin'],
    cancelled_by_user: ['tourist', 'admin'],
    failed_payment: ['system', 'admin']
  },
  accepted: {
    preparing: ['business owner', 'staff', 'admin'],
    cancelled_by_business: ['business owner', 'staff', 'admin']
  },
  preparing: {
    ready_for_pickup: ['business owner', 'staff', 'admin'],
    cancelled_by_business: ['business owner', 'staff', 'admin']
  },
  ready_for_pickup: {
    picked_up: ['business owner', 'staff', 'admin'],
    cancelled_by_business: ['business owner', 'staff', 'admin']
  },
  picked_up: {
    // Terminal state - no transitions allowed
  },
  cancelled_by_user: {
    // Terminal state - no transitions allowed
  },
  cancelled_by_business: {
    // Terminal state - no transitions allowed
  },
  failed_payment: {
    // Terminal state - no transitions allowed
  }
};

/**
 * Check if a status transition is allowed
 * Also validates payment requirements for PayMongo orders (Phase 4)
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - Desired new status
 * @param {string} actorRole - Role of the user attempting transition (tourist, owner, staff, admin, system)
 * @param {Object} order - Full order object with payment info (optional for payment validation)
 * @returns {Object} { allowed: boolean, reason: string }
 */
export function canTransition(currentStatus, newStatus, actorRole, order = null) {
  // Normalize inputs
  currentStatus = currentStatus?.toLowerCase();
  newStatus = newStatus?.toLowerCase();
  actorRole = actorRole?.toLowerCase();

  // Check if current status exists in rules
  if (!TRANSITION_RULES[currentStatus]) {
    return {
      allowed: false,
      reason: `Invalid current status: ${currentStatus}`
    };
  }

  // Check if new status is in allowed transitions from current
  const allowedTransitions = TRANSITION_RULES[currentStatus];
  if (!allowedTransitions[newStatus]) {
    const validNextStates = Object.keys(allowedTransitions);
    return {
      allowed: false,
      reason: `Cannot transition from ${currentStatus} to ${newStatus}. Valid next states: ${validNextStates.join(', ') || 'none (terminal state)'}`
    };
  }

  // Check if actor role is authorized for this transition
  const requiredRoles = allowedTransitions[newStatus];

  if (!requiredRoles.includes(actorRole)) {
    return {
      allowed: false,
      reason: `Role ${actorRole} is not authorized to transition from ${currentStatus} to ${newStatus}. Required roles: ${requiredRoles.join(', ')}`
    };
  }

  // ========== Payment Status Validation (Phase 4) ==========
  // Block certain transitions for PayMongo orders until payment is confirmed
  // Payment status is tracked in the payment table (single source of truth)
  if (order && order.payment_method === 'paymongo') {
    // Fetch payment status from payment table
    const paymentStatus = order.payment_status?.toLowerCase() || 
                         (order.paymongo_payment_id ? 'paid' : 'pending');

    // Block PREPARING and READY_FOR_PICKUP until payment is confirmed
    if (['preparing', 'ready_for_pickup'].includes(newStatus)) {
      if (paymentStatus !== 'paid') {
        return {
          allowed: false,
          reason: `Cannot transition to ${newStatus}: PayMongo payment not confirmed (payment_status: ${paymentStatus}). Order must be paid before preparation.`
        };
      }
    }
  }

  return {
    allowed: true,
    reason: null
  };
}

/**
 * Get allowed next statuses for current status and actor
 * @param {string} currentStatus
 * @param {string} actorRole
 * @returns {Array<string>} List of allowed next statuses
 */
export function getAllowedNextStatuses(currentStatus, actorRole) {
  currentStatus = currentStatus?.toLowerCase();
  actorRole = actorRole?.toLowerCase();

  if (!TRANSITION_RULES[currentStatus]) {
    return [];
  }

  const allowedTransitions = TRANSITION_RULES[currentStatus];
  const nextStatuses = [];

  for (const [nextStatus, requiredRoles] of Object.entries(allowedTransitions)) {
    if (requiredRoles.includes(actorRole)) {
      nextStatuses.push(nextStatus);
    }
  }

  return nextStatuses;
}

/**
 * Check if grace period cancellation is allowed
 * @param {Date|string} orderCreatedAt - Order creation timestamp
 * @param {number} graceSeconds - Grace period in seconds (from env)
 * @returns {Object} { allowed: boolean, reason: string, remainingSeconds: number }
 */
export function canCancelWithinGrace(orderCreatedAt, graceSeconds = 10) {
  const createdAt = new Date(orderCreatedAt);
  const now = new Date();
  const elapsedSeconds = (now - createdAt) / 1000;
  const remainingSeconds = Math.max(0, graceSeconds - elapsedSeconds);

  if (elapsedSeconds <= graceSeconds) {
    return {
      allowed: true,
      reason: null,
      remainingSeconds: Math.ceil(remainingSeconds)
    };
  }

  return {
    allowed: false,
    reason: `Grace period of ${graceSeconds} seconds has expired. Order was created ${Math.floor(elapsedSeconds)} seconds ago.`,
    remainingSeconds: 0
  };
}

/**
 * Determine cancelled_by value based on actor role and cancellation context
 * @param {string} actorRole - tourist, owner, staff, admin, system
 * @param {string} currentStatus - Current order status
 * @returns {string} 'user' | 'business' | 'system'
 */
export function getCancelledByActor(actorRole, currentStatus) {
  const roleLower = actorRole?.toLowerCase();

  if (roleLower === 'tourist') {
    return 'user';
  } else if (actorRole === 'Business Owner' || roleLower === 'business owner' || roleLower === 'staff') {
    return 'business';
  } else if (roleLower === 'system' || currentStatus === 'failed_payment') {
    return 'system';
  } else if (roleLower === 'admin') {
    // Admin can cancel on behalf of either party - need context
    // Default to system for admin-initiated cancellations
    return 'system';
  }

  return 'system'; // fallback
}

/**
 * Validate cancellation request
 * @param {Object} order - Order object with status, created_at, payment_status
 * @param {string} actorRole - Role of actor requesting cancellation
 * @param {number} graceSeconds - Grace period in seconds
 * @returns {Object} { allowed: boolean, reason: string, cancelled_by: string }
 */
export function validateCancellation(order, actorRole, graceSeconds = 10) {
  const currentStatus = order.status?.toLowerCase();
  const roleLower = actorRole?.toLowerCase();

  // Cannot cancel terminal states
  if (['picked_up', 'cancelled_by_user', 'cancelled_by_business', 'failed_payment'].includes(currentStatus)) {
    return {
      allowed: false,
      reason: `Cannot cancel order with status: ${currentStatus}`,
      cancelled_by: null
    };
  }

  // Tourist cancellation rules
  if (roleLower === 'tourist') {
    if (currentStatus !== 'pending') {
      return {
        allowed: false,
        reason: 'Tourists can only cancel orders with status "pending"',
        cancelled_by: null
      };
    }

    // Check grace period
    const graceCheck = canCancelWithinGrace(order.created_at, graceSeconds);
    if (!graceCheck.allowed) {
      return {
        allowed: false,
        reason: `Grace period expired. ${graceCheck.reason}`,
        cancelled_by: null
      };
    }

    return {
      allowed: true,
      reason: null,
      cancelled_by: 'user'
    };
  }

  // Business (Business Owner/staff) cancellation rules
  if (actorRole === 'Business Owner' || roleLower === 'business owner' || roleLower === 'staff') {
    // Business can cancel before picked_up
    if (currentStatus === 'picked_up') {
      return {
        allowed: false,
        reason: 'Cannot cancel order that has been picked up',
        cancelled_by: null
      };
    }

    return {
      allowed: true,
      reason: null,
      cancelled_by: 'business'
    };
  }

  // Admin and system can cancel (with appropriate reason)
  if (['admin', 'system'].includes(actorRole)) {
    return {
      allowed: true,
      reason: null,
      cancelled_by: getCancelledByActor(actorRole, currentStatus)
    };
  }

  return {
    allowed: false,
    reason: `Invalid actor role: ${actorRole}`,
    cancelled_by: null
  };
}

export default {
  canTransition,
  getAllowedNextStatuses,
  canCancelWithinGrace,
  getCancelledByActor,
  validateCancellation
};
