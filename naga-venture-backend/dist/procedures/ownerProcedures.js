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
      IN p_birthdate DATE,
      IN p_gender ENUM('Male','Female'),
      IN p_user_id CHAR(36)
    )
    BEGIN
      INSERT INTO owner (
        id, first_name, middle_name, last_name, age, birthdate, gender, user_id
      ) VALUES (
        p_id, p_first_name, p_middle_name, p_last_name, p_age, p_birthdate, p_gender, p_user_id
      );
      SELECT * FROM owner WHERE id = p_id;
    END;
  `);

  // Update owner (all fields optional)
  await knex.raw(`
    CREATE PROCEDURE UpdateOwner(
      IN p_id CHAR(36),
      IN p_first_name VARCHAR(30),
      IN p_middle_name VARCHAR(20),
      IN p_last_name VARCHAR(30),
      IN p_age INT,
      IN p_birthdate DATE,
      IN p_gender ENUM('Male','Female'),
      IN p_user_id CHAR(36)
    )
    BEGIN
      UPDATE owner
      SET first_name = IFNULL(p_first_name, first_name),
          middle_name = IFNULL(p_middle_name, middle_name),
          last_name = IFNULL(p_last_name, last_name),
          age = IFNULL(p_age, age),
          birthdate = IFNULL(p_birthdate, birthdate),
          gender = IFNULL(p_gender, gender),
          user_id = IFNULL(p_user_id, user_id)
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

  // Get owner by user ID
  await knex.raw(`
    CREATE PROCEDURE GetOwnerByUserId(IN p_user_id CHAR(36))
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
