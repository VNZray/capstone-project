/**
 * Staff Stored Procedures
 * Extracted from 20250926000001-staff-table.cjs migration
 */

/**
 * Create all staff-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createStaffProcedures(sequelize) {
  // InsertStaff - Create a new staff record
  await sequelize.query(`
    CREATE PROCEDURE InsertStaff(
      IN p_id CHAR(64),
      IN p_first_name VARCHAR(255),
      IN p_middle_name VARCHAR(255),
      IN p_last_name VARCHAR(255),
      IN p_user_id CHAR(64),
      IN p_business_id CHAR(64)
    )
    BEGIN
      INSERT INTO staff (id, first_name, middle_name, last_name, user_id, business_id)
      VALUES (p_id, p_first_name, p_middle_name, p_last_name, p_user_id, p_business_id);
      SELECT * FROM staff WHERE id = p_id;
    END;
  `);

  // GetStaffById - Retrieve staff with user and business info
  await sequelize.query(`
    CREATE PROCEDURE GetStaffById(IN p_id CHAR(64))
    BEGIN
      SELECT s.*, u.email, u.phone_number, b.business_name
      FROM staff s
      LEFT JOIN user u ON s.user_id = u.id
      LEFT JOIN business b ON s.business_id = b.id
      WHERE s.id = p_id;
    END;
  `);

  // GetStaffByUserId - Retrieve staff by user ID
  await sequelize.query(`
    CREATE PROCEDURE GetStaffByUserId(IN p_user_id CHAR(64))
    BEGIN
      SELECT s.*, u.email, u.phone_number, b.business_name
      FROM staff s
      LEFT JOIN user u ON s.user_id = u.id
      LEFT JOIN business b ON s.business_id = b.id
      WHERE s.user_id = p_user_id;
    END;
  `);

  // GetStaffByBusinessId - Retrieve all staff for a business
  await sequelize.query(`
    CREATE PROCEDURE GetStaffByBusinessId(IN p_business_id CHAR(64))
    BEGIN
      SELECT s.*, u.email, u.phone_number, ur.role_name
      FROM staff s
      LEFT JOIN user u ON s.user_id = u.id
      LEFT JOIN user_role ur ON u.user_role_id = ur.id
      WHERE s.business_id = p_business_id
      ORDER BY s.first_name ASC;
    END;
  `);

  // UpdateStaff - Update staff name fields
  await sequelize.query(`
    CREATE PROCEDURE UpdateStaff(
      IN p_id CHAR(64),
      IN p_first_name VARCHAR(255),
      IN p_middle_name VARCHAR(255),
      IN p_last_name VARCHAR(255)
    )
    BEGIN
      UPDATE staff SET
        first_name = IFNULL(p_first_name, first_name),
        middle_name = p_middle_name,
        last_name = IFNULL(p_last_name, last_name),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = p_id;
      SELECT * FROM staff WHERE id = p_id;
    END;
  `);

  // DeleteStaff - Remove a staff record
  await sequelize.query(`
    CREATE PROCEDURE DeleteStaff(IN p_id CHAR(64))
    BEGIN
      DELETE FROM staff WHERE id = p_id;
    END;
  `);

  // OnboardStaff - Complete staff onboarding with user account creation
  await sequelize.query(`
    CREATE PROCEDURE OnboardStaff(
      IN p_user_id CHAR(64),
      IN p_staff_id CHAR(64),
      IN p_email VARCHAR(40),
      IN p_phone_number VARCHAR(13),
      IN p_password TEXT,
      IN p_first_name VARCHAR(255),
      IN p_last_name VARCHAR(255),
      IN p_business_id CHAR(64),
      IN p_role_id INT
    )
    BEGIN
      DECLARE EXIT HANDLER FOR SQLEXCEPTION
      BEGIN
        ROLLBACK;
        RESIGNAL;
      END;

      START TRANSACTION;

      -- Create user account (instantly active and verified)
      INSERT INTO user (
        id, email, phone_number, password, user_profile, otp,
        is_verified, is_active, last_login, user_role_id, barangay_id,
        must_change_password, profile_completed
      ) VALUES (
        p_user_id, p_email, p_phone_number, p_password, NULL, NULL,
        TRUE, TRUE, NULL, p_role_id, NULL, TRUE, FALSE
      );

      -- Create staff record
      INSERT INTO staff (id, first_name, middle_name, last_name, user_id, business_id)
      VALUES (p_staff_id, p_first_name, NULL, p_last_name, p_user_id, p_business_id);

      COMMIT;

      -- Return the created staff with user info
      SELECT
        s.id, s.first_name, s.last_name, s.user_id, s.business_id, s.created_at,
        u.email, u.phone_number, u.is_active, u.is_verified,
        u.must_change_password, u.profile_completed, ur.role_name
      FROM staff s
      LEFT JOIN user u ON s.user_id = u.id
      LEFT JOIN user_role ur ON u.user_role_id = ur.id
      WHERE s.id = p_staff_id;
    END;
  `);

  console.log('Staff procedures created.');
}

/**
 * Drop all staff-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropStaffProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertStaff;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetStaffById;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetStaffByUserId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetStaffByBusinessId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS UpdateStaff;');
  await sequelize.query('DROP PROCEDURE IF EXISTS DeleteStaff;');
  await sequelize.query('DROP PROCEDURE IF EXISTS OnboardStaff;');

  console.log('Staff procedures dropped.');
}
