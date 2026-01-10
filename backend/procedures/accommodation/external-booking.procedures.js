async function createExternalBookingProcedures(knex) {
  // Get all external bookings
  await knex.raw(`
    CREATE PROCEDURE GetAllExternalBookings()
    BEGIN
      SELECT * FROM external_booking;
    END;
  `);

  // Get external booking by business ID
  await knex.raw(`
    CREATE PROCEDURE GetExternalBookingsByBusinessId(IN p_business_id CHAR(64))
    BEGIN
      SELECT * FROM external_booking WHERE business_id = p_business_id;
    END;
  `);

  // Get external booking by ID
  await knex.raw(`
    CREATE PROCEDURE GetExternalBookingById(IN p_id INT)
    BEGIN
      SELECT * FROM external_booking WHERE id = p_id;
    END;
  `);

  // Insert external booking
  await knex.raw(`
    CREATE PROCEDURE InsertExternalBooking(
      IN p_name VARCHAR(40),
      IN p_link VARCHAR(255),
      IN p_business_id CHAR(64)
    )
    BEGIN
      INSERT INTO external_booking (name, link, business_id)
      VALUES (p_name, p_link, p_business_id);
      SELECT LAST_INSERT_ID() AS id;
    END;
  `);

  // Update external booking (all fields optional)
  await knex.raw(`
    CREATE PROCEDURE UpdateExternalBooking(
      IN p_id INT,
      IN p_name VARCHAR(40),
      IN p_link VARCHAR(255),
      IN p_business_id CHAR(64)
    )
    BEGIN
      UPDATE external_booking
      SET name = IFNULL(p_name, name),
          link = IFNULL(p_link, link),
          business_id = IFNULL(p_business_id, business_id)
      WHERE id = p_id;
      SELECT * FROM external_booking WHERE id = p_id;
    END;
  `);

  // Delete external booking
  await knex.raw(`
    CREATE PROCEDURE DeleteExternalBooking(IN p_id INT)
    BEGIN
      DELETE FROM external_booking WHERE id = p_id;
    END;
  `);
}

async function dropExternalBookingProcedures(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllExternalBookings;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetExternalBookingsByBusinessId;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetExternalBookingById;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertExternalBooking;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateExternalBooking;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteExternalBooking;");
}

module.exports = { createExternalBookingProcedures, dropExternalBookingProcedures };
