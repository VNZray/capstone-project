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
      SET first_name = p_first_name,
          middle_name = p_middle_name,
          last_name = p_last_name,
          age = p_age,
          birthday = p_birthday,
          gender = p_gender,
          email = p_email,
          phone_number = p_phone_number,
          business_type = p_business_type,
          address_id = p_address_id
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
