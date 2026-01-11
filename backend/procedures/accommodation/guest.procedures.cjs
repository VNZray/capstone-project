async function createProcedures(knex) {
  // Get all guests
  await knex.raw(`
    CREATE PROCEDURE GetAllGuests()
    BEGIN
      SELECT * FROM guest ORDER BY created_at DESC;
    END;
  `);

  // Get guest by ID
  await knex.raw(`
    CREATE PROCEDURE GetGuestById(IN p_id CHAR(64))
    BEGIN
      SELECT * FROM guest WHERE id = p_id;
    END;
  `);

  // Search guests by name, phone, or email
  await knex.raw(`
    CREATE PROCEDURE SearchGuests(IN p_search_term VARCHAR(100))
    BEGIN
      SELECT * FROM guest
      WHERE
        CONCAT(first_name, ' ', IFNULL(middle_name, ''), ' ', last_name) LIKE CONCAT('%', p_search_term, '%')
        OR phone_number LIKE CONCAT('%', p_search_term, '%')
        OR email LIKE CONCAT('%', p_search_term, '%')
      ORDER BY created_at DESC
      LIMIT 50;
    END;
  `);

  // Get guest by phone number (exact match)
  await knex.raw(`
    CREATE PROCEDURE GetGuestByPhone(IN p_phone_number VARCHAR(20))
    BEGIN
      SELECT * FROM guest WHERE phone_number = p_phone_number LIMIT 1;
    END;
  `);

  // Get guest by email (exact match)
  await knex.raw(`
    CREATE PROCEDURE GetGuestByEmail(IN p_email VARCHAR(100))
    BEGIN
      SELECT * FROM guest WHERE email = p_email LIMIT 1;
    END;
  `);

  // Insert guest
  await knex.raw(`
    CREATE PROCEDURE InsertGuest(
      IN p_id CHAR(64),
      IN p_first_name VARCHAR(100),
      IN p_middle_name VARCHAR(100),
      IN p_last_name VARCHAR(100),
      IN p_gender ENUM('Male','Female','Other','Prefer not to say'),
      IN p_ethnicity VARCHAR(50),
      IN p_email VARCHAR(100),
      IN p_phone_number VARCHAR(20)
    )
    BEGIN
      INSERT INTO guest (
        id, first_name, middle_name, last_name, gender, ethnicity, email, phone_number
      ) VALUES (
        p_id, p_first_name, p_middle_name, p_last_name, p_gender, p_ethnicity, p_email, p_phone_number
      );
      SELECT * FROM guest WHERE id = p_id;
    END;
  `);

  // Update guest
  await knex.raw(`
    CREATE PROCEDURE UpdateGuest(
      IN p_id CHAR(64),
      IN p_first_name VARCHAR(100),
      IN p_middle_name VARCHAR(100),
      IN p_last_name VARCHAR(100),
      IN p_gender ENUM('Male','Female','Other','Prefer not to say'),
      IN p_ethnicity VARCHAR(50),
      IN p_email VARCHAR(100),
      IN p_phone_number VARCHAR(20)
    )
    BEGIN
      UPDATE guest
      SET
        first_name = IFNULL(p_first_name, first_name),
        middle_name = p_middle_name,
        last_name = IFNULL(p_last_name, last_name),
        gender = IFNULL(p_gender, gender),
        ethnicity = p_ethnicity,
        email = p_email,
        phone_number = p_phone_number
      WHERE id = p_id;
      SELECT * FROM guest WHERE id = p_id;
    END;
  `);

  // Delete guest
  await knex.raw(`
    CREATE PROCEDURE DeleteGuest(IN p_id CHAR(64))
    BEGIN
      DELETE FROM guest WHERE id = p_id;
    END;
  `);

  // Find or create guest by phone/email
  await knex.raw(`
    CREATE PROCEDURE FindOrCreateGuest(
      IN p_id CHAR(64),
      IN p_first_name VARCHAR(100),
      IN p_middle_name VARCHAR(100),
      IN p_last_name VARCHAR(100),
      IN p_gender ENUM('Male','Female','Other','Prefer not to say'),
      IN p_ethnicity VARCHAR(50),
      IN p_email VARCHAR(100),
      IN p_phone_number VARCHAR(20)
    )
    BEGIN
      DECLARE v_guest_id CHAR(64);

      -- Try to find existing guest by phone or email
      IF p_phone_number IS NOT NULL AND p_phone_number != '' THEN
        SELECT id INTO v_guest_id FROM guest WHERE phone_number = p_phone_number LIMIT 1;
      END IF;

      IF v_guest_id IS NULL AND p_email IS NOT NULL AND p_email != '' THEN
        SELECT id INTO v_guest_id FROM guest WHERE email = p_email LIMIT 1;
      END IF;

      -- If guest exists, update their info
      IF v_guest_id IS NOT NULL THEN
        UPDATE guest
        SET
          first_name = IFNULL(p_first_name, first_name),
          middle_name = p_middle_name,
          last_name = IFNULL(p_last_name, last_name),
          gender = IFNULL(p_gender, gender),
          ethnicity = p_ethnicity,
          email = IFNULL(p_email, email),
          phone_number = IFNULL(p_phone_number, phone_number)
        WHERE id = v_guest_id;
      ELSE
        -- Create new guest
        SET v_guest_id = p_id;
        INSERT INTO guest (
          id, first_name, middle_name, last_name, gender, ethnicity, email, phone_number
        ) VALUES (
          v_guest_id, p_first_name, p_middle_name, p_last_name, p_gender, p_ethnicity, p_email, p_phone_number
        );
      END IF;

      SELECT * FROM guest WHERE id = v_guest_id;
    END;
  `);
}

async function dropProcedures(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllGuests;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetGuestById;");
  await knex.raw("DROP PROCEDURE IF EXISTS SearchGuests;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetGuestByPhone;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetGuestByEmail;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertGuest;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateGuest;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteGuest;");
  await knex.raw("DROP PROCEDURE IF EXISTS FindOrCreateGuest;");
}

module.exports = { createProcedures, dropProcedures };
