async function createPaymentProcedures(knex) {
  // Get all payments
  await knex.raw(`
    CREATE PROCEDURE GetAllPayments()
    BEGIN
      SELECT * FROM payment;
    END;
  `);

  // Get payment by ID
  await knex.raw(`
    CREATE PROCEDURE GetPaymentById(IN p_id CHAR(36))
    BEGIN
      SELECT * FROM payment WHERE id = p_id;
    END;
  `);

  // Insert payment
  await knex.raw(`
    CREATE PROCEDURE InsertPayment(
      IN p_id CHAR(36),
      IN p_payer_type ENUM('Tourist','Owner'),
      IN p_payment_type ENUM('Full Payment','Partial Payment'),
      IN p_payment_method ENUM('Gcash','Paymaya','Credit Card','Cash'),
      IN p_amount FLOAT,
      IN p_status ENUM('Paid','Pending Balance'),
      IN p_payment_for ENUM('Reservation','Pending Balance','Subscription'),
      IN p_payer_id CHAR(36),
      IN p_payment_for_id CHAR(36),
      IN p_created_at TIMESTAMP
    )
    BEGIN
      INSERT INTO payment (
        id, payer_type, payment_type, payment_method, amount, status, payment_for, payer_id, payment_for_id, created_at
      ) VALUES (
        p_id, p_payer_type, p_payment_type, p_payment_method, p_amount, p_status, p_payment_for, p_payer_id, p_payment_for_id, p_created_at
      );
      SELECT * FROM payment WHERE id = p_id;
    END;
  `);

  // Update payment (all fields optional except id)
  await knex.raw(`
    CREATE PROCEDURE UpdatePayment(
      IN p_id CHAR(36),
      IN p_payer_type ENUM('Tourist','Owner'),
      IN p_payment_type ENUM('Full Payment','Partial Payment'),
      IN p_payment_method ENUM('Gcash','Paymaya','Credit Card','Cash'),
      IN p_amount FLOAT,
      IN p_status ENUM('Paid','Pending Balance'),
      IN p_payment_for ENUM('Reservation','Pending Balance','Subscription'),
      IN p_payer_id CHAR(36),
      IN p_payment_for_id CHAR(36)
    )
    BEGIN
      UPDATE payment
      SET
        payer_type = IFNULL(p_payer_type, payer_type),
        payment_type = IFNULL(p_payment_type, payment_type),
        payment_method = IFNULL(p_payment_method, payment_method),
        amount = IFNULL(p_amount, amount),
        status = IFNULL(p_status, status),
        payment_for = IFNULL(p_payment_for, payment_for),
        payer_id = IFNULL(p_payer_id, payer_id),
        payment_for_id = IFNULL(p_payment_for_id, payment_for_id)
      WHERE id = p_id;
      SELECT * FROM payment WHERE id = p_id;
    END;
  `);

  // Delete payment
  await knex.raw(`
    CREATE PROCEDURE DeletePayment(IN p_id CHAR(36))
    BEGIN
      DELETE FROM payment WHERE id = p_id;
    END;
  `);

  // Get payment by payer ID
  await knex.raw(`
    CREATE PROCEDURE GetPaymentByPayerId(IN p_payer_id CHAR(36))
    BEGIN
      SELECT * FROM payment WHERE payer_id = p_payer_id;
    END;
  `);

  // Get payment by payment_for_id
  await knex.raw(`
    CREATE PROCEDURE GetPaymentByPaymentForId(IN p_payment_for_id CHAR(36))
    BEGIN
      SELECT * FROM payment WHERE payment_for_id = p_payment_for_id;
    END;
  `);
}

await knex.raw(`
  CREATE PROCEDURE GetPaymentsByBusinessId(IN p_business_id CHAR(36))
  BEGIN
    SELECT 
      p.id AS payment_id,
      p.payer_id,
      p.payer_type,
      p.payment_type,
      p.payment_method,
      p.amount,
      p.status,
      p.payment_for,
      p.created_at,
      b.id AS booking_id,
      b.check_in_date,
      b.check_out_date,
      b.total_price,
      t.first_name,
      t.last_name
    FROM payment p
    INNER JOIN booking b ON p.payment_for_id = b.id
    INNER JOIN tourist t ON b.tourist_id = t.id
    WHERE b.business_id = p_business_id;
  END;
`);


async function dropPaymentProcedures(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllPayments;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetPaymentById;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertPayment;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdatePayment;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeletePayment;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetPaymentByPayerId;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetPaymentByPaymentForId;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetPaymentsByBusinessId;");

}

export { createPaymentProcedures, dropPaymentProcedures };
