/**
 * User Stored Procedures
 * Handles user and authentication operations
 */

/**
 * Create user-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createUserProcedures(sequelize) {
  await sequelize.query(`
    CREATE PROCEDURE InsertUser(
      IN p_id CHAR(64),
      IN p_email VARCHAR(40),
      IN p_phone_number VARCHAR(13),
      IN p_password TEXT,
      IN p_user_profile TEXT,
      IN p_otp VARCHAR(6),
      IN p_is_verified BOOLEAN,
      IN p_is_active BOOLEAN,
      IN p_user_role_id INT,
      IN p_barangay_id INT
    )
    BEGIN
      INSERT INTO user (id, email, phone_number, password, user_profile, otp, is_verified, is_active, user_role_id, barangay_id)
      VALUES (p_id, p_email, p_phone_number, p_password, p_user_profile, p_otp, p_is_verified, p_is_active, p_user_role_id, p_barangay_id);
      SELECT * FROM user WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetUserById(IN p_id CHAR(64))
    BEGIN
      SELECT u.*, ur.role_name, ur.role_description
      FROM user u
      LEFT JOIN user_role ur ON u.user_role_id = ur.id
      WHERE u.id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetUserByEmail(IN p_email VARCHAR(40))
    BEGIN
      SELECT u.*, ur.role_name, ur.role_description
      FROM user u
      LEFT JOIN user_role ur ON u.user_role_id = ur.id
      WHERE u.email = p_email;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetUserByPhoneNumber(IN p_phone_number VARCHAR(13))
    BEGIN
      SELECT u.*, ur.role_name, ur.role_description
      FROM user u
      LEFT JOIN user_role ur ON u.user_role_id = ur.id
      WHERE u.phone_number = p_phone_number;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateUser(
      IN p_id CHAR(64),
      IN p_email VARCHAR(40),
      IN p_phone_number VARCHAR(13),
      IN p_password TEXT,
      IN p_user_profile TEXT,
      IN p_otp VARCHAR(6),
      IN p_is_verified BOOLEAN,
      IN p_is_active BOOLEAN,
      IN p_user_role_id INT,
      IN p_barangay_id INT
    )
    BEGIN
      UPDATE user SET
        email = IFNULL(p_email, email),
        phone_number = IFNULL(p_phone_number, phone_number),
        password = IFNULL(p_password, password),
        user_profile = IFNULL(p_user_profile, user_profile),
        otp = p_otp,
        is_verified = IFNULL(p_is_verified, is_verified),
        is_active = IFNULL(p_is_active, is_active),
        user_role_id = IFNULL(p_user_role_id, user_role_id),
        barangay_id = IFNULL(p_barangay_id, barangay_id)
      WHERE id = p_id;
      SELECT * FROM user WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeleteUser(IN p_id CHAR(64))
    BEGIN
      DELETE FROM user WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetAllUsers()
    BEGIN
      SELECT u.*, ur.role_name, ur.role_description
      FROM user u
      LEFT JOIN user_role ur ON u.user_role_id = ur.id
      ORDER BY u.created_at DESC;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateUserLastLogin(IN p_id CHAR(64))
    BEGIN
      UPDATE user SET last_login = CURRENT_TIMESTAMP WHERE id = p_id;
      SELECT * FROM user WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE VerifyUser(IN p_id CHAR(64))
    BEGIN
      UPDATE user SET is_verified = TRUE, is_active = TRUE, otp = NULL WHERE id = p_id;
      SELECT * FROM user WHERE id = p_id;
    END;
  `);
}

/**
 * Drop user-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropUserProcedures(sequelize) {
  const procedures = [
    'InsertUser',
    'GetUserById',
    'GetUserByEmail',
    'GetUserByPhoneNumber',
    'UpdateUser',
    'DeleteUser',
    'GetAllUsers',
    'UpdateUserLastLogin',
    'VerifyUser'
  ];

  for (const proc of procedures) {
    await sequelize.query(`DROP PROCEDURE IF EXISTS ${proc};`);
  }
}
