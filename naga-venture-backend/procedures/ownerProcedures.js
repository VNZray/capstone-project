async function createOwnerProcedures(knex) {
  // Get all owners
  await knex.raw(`
    CREATE PROCEDURE GetAllOwners()
    BEGIN
      SELECT * FROM owner;
    END;
  `);

  // Get owner by ID
  await knex.raw(`
    CREATE PROCEDURE GetOwnerById(IN p_id CHAR(36))
    BEGIN
      SELECT * FROM owner WHERE id = p_id;
    END;
  `);

  // Insert owner
  await knex.raw(`
    CREATE PROCEDURE InsertOwner(
      IN p_id CHAR(36),
      IN p_first_name VARCHAR(30),
      IN p_middle_name VARCHAR(20),
      IN p_last_name VARCHAR(30),
      IN p_age INT,
      IN p_birthday DATE,
      IN p_gender ENUM('Male','Female'),
      IN p_email VARCHAR(40),
      IN p_phone_number VARCHAR(13),
      IN p_business_type ENUM('Shop','Accommodation','Both'),
      IN p_address_id INT
    )
    BEGIN
      INSERT INTO owner (
        id, first_name, middle_name, last_name, age, birthday, gender,
        email, phone_number, business_type, address_id
      ) VALUES (
        p_id, p_first_name, p_middle_name, p_last_name, p_age, p_birthday, p_gender,
        p_email, p_phone_number, p_business_type, p_address_id
      );

      SELECT * FROM owner WHERE id = p_id;
    END;
  `);

  // Update owner
  await knex.raw(`
    CREATE PROCEDURE UpdateOwner(
      IN p_id CHAR(36),
      IN p_first_name VARCHAR(30),
      IN p_middle_name VARCHAR(20),
      IN p_last_name VARCHAR(30),
      IN p_age INT,
      IN p_birthday DATE,
      IN p_gender ENUM('Male','Female'),
      IN p_email VARCHAR(40),
      IN p_phone_number VARCHAR(13),
      IN p_business_type ENUM('Shop','Accommodation','Both'),
      IN p_address_id INT
    )
    BEGIN
      UPDATE owner
      SET first_name = IFNULL(p_first_name, first_name),
          middle_name = IFNULL(p_middle_name, middle_name),
          last_name = IFNULL(p_last_name, last_name),
          age = IFNULL(p_age, age),
          birthday = IFNULL(p_birthday, birthday),
          gender = IFNULL(p_gender, gender),
          email = IFNULL(p_email, email),
          phone_number = IFNULL(p_phone_number, phone_number),
          business_type = IFNULL(p_business_type, business_type),
          address_id = IFNULL(p_address_id, address_id)
      WHERE id = p_id;

      SELECT * FROM owner WHERE id = p_id;
    END;
  `);

  // Delete owner
  await knex.raw(`
    CREATE PROCEDURE DeleteOwner(IN p_id CHAR(36))
    BEGIN
      DELETE FROM owner WHERE id = p_id;
    END;
  `);
}

async function dropOwnerProcedures(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllOwners;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetOwnerById;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertOwner;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateOwner;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteOwner;");
}

export { createOwnerProcedures, dropOwnerProcedures };
