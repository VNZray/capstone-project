/**
 * External Booking Stored Procedures
 * Handles external booking link operations
 */

/**
 * Create external booking-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createExternalBookingProcedures(sequelize) {
  await sequelize.query(`
    CREATE PROCEDURE InsertExternalBooking(
      IN p_name VARCHAR(40),
      IN p_link VARCHAR(255),
      IN p_business_id CHAR(64)
    )
    BEGIN
      INSERT INTO external_booking (name, link, business_id)
      VALUES (p_name, p_link, p_business_id);
      SELECT * FROM external_booking WHERE id = LAST_INSERT_ID();
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetExternalBookingById(IN p_id INT)
    BEGIN
      SELECT eb.*, b.business_name
      FROM external_booking eb
      LEFT JOIN business b ON eb.business_id = b.id
      WHERE eb.id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetExternalBookingsByBusinessId(IN p_business_id CHAR(64))
    BEGIN
      SELECT eb.*, b.business_name
      FROM external_booking eb
      LEFT JOIN business b ON eb.business_id = b.id
      WHERE eb.business_id = p_business_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateExternalBooking(
      IN p_id INT,
      IN p_name VARCHAR(40),
      IN p_link VARCHAR(255),
      IN p_business_id CHAR(64)
    )
    BEGIN
      UPDATE external_booking SET
        name = IFNULL(p_name, name),
        link = IFNULL(p_link, link),
        business_id = IFNULL(p_business_id, business_id)
      WHERE id = p_id;
      SELECT * FROM external_booking WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeleteExternalBooking(IN p_id INT)
    BEGIN
      DELETE FROM external_booking WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetAllExternalBookings()
    BEGIN
      SELECT eb.*, b.business_name
      FROM external_booking eb
      LEFT JOIN business b ON eb.business_id = b.id;
    END;
  `);
}

/**
 * Drop external booking-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropExternalBookingProcedures(sequelize) {
  const procedures = [
    'InsertExternalBooking',
    'GetExternalBookingById',
    'GetExternalBookingsByBusinessId',
    'UpdateExternalBooking',
    'DeleteExternalBooking',
    'GetAllExternalBookings'
  ];

  for (const proc of procedures) {
    await sequelize.query(`DROP PROCEDURE IF EXISTS ${proc};`);
  }
}
