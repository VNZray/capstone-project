/**
 * Staff Onboarding Enhancement Migration
 * 
 * Adds columns and procedures required for proper staff onboarding flow:
 * - must_change_password: forces password change on first login
 * - profile_completed: requires profile completion after password change
 * - invitation_token: for email verification (optional)
 * - invitation_expires_at: token expiration
 * 
 * Staff are instantly active and verified for simplified onboarding.
 */

exports.up = async function (knex) {
  // 1. Add onboarding columns to user table
  const hasColumns = await knex.schema.hasColumn("user", "must_change_password");
  
  if (!hasColumns) {
    await knex.schema.alterTable("user", (table) => {
      // Flag to force password change on first login
      table.boolean("must_change_password").defaultTo(false);
      
      // Flag to indicate profile setup completion
      table.boolean("profile_completed").defaultTo(true); // true for existing users
      
      // Invitation token for staff email verification (optional)
      table.string("invitation_token", 64).nullable();
      
      // Token expiration
      table.timestamp("invitation_expires_at").nullable();
      
      // Index for token lookups
      table.index(["invitation_token"], "idx_user_invitation_token");
    });
    
    console.log("Added onboarding columns to user table.");
  }

  // 2. Add timestamps to staff table if not present
  const hasCreatedAt = await knex.schema.hasColumn("staff", "created_at");
  
  if (!hasCreatedAt) {
    await knex.schema.alterTable("staff", (table) => {
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
    
    console.log("Added timestamps to staff table.");
  }

  // 3. Drop and recreate stored procedures for staff onboarding

  // Drop existing procedures first
  await knex.raw("DROP PROCEDURE IF EXISTS InsertStaffUser;");
  await knex.raw("DROP PROCEDURE IF EXISTS AcceptStaffInvitation;");
  await knex.raw("DROP PROCEDURE IF EXISTS CompletePasswordChange;");
  await knex.raw("DROP PROCEDURE IF EXISTS CompleteStaffProfile;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetUserByEmail;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetStaffByBusinessId;");
  await knex.raw("DROP PROCEDURE IF EXISTS OnboardStaff;");

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
  // Staff is instantly active and verified for simplified onboarding
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
        TRUE,   -- is_verified: instantly verified
        TRUE,   -- is_active: instantly active
        NULL,
        p_role_id, -- Use the business role as user_role_id
        NULL,   -- barangay_id not needed for staff
        TRUE,   -- must_change_password
        FALSE   -- profile_completed
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

  console.log("Staff onboarding enhancement migration completed.");
};

exports.down = async function (knex) {
  // Drop new procedures
  await knex.raw("DROP PROCEDURE IF EXISTS OnboardStaff;");
  await knex.raw("DROP PROCEDURE IF EXISTS CompletePasswordChange;");
  await knex.raw("DROP PROCEDURE IF EXISTS CompleteStaffProfile;");

  // Recreate original procedures
  await knex.raw("DROP PROCEDURE IF EXISTS InsertStaffUser;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetUserByEmail;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetStaffByBusinessId;");

  // Original GetUserByEmail
  await knex.raw(`
    CREATE PROCEDURE GetUserByEmail(IN p_email VARCHAR(40))
    BEGIN
      SELECT * FROM user WHERE email = p_email;
    END;
  `);

  // Original GetStaffByBusinessId
  await knex.raw(`
    CREATE PROCEDURE GetStaffByBusinessId(IN p_business_id CHAR(64))
    BEGIN
      SELECT 
        s.id,
        s.first_name,
        s.middle_name,
        s.last_name,
        s.user_id,
        s.business_id,
        u.email,
        u.phone_number,
        u.password,
        u.user_profile,
        u.is_active,
        ur.role_name AS role
      FROM staff s
      LEFT JOIN user u ON s.user_id = u.id
      LEFT JOIN user_role ur ON u.user_role_id = ur.id
      WHERE s.business_id = p_business_id;
    END;
  `);

  // Remove timestamps from staff table
  const hasCreatedAt = await knex.schema.hasColumn("staff", "created_at");
  if (hasCreatedAt) {
    await knex.schema.alterTable("staff", (table) => {
      table.dropColumn("created_at");
      table.dropColumn("updated_at");
    });
  }

  // Remove columns from user table
  const hasColumns = await knex.schema.hasColumn("user", "must_change_password");
  if (hasColumns) {
    await knex.schema.alterTable("user", (table) => {
      table.dropIndex(["invitation_token"], "idx_user_invitation_token");
      table.dropColumn("must_change_password");
      table.dropColumn("profile_completed");
      table.dropColumn("invitation_token");
      table.dropColumn("invitation_expires_at");
    });
  }
};
