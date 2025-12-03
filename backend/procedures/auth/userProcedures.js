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
    CREATE PROCEDURE GetUserById(IN p_id CHAR(64))
    BEGIN
      SELECT * FROM user WHERE id = p_id;
    END;
  `);

  // Get users by Role ID
  await knex.raw(`
    CREATE PROCEDURE GetUsersByRoleId(IN p_user_role_id INT)
    BEGIN
      SELECT * FROM user WHERE user_role_id = p_user_role_id;
    END;
  `);

  // Insert user
  await knex.raw(`
    CREATE PROCEDURE InsertUser(
      IN p_id CHAR(64),
      IN p_email VARCHAR(40),
      IN p_phone_number VARCHAR(13),
      IN p_password TEXT,
      IN p_user_profile TEXT,
      IN p_otp VARCHAR(6),
      IN p_is_verified BOOLEAN,
      IN p_is_active BOOLEAN,
      IN p_last_login TIMESTAMP,
      IN p_user_role_id INT,
      IN p_barangay_id INT
    )
    BEGIN
      INSERT INTO user (
        id, email, phone_number, password, user_profile, otp,
        is_verified, is_active, last_login, user_role_id, barangay_id
      ) VALUES (
        p_id, p_email, p_phone_number, p_password, p_user_profile, p_otp,
        p_is_verified, p_is_active, p_last_login, p_user_role_id, p_barangay_id
      );
      SELECT * FROM user WHERE id = p_id;
    END;
  `);

  // Insert user role
  await knex.raw(`
    CREATE PROCEDURE InsertUserRole(
      IN p_role_name VARCHAR(40),
      IN p_role_description TEXT
    )
    BEGIN
      INSERT INTO user_role (role_name, role_description)
      VALUES (p_role_name, p_role_description);
      SELECT * FROM user_role WHERE id = LAST_INSERT_ID();
    END;
  `);

  // Get all user roles
  await knex.raw(`
    CREATE PROCEDURE GetAllUserRoles()
    BEGIN
      SELECT * FROM user_role;
    END;
  `);

  // Get user role by ID
  await knex.raw(`
    CREATE PROCEDURE GetUserRoleById(IN p_id INT)
    BEGIN
      SELECT * FROM user_role WHERE id = p_id;
    END;
  `);

  // Update user role by ID
  await knex.raw(`
    CREATE PROCEDURE UpdateUserRole(
      IN p_id INT,
      IN p_role_name VARCHAR(40),
      IN p_role_description TEXT
    )
    BEGIN
      UPDATE user_role
      SET role_name = IFNULL(p_role_name, role_name),
          role_description = IFNULL(p_role_description, role_description)
      WHERE id = p_id;
      SELECT * FROM user_role WHERE id = p_id;
    END;
  `);

  // Update user role by role name
  await knex.raw(`
    CREATE PROCEDURE UpdateUserRoleByName(
      IN p_role_name VARCHAR(40),
      IN p_new_role_name VARCHAR(40),
      IN p_role_description TEXT
    )
    BEGIN
      UPDATE user_role
      SET role_name = IFNULL(p_new_role_name, role_name),
          role_description = IFNULL(p_role_description, role_description)
      WHERE role_name = p_role_name;
      SELECT * FROM user_role WHERE role_name = IFNULL(p_new_role_name, p_role_name);
    END;
  `);

  // Update user
  await knex.raw(`
    CREATE PROCEDURE UpdateUser(
      IN p_id CHAR(64),
      IN p_email VARCHAR(40),
      IN p_phone_number VARCHAR(13),
      IN p_password TEXT,
      IN p_user_profile TEXT,
      IN p_otp VARCHAR(6),
      IN p_is_verified BOOLEAN,
      IN p_is_active BOOLEAN,
      IN p_last_login TIMESTAMP,
      IN p_user_role_id INT,
      IN p_barangay_id INT
    )
    BEGIN
      UPDATE user
      SET email = IFNULL(p_email, email),
          phone_number = IFNULL(p_phone_number, phone_number),
          password = IFNULL(p_password, password),
          user_profile = IFNULL(p_user_profile, user_profile),
          otp = IFNULL(p_otp, otp),
          is_verified = IFNULL(p_is_verified, is_verified),
          is_active = IFNULL(p_is_active, is_active),
          last_login = IFNULL(p_last_login, last_login),
          user_role_id = IFNULL(p_user_role_id, user_role_id),
          barangay_id = IFNULL(p_barangay_id, barangay_id)
      WHERE id = p_id;
      SELECT * FROM user WHERE id = p_id;
    END;
  `);

  // Delete user
  await knex.raw(`
    CREATE PROCEDURE DeleteUser(IN p_id CHAR(64))
    BEGIN
      DELETE FROM user WHERE id = p_id;
    END;
  `);
}

async function dropUserProcedures(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllUsers;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetUserById;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetUserByUserId;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetUsersByRoleId;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertUser;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertUserRole;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllUserRoles;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetUserRoleById;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateUserRole;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateUserRoleByName;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateUser;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteUser;");
}

export { createUserProcedures, dropUserProcedures };