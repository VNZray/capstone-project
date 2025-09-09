async function createUserProcedures(knex) {
  // Get all users
  await knex.raw(`
    CREATE PROCEDURE GetAllUsers()
    BEGIN
      SELECT * FROM user;
    END;
  `);

  // Get user by ID
  await knex.raw(`
    CREATE PROCEDURE GetUserById(IN p_id CHAR(36))
    BEGIN
      SELECT * FROM user WHERE id = p_id;
    END;
  `);

  // Get user by Owner ID
  await knex.raw(`
    CREATE PROCEDURE GetUserByOwnerId(IN p_owner_id CHAR(36))
    BEGIN
      SELECT * FROM user WHERE owner_id = p_owner_id;
    END;
  `);

  // Get user by Tourism ID
  await knex.raw(`
    CREATE PROCEDURE GetUserByTourismId(IN p_tourism_id CHAR(36))
    BEGIN
      SELECT * FROM user WHERE tourism_id = p_tourism_id;
    END;
  `);

  // Get user by Tourist ID
  await knex.raw(`
    CREATE PROCEDURE GetUserByTouristId(IN p_tourist_id CHAR(36))
    BEGIN
      SELECT * FROM user WHERE tourist_id = p_tourist_id;
    END;
  `);

  // Insert user
  await knex.raw(`
    CREATE PROCEDURE InsertUser(
      IN p_id CHAR(36),
      IN p_role ENUM('Tourist', 'Owner', 'Tourism', 'Event Manager'),
      IN p_email VARCHAR(40),
      IN p_phone_number VARCHAR(13),
      IN p_password TEXT,
      IN p_user_profile TEXT,
      IN p_tourist_id CHAR(36),
      IN p_owner_id CHAR(36),
      IN p_tourism_id CHAR(36)
    )
    BEGIN
      INSERT INTO user (
        id, role, email, phone_number, password, user_profile,
        tourist_id, owner_id, tourism_id
      ) VALUES (
        p_id, p_role, p_email, p_phone_number, p_password, p_user_profile,
        p_tourist_id, p_owner_id, p_tourism_id
      );

      SELECT * FROM user WHERE id = p_id;
    END;
  `);

  // Update user
  await knex.raw(`
    CREATE PROCEDURE UpdateUser(
      IN p_id CHAR(36),
      IN p_role ENUM('Tourist', 'Owner', 'Tourism', 'Event Manager'),
      IN p_email VARCHAR(40),
      IN p_phone_number VARCHAR(13),
      IN p_password TEXT,
      IN p_user_profile TEXT,
      IN p_tourist_id CHAR(36),
      IN p_owner_id CHAR(36),
      IN p_tourism_id CHAR(36)
    )
    BEGIN
      UPDATE user
      SET role = IFNULL(p_role, role),
          email = IFNULL(p_email, email),
          phone_number = IFNULL(p_phone_number, phone_number),
          password = IFNULL(p_password, password),
          user_profile = IFNULL(p_user_profile, user_profile),
          tourist_id = IFNULL(p_tourist_id, tourist_id),
          owner_id = IFNULL(p_owner_id, owner_id),
          tourism_id = IFNULL(p_tourism_id, tourism_id)
      WHERE id = p_id;

      SELECT * FROM user WHERE id = p_id;
    END;
  `);

  // Delete user
  await knex.raw(`
    CREATE PROCEDURE DeleteUser(IN p_id CHAR(36))
    BEGIN
      DELETE FROM user WHERE id = p_id;
    END;
  `);
}

async function dropUserProcedures(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllUsers;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetUserById;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertUser;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateUser;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteUser;");
}

export { createUserProcedures, dropUserProcedures };
