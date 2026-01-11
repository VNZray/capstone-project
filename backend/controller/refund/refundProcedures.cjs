/**
 * Refund Stored Procedures
 * 
 * Database procedures for refund operations.
 * Follows the existing pattern from orderProcedures.js
 * 
 * @see migrations/20251209000001_refund_table.cjs
 */

/**
 * Create all refund-related stored procedures
 * @param {import('knex').Knex} knex
 */
async function createRefundProcedures(knex) {
  // Drop existing procedures first to ensure clean state
  await dropRefundProcedures(knex);

  // ========== CreateRefundRequest ==========
  // Creates a new refund request record
  await knex.raw(`
    CREATE PROCEDURE CreateRefundRequest(
      IN p_id VARCHAR(36),
      IN p_refund_for ENUM('order', 'booking'),
      IN p_refund_for_id VARCHAR(36),
      IN p_payment_id VARCHAR(36),
      IN p_requested_by VARCHAR(36),
      IN p_amount DECIMAL(10, 2),
      IN p_original_amount DECIMAL(10, 2),
      IN p_reason ENUM('requested_by_customer', 'duplicate', 'fraudulent', 'changed_mind', 'wrong_order', 'product_unavailable', 'business_issue', 'others'),
      IN p_notes TEXT,
      IN p_paymongo_payment_id VARCHAR(100)
    )
    BEGIN
      INSERT INTO refund (
        id,
        refund_for,
        refund_for_id,
        payment_id,
        requested_by,
        amount,
        original_amount,
        currency,
        reason,
        notes,
        status,
        paymongo_payment_id,
        requested_at,
        updated_at
      )
      VALUES (
        p_id,
        p_refund_for,
        p_refund_for_id,
        p_payment_id,
        p_requested_by,
        p_amount,
        p_original_amount,
        'PHP',
        p_reason,
        p_notes,
        'pending',
        p_paymongo_payment_id,
        NOW(),
        NOW()
      );
      
      SELECT * FROM refund WHERE id = p_id;
    END
  `);

  // ========== UpdateRefundStatus ==========
  // Updates refund status after PayMongo response
  await knex.raw(`
    CREATE PROCEDURE UpdateRefundStatus(
      IN p_refund_id VARCHAR(36),
      IN p_status ENUM('pending', 'processing', 'succeeded', 'failed', 'cancelled'),
      IN p_paymongo_refund_id VARCHAR(100),
      IN p_paymongo_response JSON,
      IN p_error_message TEXT
    )
    BEGIN
      UPDATE refund
      SET 
        status = p_status,
        paymongo_refund_id = COALESCE(p_paymongo_refund_id, paymongo_refund_id),
        paymongo_response = COALESCE(p_paymongo_response, paymongo_response),
        error_message = p_error_message,
        processed_at = CASE WHEN p_status IN ('processing', 'succeeded', 'failed') THEN NOW() ELSE processed_at END,
        completed_at = CASE WHEN p_status = 'succeeded' THEN NOW() ELSE completed_at END,
        updated_at = NOW()
      WHERE id = p_refund_id;
      
      SELECT * FROM refund WHERE id = p_refund_id;
    END
  `);

  // ========== GetRefundById ==========
  // Retrieves refund details by ID
  await knex.raw(`
    CREATE PROCEDURE GetRefundById(
      IN p_refund_id VARCHAR(36)
    )
    BEGIN
      SELECT 
        r.*,
        p.amount as payment_amount,
        p.payment_method,
        p.status as payment_status,
        u.email as requester_email,
        u.first_name as requester_first_name,
        u.last_name as requester_last_name
      FROM refund r
      LEFT JOIN payment p ON r.payment_id = p.id
      LEFT JOIN user u ON r.requested_by = u.id
      WHERE r.id = p_refund_id;
    END
  `);

  // ========== GetRefundsByResourceId ==========
  // Retrieves all refunds for an order or booking
  await knex.raw(`
    CREATE PROCEDURE GetRefundsByResourceId(
      IN p_refund_for ENUM('order', 'booking'),
      IN p_refund_for_id VARCHAR(36)
    )
    BEGIN
      SELECT 
        r.*,
        p.amount as payment_amount,
        p.payment_method,
        p.status as payment_status
      FROM refund r
      LEFT JOIN payment p ON r.payment_id = p.id
      WHERE r.refund_for = p_refund_for 
        AND r.refund_for_id = p_refund_for_id
      ORDER BY r.requested_at DESC;
    END
  `);

  // ========== GetRefundsByUserId ==========
  // Retrieves all refund requests made by a user
  await knex.raw(`
    CREATE PROCEDURE GetRefundsByUserId(
      IN p_user_id VARCHAR(36),
      IN p_limit INT,
      IN p_offset INT
    )
    BEGIN
      SELECT 
        r.*,
        p.amount as payment_amount,
        p.payment_method,
        CASE 
          WHEN r.refund_for = 'order' THEN o.order_number
          ELSE b.id
        END as resource_reference,
        CASE 
          WHEN r.refund_for = 'order' THEN bus_o.business_name
          ELSE bus_b.business_name
        END as business_name
      FROM refund r
      LEFT JOIN payment p ON r.payment_id = p.id
      LEFT JOIN \`order\` o ON r.refund_for = 'order' AND r.refund_for_id = o.id
      LEFT JOIN booking b ON r.refund_for = 'booking' AND r.refund_for_id = b.id
      LEFT JOIN business bus_o ON o.business_id = bus_o.id
      LEFT JOIN business bus_b ON b.business_id = bus_b.id
      WHERE r.requested_by = p_user_id
      ORDER BY r.requested_at DESC
      LIMIT p_limit OFFSET p_offset;
    END
  `);

  // ========== GetRefundStatsByBusinessId ==========
  // Get refund statistics for a business
  await knex.raw(`
    CREATE PROCEDURE GetRefundStatsByBusinessId(
      IN p_business_id VARCHAR(36),
      IN p_start_date DATE,
      IN p_end_date DATE
    )
    BEGIN
      SELECT 
        COUNT(*) as total_refunds,
        COUNT(CASE WHEN r.status = 'succeeded' THEN 1 END) as completed_refunds,
        COUNT(CASE WHEN r.status = 'pending' THEN 1 END) as pending_refunds,
        COUNT(CASE WHEN r.status = 'failed' THEN 1 END) as failed_refunds,
        SUM(CASE WHEN r.status = 'succeeded' THEN r.amount ELSE 0 END) as total_refunded_amount,
        r.refund_for
      FROM refund r
      LEFT JOIN \`order\` o ON r.refund_for = 'order' AND r.refund_for_id = o.id
      LEFT JOIN booking b ON r.refund_for = 'booking' AND r.refund_for_id = b.id
      WHERE (o.business_id = p_business_id OR b.business_id = p_business_id)
        AND r.requested_at BETWEEN p_start_date AND p_end_date
      GROUP BY r.refund_for;
    END
  `);

  // ========== CheckRefundEligibility ==========
  // Checks if an order/booking is eligible for refund
  await knex.raw(`
    CREATE PROCEDURE CheckRefundEligibility(
      IN p_refund_for ENUM('order', 'booking'),
      IN p_refund_for_id VARCHAR(36),
      IN p_user_id VARCHAR(36)
    )
    BEGIN
      DECLARE v_eligible BOOLEAN DEFAULT FALSE;
      DECLARE v_reason VARCHAR(255) DEFAULT '';
      DECLARE v_owner_id VARCHAR(36);
      DECLARE v_status VARCHAR(50);
      DECLARE v_payment_status VARCHAR(50);
      DECLARE v_payment_method VARCHAR(50);
      DECLARE v_has_pending_refund BOOLEAN DEFAULT FALSE;
      DECLARE v_payment_id VARCHAR(36);
      DECLARE v_paymongo_payment_id VARCHAR(100);
      DECLARE v_amount DECIMAL(10, 2);
      
      -- Check for existing pending refund
      SELECT COUNT(*) > 0 INTO v_has_pending_refund
      FROM refund
      WHERE refund_for = p_refund_for 
        AND refund_for_id = p_refund_for_id
        AND status IN ('pending', 'processing');
      
      IF v_has_pending_refund THEN
        SET v_eligible = FALSE;
        SET v_reason = 'A refund request is already pending for this resource';
      ELSE
        IF p_refund_for = 'order' THEN
          -- Check order eligibility
          SELECT 
            o.user_id,
            o.status,
            p.status,
            p.payment_method,
            p.id,
            p.paymongo_payment_id,
            o.total_amount
          INTO 
            v_owner_id, 
            v_status, 
            v_payment_status, 
            v_payment_method,
            v_payment_id,
            v_paymongo_payment_id,
            v_amount
          FROM \`order\` o
          LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
          WHERE o.id = p_refund_for_id;
          
          -- Validate conditions
          IF v_owner_id IS NULL THEN
            SET v_eligible = FALSE;
            SET v_reason = 'Order not found';
          ELSEIF v_owner_id != p_user_id THEN
            SET v_eligible = FALSE;
            SET v_reason = 'You are not the owner of this order';
          ELSEIF v_status NOT IN ('pending') THEN
            SET v_eligible = FALSE;
            SET v_reason = 'Order has already been processed. Please contact customer service.';
          ELSEIF v_payment_method = 'cash_on_pickup' THEN
            SET v_eligible = FALSE;
            SET v_reason = 'Cash on pickup orders can only be cancelled, not refunded';
          ELSEIF v_payment_status != 'paid' THEN
            SET v_eligible = FALSE;
            SET v_reason = 'Payment not completed for this order';
          ELSEIF v_paymongo_payment_id IS NULL THEN
            SET v_eligible = FALSE;
            SET v_reason = 'No PayMongo payment found for this order';
          ELSE
            SET v_eligible = TRUE;
            SET v_reason = 'Eligible for refund';
          END IF;
          
        ELSE
          -- Check booking eligibility
          SELECT 
            t.user_id,
            b.booking_status,
            p.status,
            p.payment_method,
            p.id,
            p.paymongo_payment_id,
            b.total_price
          INTO 
            v_owner_id, 
            v_status, 
            v_payment_status, 
            v_payment_method,
            v_payment_id,
            v_paymongo_payment_id,
            v_amount
          FROM booking b
          LEFT JOIN tourist t ON b.tourist_id = t.id
          LEFT JOIN payment p ON p.payment_for = 'booking' AND p.payment_for_id = b.id
          WHERE b.id = p_refund_for_id;
          
          -- Validate conditions
          IF v_owner_id IS NULL THEN
            SET v_eligible = FALSE;
            SET v_reason = 'Booking not found';
          ELSEIF v_owner_id != p_user_id THEN
            SET v_eligible = FALSE;
            SET v_reason = 'You are not the owner of this booking';
          ELSEIF v_status NOT IN ('Pending') THEN
            SET v_eligible = FALSE;
            SET v_reason = 'Booking has already been processed. Please contact customer service.';
          ELSEIF v_payment_status != 'paid' THEN
            SET v_eligible = FALSE;
            SET v_reason = 'Payment not completed for this booking';
          ELSEIF v_paymongo_payment_id IS NULL THEN
            SET v_eligible = FALSE;
            SET v_reason = 'No PayMongo payment found for this booking';
          ELSE
            SET v_eligible = TRUE;
            SET v_reason = 'Eligible for refund';
          END IF;
        END IF;
      END IF;
      
      -- Return eligibility result
      SELECT 
        v_eligible as eligible,
        v_reason as reason,
        v_payment_id as payment_id,
        v_paymongo_payment_id as paymongo_payment_id,
        v_amount as amount,
        v_payment_method as payment_method,
        v_status as resource_status;
    END
  `);

  // ========== MarkRefundAsProcessing ==========
  // Marks a refund as processing (PayMongo API called)
  await knex.raw(`
    CREATE PROCEDURE MarkRefundAsProcessing(
      IN p_refund_id VARCHAR(36),
      IN p_paymongo_refund_id VARCHAR(100)
    )
    BEGIN
      UPDATE refund
      SET 
        status = 'processing',
        paymongo_refund_id = p_paymongo_refund_id,
        processed_at = NOW(),
        updated_at = NOW()
      WHERE id = p_refund_id;
      
      SELECT * FROM refund WHERE id = p_refund_id;
    END
  `);

  // ========== IncrementRefundRetry ==========
  // Increments retry count for failed refunds
  await knex.raw(`
    CREATE PROCEDURE IncrementRefundRetry(
      IN p_refund_id VARCHAR(36),
      IN p_error_message TEXT
    )
    BEGIN
      UPDATE refund
      SET 
        retry_count = retry_count + 1,
        error_message = p_error_message,
        updated_at = NOW()
      WHERE id = p_refund_id;
      
      SELECT * FROM refund WHERE id = p_refund_id;
    END
  `);

  console.log("✅ All refund stored procedures created");
}

/**
 * Drop all refund-related stored procedures
 * @param {import('knex').Knex} knex
 */
async function dropRefundProcedures(knex) {
  const procedures = [
    'CreateRefundRequest',
    'UpdateRefundStatus',
    'GetRefundById',
    'GetRefundsByResourceId',
    'GetRefundsByUserId',
    'GetRefundStatsByBusinessId',
    'CheckRefundEligibility',
    'MarkRefundAsProcessing',
    'IncrementRefundRetry'
  ];

  for (const proc of procedures) {
    try {
      await knex.raw(`DROP PROCEDURE IF EXISTS ${proc}`);
    } catch (error) {
      console.warn(`Warning: Could not drop procedure ${proc}:`, error.message);
    }
  }

  console.log("✅ All refund stored procedures dropped");
}

module.exports = {
  createRefundProcedures,
  dropRefundProcedures
};
