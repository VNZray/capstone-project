async function createGuestProcedures(knex) {
  // Get all guests
  await knex.raw(`
    CREATE PROCEDURE GetAllGuests()
    BEGIN
      SELECT * FROM guest;
    END;
  `);

  // Get guest by ID
  await knex.raw(`
    CREATE PROCEDURE GetGuestById(IN p_id CHAR(36))
    BEGIN
      SELECT * FROM guest WHERE id = p_id;
    END;
  `);

  // Insert guest
  await knex.raw(`
    CREATE PROCEDURE InsertGuest(
      IN p_id CHAR(36),
      IN p_name VARCHAR(60),
      IN p_age INT,
      IN p_gender ENUM('Male','Female'),
      IN p_booking_id CHAR(36)
    )
    BEGIN
      INSERT INTO guest (
        id, name, age, gender, booking_id
      ) VALUES (
        p_id, p_name, p_age, p_gender, p_booking_id
      );
      SELECT * FROM guest WHERE id = p_id;
    END;
  `);

  // Update guest (all fields optional)
  await knex.raw(`
    CREATE PROCEDURE UpdateGuest(
      IN p_id CHAR(36),
      IN p_name VARCHAR(30),
      IN p_age INT,
      IN p_gender ENUM('Male','Female')
    )
    BEGIN
      UPDATE guest
      SET name = IFNULL(p_name, name),
          age = IFNULL(p_age, age),
          gender = IFNULL(p_gender, gender)
      WHERE id = p_id;
      SELECT * FROM guest WHERE id = p_id;
    END;
  `);

  // Delete guest
  await knex.raw(`
    CREATE PROCEDURE DeleteGuest(IN p_id CHAR(36))
    BEGIN
      DELETE FROM guest WHERE id = p_id;
    END;
  `);

  // Get guest by booking ID
  await knex.raw(`
    CREATE PROCEDURE GetGuestByBookingId(IN p_booking_id CHAR(36))
    BEGIN
      SELECT * FROM guest WHERE booking_id = p_booking_id;
    END;
  `);
}

async function dropGuestProcedures(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllGuests;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetGuestById;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertGuest;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateGuest;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteGuest;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetGuestByBookingId;");
}

export { createGuestProcedures, dropGuestProcedures };
