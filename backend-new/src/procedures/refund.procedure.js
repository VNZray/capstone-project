/**
 * Refund Stored Procedures
 * Extracted from 20251004000001-refund-table.cjs
 */

/**
 * Create all refund-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createRefundProcedures(sequelize) {
  await sequelize.query(`
    CREATE PROCEDURE CreateRefundRequest(
      IN p_id CHAR(64),
      IN p_refund_for ENUM('order', 'booking'),
      IN p_refund_for_id CHAR(64),
      IN p_payment_id CHAR(64),
      IN p_requested_by CHAR(64),
      IN p_amount DECIMAL(10, 2),
      IN p_original_amount DECIMAL(10, 2),
      IN p_reason ENUM('requested_by_customer', 'duplicate', 'fraudulent', 'changed_mind', 'wrong_order', 'product_unavailable', 'business_issue', 'others'),
      IN p_notes TEXT,
      IN p_paymongo_payment_id VARCHAR(100)
    )
    BEGIN
      INSERT INTO refund (
        id, refund_for, refund_for_id, payment_id, requested_by,
        amount, original_amount, currency, reason, notes, status,
        paymongo_payment_id, requested_at, updated_at
      ) VALUES (
        p_id, p_refund_for, p_refund_for_id, p_payment_id, p_requested_by,
        p_amount, p_original_amount, 'PHP', p_reason, p_notes, 'pending',
        p_paymongo_payment_id, NOW(), NOW()
      );
      SELECT * FROM refund WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateRefundStatus(
      IN p_refund_id CHAR(64),
      IN p_status ENUM('pending', 'processing', 'succeeded', 'failed', 'cancelled'),
      IN p_paymongo_refund_id VARCHAR(100),
      IN p_paymongo_response JSON,
      IN p_error_message TEXT
    )
    BEGIN
      UPDATE refund SET
        status = p_status,
        paymongo_refund_id = COALESCE(p_paymongo_refund_id, paymongo_refund_id),
        paymongo_response = COALESCE(p_paymongo_response, paymongo_response),
        error_message = p_error_message,
        processed_at = CASE WHEN p_status IN ('processing', 'succeeded', 'failed') THEN NOW() ELSE processed_at END,
        completed_at = CASE WHEN p_status = 'succeeded' THEN NOW() ELSE completed_at END,
        updated_at = NOW()
      WHERE id = p_refund_id;
      SELECT * FROM refund WHERE id = p_refund_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetRefundById(IN p_refund_id CHAR(64))
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
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetRefundsByResourceId(
      IN p_refund_for ENUM('order', 'booking'),
      IN p_refund_for_id CHAR(64)
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
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetRefundsByUserId(
      IN p_user_id CHAR(64),
      IN p_limit INT,
      IN p_offset INT
    )
    BEGIN
      SELECT
        r.*,
        p.amount as payment_amount,
        p.payment_method,
        p.status as payment_status
      FROM refund r
      LEFT JOIN payment p ON r.payment_id = p.id
      WHERE r.requested_by = p_user_id
      ORDER BY r.requested_at DESC
      LIMIT p_limit OFFSET p_offset;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetPendingRefundsByBusinessId(IN p_business_id CHAR(64))
    BEGIN
      SELECT
        r.*,
        p.amount as payment_amount,
        p.payment_method
      FROM refund r
      LEFT JOIN payment p ON r.payment_id = p.id
      LEFT JOIN \`order\` o ON r.refund_for = 'order' AND r.refund_for_id = o.id
      LEFT JOIN booking b ON r.refund_for = 'booking' AND r.refund_for_id = b.id
      LEFT JOIN room rm ON b.room_id = rm.id
      WHERE r.status = 'pending'
        AND (o.business_id = p_business_id OR rm.business_id = p_business_id)
      ORDER BY r.requested_at ASC;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE CancelRefundRequest(
      IN p_refund_id CHAR(64),
      IN p_cancelled_by CHAR(64),
      IN p_admin_notes TEXT
    )
    BEGIN
      UPDATE refund SET
        status = 'cancelled',
        admin_notes = p_admin_notes,
        updated_at = NOW()
      WHERE id = p_refund_id AND status = 'pending';
      SELECT * FROM refund WHERE id = p_refund_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE IncrementRefundRetry(IN p_refund_id CHAR(64))
    BEGIN
      UPDATE refund SET
        retry_count = retry_count + 1,
        updated_at = NOW()
      WHERE id = p_refund_id;
      SELECT * FROM refund WHERE id = p_refund_id;
    END;
  `);
}

/**
 * Drop all refund-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropRefundProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS CreateRefundRequest;');
  await sequelize.query('DROP PROCEDURE IF EXISTS UpdateRefundStatus;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetRefundById;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetRefundsByResourceId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetRefundsByUserId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetPendingRefundsByBusinessId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS CancelRefundRequest;');
  await sequelize.query('DROP PROCEDURE IF EXISTS IncrementRefundRetry;');
}
