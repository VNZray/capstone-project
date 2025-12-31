/**
 * Payment Stored Procedures
 * Handles payment entity operations
 */

/**
 * Create payment-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createPaymentProcedures(sequelize) {
  await sequelize.query(`
    CREATE PROCEDURE InsertPayment(
      IN p_id CHAR(64),
      IN p_payer_type ENUM('Tourist', 'Owner'),
      IN p_payment_type ENUM('Full Payment', 'Partial Payment'),
      IN p_payment_method ENUM('gcash', 'paymaya', 'card', 'cash_on_pickup'),
      IN p_amount DECIMAL(10, 2),
      IN p_status ENUM('pending', 'paid', 'failed', 'refunded'),
      IN p_payment_for ENUM('order', 'booking', 'reservation', 'subscription'),
      IN p_payer_id CHAR(64),
      IN p_payment_for_id CHAR(64),
      IN p_payment_intent_id VARCHAR(100),
      IN p_payment_method_id VARCHAR(100),
      IN p_client_key VARCHAR(255),
      IN p_paymongo_payment_id VARCHAR(100),
      IN p_currency VARCHAR(3),
      IN p_metadata JSON
    )
    BEGIN
      INSERT INTO payment (
        id, payer_type, payment_type, payment_method, amount, status, payment_for,
        payer_id, payment_for_id, payment_intent_id, payment_method_id, client_key,
        paymongo_payment_id, currency, metadata
      ) VALUES (
        p_id, p_payer_type, p_payment_type, p_payment_method, p_amount, IFNULL(p_status, 'pending'), p_payment_for,
        p_payer_id, p_payment_for_id, p_payment_intent_id, p_payment_method_id, p_client_key,
        p_paymongo_payment_id, IFNULL(p_currency, 'PHP'), p_metadata
      );
      SELECT * FROM payment WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetPaymentById(IN p_id CHAR(64))
    BEGIN
      SELECT * FROM payment WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetPaymentsByPayerId(IN p_payer_id CHAR(64))
    BEGIN
      SELECT * FROM payment WHERE payer_id = p_payer_id ORDER BY created_at DESC;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetPaymentsByPaymentForId(IN p_payment_for_id CHAR(64))
    BEGIN
      SELECT * FROM payment WHERE payment_for_id = p_payment_for_id ORDER BY created_at DESC;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdatePaymentStatus(IN p_id CHAR(64), IN p_status ENUM('pending', 'paid', 'failed', 'refunded'))
    BEGIN
      UPDATE payment SET status = p_status, updated_at = CURRENT_TIMESTAMP WHERE id = p_id;
      SELECT * FROM payment WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdatePayment(
      IN p_id CHAR(64),
      IN p_payer_type ENUM('Tourist', 'Owner'),
      IN p_payment_type ENUM('Full Payment', 'Partial Payment'),
      IN p_payment_method ENUM('gcash', 'paymaya', 'card', 'cash_on_pickup'),
      IN p_amount DECIMAL(10, 2),
      IN p_status ENUM('pending', 'paid', 'failed', 'refunded'),
      IN p_payment_for ENUM('order', 'booking', 'reservation', 'subscription'),
      IN p_payment_intent_id VARCHAR(100),
      IN p_payment_method_id VARCHAR(100),
      IN p_client_key VARCHAR(255),
      IN p_paymongo_payment_id VARCHAR(100),
      IN p_refund_reference VARCHAR(100),
      IN p_metadata JSON
    )
    BEGIN
      UPDATE payment SET
        payer_type = IFNULL(p_payer_type, payer_type),
        payment_type = IFNULL(p_payment_type, payment_type),
        payment_method = IFNULL(p_payment_method, payment_method),
        amount = IFNULL(p_amount, amount),
        status = IFNULL(p_status, status),
        payment_for = IFNULL(p_payment_for, payment_for),
        payment_intent_id = IFNULL(p_payment_intent_id, payment_intent_id),
        payment_method_id = IFNULL(p_payment_method_id, payment_method_id),
        client_key = IFNULL(p_client_key, client_key),
        paymongo_payment_id = IFNULL(p_paymongo_payment_id, paymongo_payment_id),
        refund_reference = IFNULL(p_refund_reference, refund_reference),
        metadata = IFNULL(p_metadata, metadata),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = p_id;
      SELECT * FROM payment WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeletePayment(IN p_id CHAR(64))
    BEGIN
      DELETE FROM payment WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetAllPayments()
    BEGIN
      SELECT * FROM payment ORDER BY created_at DESC;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetPaymentByPaymongoPaymentId(IN p_paymongo_payment_id VARCHAR(100))
    BEGIN
      SELECT * FROM payment WHERE paymongo_payment_id = p_paymongo_payment_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetPaymentByPaymentIntentId(IN p_payment_intent_id VARCHAR(100))
    BEGIN
      SELECT * FROM payment WHERE payment_intent_id = p_payment_intent_id;
    END;
  `);
}

/**
 * Drop payment-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropPaymentProcedures(sequelize) {
  const procedures = [
    'InsertPayment',
    'GetPaymentById',
    'GetPaymentsByPayerId',
    'GetPaymentsByPaymentForId',
    'UpdatePaymentStatus',
    'UpdatePayment',
    'DeletePayment',
    'GetAllPayments',
    'GetPaymentByPaymongoPaymentId',
    'GetPaymentByPaymentIntentId'
  ];

  for (const proc of procedures) {
    await sequelize.query(`DROP PROCEDURE IF EXISTS ${proc};`);
  }
}
