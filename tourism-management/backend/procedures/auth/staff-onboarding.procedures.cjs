/**
 * Staff Onboarding Stored Procedures
 *
 * Procedures for staff onboarding flow:
 * - InsertStaffUser: Creates a user account for staff (instantly active and verified)
 * - OnboardStaff: Complete staff onboarding (creates user + staff in one transaction)
 * - CompletePasswordChange: Changes password and clears must_change_password flag
 * - CompleteStaffProfile: Marks profile as completed
 * - GetUserByEmail: Enhanced to include onboarding flags
 * - GetStaffByBusinessId: Enhanced to include user info and role
 */

async function createProcedures(knex) {
  // InsertStaffUser: Creates a user account for staff - instantly active and verified
  await knex.raw(`
    CREATE PROCEDURE InsertStaffUser(
      IN p_id CHAR(64),
      IN p_email VARCHAR(40),
      IN p_phone_number VARCHAR(13),
      IN p_password TEXT,
      IN p_user_role_id INT,
      IN p_barangay_id INT,
      IN p_invitation_token VARCHAR(64),
      IN p_invitation_expires_at TIMESTAMP
    )
    BEGIN
      INSERT INTO user (
        id, email, phone_number, password, user_profile, otp,
        is_verified, is_active, last_login, user_role_id, barangay_id,
        must_change_password, profile_completed, invitation_token, invitation_expires_at
      ) VALUES (
        p_id, p_email, p_phone_number, p_password, NULL, NULL,
        TRUE,   -- is_verified: instantly verified
        TRUE,   -- is_active: instantly active
        NULL, p_user_role_id, p_barangay_id,
        TRUE,   -- must_change_password: force change on first login
        FALSE,  -- profile_completed: require profile completion
        p_invitation_token, p_invitation_expires_at
      );
      SELECT * FROM user WHERE id = p_id;
    END;
  `);

  // OnboardStaff: Complete staff onboarding (creates user + staff in one transaction)
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

  // CompletePasswordChange: Changes password and clears must_change_password flag
  await knex.raw(`
    CREATE PROCEDURE CompletePasswordChange(
      IN p_user_id CHAR(64),
      IN p_new_password TEXT
    )
    BEGIN
      UPDATE user
      SET password = p_new_password,
          must_change_password = FALSE
      WHERE id = p_user_id;

      SELECT id, email, must_change_password, profile_completed
      FROM user WHERE id = p_user_id;
    END;
  `);

  // CompleteStaffProfile: Marks profile as completed
  await knex.raw(`
    CREATE PROCEDURE CompleteStaffProfile(
      IN p_user_id CHAR(64)
    )
    BEGIN
      UPDATE user
      SET profile_completed = TRUE,
          invitation_token = NULL,
          invitation_expires_at = NULL
      WHERE id = p_user_id;

      SELECT id, email, must_change_password, profile_completed
      FROM user WHERE id = p_user_id;
    END;
  `);

  // GetUserByEmail: Enhanced to include onboarding flags
  await knex.raw(`
    CREATE PROCEDURE GetUserByEmail(IN p_email VARCHAR(40))
    BEGIN
      SELECT
        u.*,
        ur.role_name
      FROM user u
      LEFT JOIN user_role ur ON u.user_role_id = ur.id
      WHERE u.email = p_email;
    END;
  `);

  // GetStaffByBusinessId: Enhanced to include user info and role
  await knex.raw(`
    CREATE PROCEDURE GetStaffByBusinessId(IN p_business_id CHAR(64))
    BEGIN
      SELECT
        s.id,
        s.first_name,
        s.middle_name,
        s.last_name,
        s.title,
        s.user_id,
        s.business_id,
        s.created_at,
        s.updated_at,
        u.email,
        u.phone_number,
        u.password,
        u.user_profile,
        u.is_active,
        u.is_verified,
        u.must_change_password,
        u.profile_completed,
        ur.role_name AS role,
        ur.role_type,
        ur.role_description
      FROM staff s
      LEFT JOIN user u ON s.user_id = u.id
      LEFT JOIN user_role ur ON u.user_role_id = ur.id
      WHERE s.business_id = p_business_id;
    END;
  `);
}

async function dropProcedures(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS InsertStaffUser;");
  await knex.raw("DROP PROCEDURE IF EXISTS AcceptStaffInvitation;");
  await knex.raw("DROP PROCEDURE IF EXISTS CompletePasswordChange;");
  await knex.raw("DROP PROCEDURE IF EXISTS CompleteStaffProfile;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetUserByEmail;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetStaffByBusinessId;");
  await knex.raw("DROP PROCEDURE IF EXISTS OnboardStaff;");
}


module.exports = { createProcedures, dropProcedures };
