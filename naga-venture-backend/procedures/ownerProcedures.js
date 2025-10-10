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
    CREATE PROCEDURE GetOwnerById(IN p_id CHAR(64))
    BEGIN
      SELECT * FROM owner WHERE id = p_id;
    END;
  `);

  // Insert owner
  await knex.raw(`
    CREATE PROCEDURE InsertOwner(
      IN p_id CHAR(64),
      IN p_first_name VARCHAR(30),
      IN p_middle_name VARCHAR(20),
      IN p_last_name VARCHAR(30),
      IN p_age INT,
      IN p_birthdate DATE,
      IN p_gender ENUM('Male','Female'),
      IN p_business_type ENUM('Shop','Accommodation','Both'),
      IN p_address_id INT,
      IN p_user_id CHAR(64)
    )
    BEGIN
      INSERT INTO owner (
        id, first_name, middle_name, last_name, age, birthdate, gender, business_type, address_id, user_id
      ) VALUES (
        p_id, p_first_name, p_middle_name, p_last_name, p_age, p_birthdate, p_gender, p_business_type, p_address_id, p_user_id
      );
      SELECT * FROM owner WHERE id = p_id;
    END;
  `);

  // Update owner (all fields optional)
  await knex.raw(`
    CREATE PROCEDURE UpdateOwner(
      IN p_id CHAR(64),
      IN p_first_name VARCHAR(30),
      IN p_middle_name VARCHAR(20),
      IN p_last_name VARCHAR(30),
      IN p_age INT,
      IN p_birthdate DATE,
      IN p_gender ENUM('Male','Female'),
      IN p_business_type ENUM('Shop','Accommodation','Both'),
      IN p_address_id INT,
      IN p_user_id CHAR(64)
    )
    BEGIN
      UPDATE owner
      SET first_name = IFNULL(p_first_name, first_name),
          middle_name = IFNULL(p_middle_name, middle_name),
          last_name = IFNULL(p_last_name, last_name),
          age = IFNULL(p_age, age),
          birthdate = IFNULL(p_birthdate, birthdate),
          gender = IFNULL(p_gender, gender),
          business_type = IFNULL(p_business_type, business_type),
          address_id = IFNULL(p_address_id, address_id),
          user_id = IFNULL(p_user_id, user_id)
      WHERE id = p_id;
      SELECT * FROM owner WHERE id = p_id;
    END;
  `);

  // Delete owner
  await knex.raw(`
    CREATE PROCEDURE DeleteOwner(IN p_id CHAR(64))
    BEGIN
      DELETE FROM owner WHERE id = p_id;
    END;
  `);

  // Get owner by user ID
  await knex.raw(`
    CREATE PROCEDURE GetOwnerByUserId(IN p_user_id CHAR(64))
    BEGIN
      SELECT * FROM owner WHERE user_id = p_user_id;
    END;
  `);
}

async function dropOwnerProcedures(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllOwners;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetOwnerById;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertOwner;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateOwner;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteOwner;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetOwnerByUserId;");
}

export { createOwnerProcedures, dropOwnerProcedures };
