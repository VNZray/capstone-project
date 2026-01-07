/**
 * Migration: Add title parameter to OnboardStaff procedure
 * 
 * This migration updates the OnboardStaff stored procedure to accept
 * and store the staff title/position field.
 */

exports.up = async function (knex) {
  // Drop existing procedure
  await knex.raw("DROP PROCEDURE IF EXISTS OnboardStaff;");

  // Recreate with title parameter
  await knex.raw(`
    CREATE PROCEDURE OnboardStaff(
      IN p_user_id CHAR(64),
      IN p_staff_id CHAR(64),
      IN p_email VARCHAR(40),
      IN p_phone_number VARCHAR(13),
      IN p_password TEXT,
      IN p_first_name VARCHAR(255),
      IN p_last_name VARCHAR(255),
      IN p_business_id CHAR(64),
      IN p_role_id INT,
      IN p_title VARCHAR(50)
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
        TRUE,   -- is_verified: instantly verified
        TRUE,   -- is_active: instantly active
        NULL,
        p_role_id, -- Use the business role as user_role_id
        NULL,   -- barangay_id not needed for staff
        TRUE,   -- must_change_password
        FALSE   -- profile_completed
      );
      
      -- Create staff record with title
      INSERT INTO staff (id, first_name, middle_name, last_name, title, user_id, business_id)
      VALUES (p_staff_id, p_first_name, NULL, p_last_name, COALESCE(p_title, 'Staff'), p_user_id, p_business_id);
      
      COMMIT;
      
      -- Return the created staff with user info
      SELECT 
        s.id,
        s.first_name,
        s.last_name,
        s.title,
        s.user_id,
        s.business_id,
        s.created_at,
        u.email,
        u.phone_number,
        u.is_active,
        u.is_verified,
        u.must_change_password,
        u.profile_completed,
        ur.role_name
      FROM staff s
      LEFT JOIN user u ON s.user_id = u.id
      LEFT JOIN user_role ur ON u.user_role_id = ur.id
      WHERE s.id = p_staff_id;
    END;
  `);

  console.log("Updated OnboardStaff procedure to include title parameter.");
};

exports.down = async function (knex) {
  // Revert to previous version without title
  await knex.raw("DROP PROCEDURE IF EXISTS OnboardStaff;");

  await knex.raw(`
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
        TRUE,
        TRUE,
        NULL,
        p_role_id,
        NULL,
        TRUE,
        FALSE
      );
      
      -- Create staff record
      INSERT INTO staff (id, first_name, middle_name, last_name, user_id, business_id)
      VALUES (p_staff_id, p_first_name, NULL, p_last_name, p_user_id, p_business_id);
      
      COMMIT;
      
      -- Return the created staff with user info
      SELECT 
        s.id,
        s.first_name,
        s.last_name,
        s.user_id,
        s.business_id,
        s.created_at,
        u.email,
        u.phone_number,
        u.is_active,
        u.is_verified,
        u.must_change_password,
        u.profile_completed,
        ur.role_name
      FROM staff s
      LEFT JOIN user u ON s.user_id = u.id
      LEFT JOIN user_role ur ON u.user_role_id = ur.id
      WHERE s.id = p_staff_id;
    END;
  `);

  console.log("Reverted OnboardStaff procedure to version without title.");
};
