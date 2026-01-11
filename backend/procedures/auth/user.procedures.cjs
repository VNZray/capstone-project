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

  // ============================================================
  // USER PERMISSION PROCEDURES (Simplified RBAC)
  // ============================================================

  // GetUserPermissions - Get permissions based on user role type
  // Staff get per-user permissions, other roles get role-based permissions
  await knex.raw(`
    CREATE PROCEDURE GetUserPermissions(IN p_user_id CHAR(36))
    BEGIN
      DECLARE v_role_name VARCHAR(50);
      DECLARE v_role_id INT;

      -- Get user's role info
      SELECT ur.role_name, ur.id
      INTO v_role_name, v_role_id
      FROM user u
      JOIN user_role ur ON ur.id = u.user_role_id
      WHERE u.id = p_user_id;

      IF v_role_name = 'Staff' THEN
        -- Staff: get permissions from user_permissions (per-user)
        SELECT p.id, p.name, p.description, p.scope
        FROM user_permissions up
        JOIN permissions p ON p.id = up.permission_id
        WHERE up.user_id = p_user_id;
      ELSE
        -- System roles: get permissions from role_permissions
        SELECT p.id, p.name, p.description, p.scope
        FROM role_permissions rp
        JOIN permissions p ON p.id = rp.permission_id
        WHERE rp.user_role_id = v_role_id;
      END IF;
    END
  `);

  // GrantUserPermission - Grant permission to user
  await knex.raw(`
    CREATE PROCEDURE GrantUserPermission(
      IN p_user_id CHAR(36),
      IN p_permission_id INT,
      IN p_granted_by CHAR(36)
    )
    BEGIN
      INSERT INTO user_permissions (user_id, permission_id, granted_by)
      VALUES (p_user_id, p_permission_id, p_granted_by)
      ON DUPLICATE KEY UPDATE granted_by = p_granted_by;

      SELECT up.*, p.name AS permission_name
      FROM user_permissions up
      JOIN permissions p ON p.id = up.permission_id
      WHERE up.user_id = p_user_id AND up.permission_id = p_permission_id;
    END
  `);

  // RevokeUserPermission - Revoke permission from user
  await knex.raw(`
    CREATE PROCEDURE RevokeUserPermission(
      IN p_user_id CHAR(36),
      IN p_permission_id INT
    )
    BEGIN
      DELETE FROM user_permissions
      WHERE user_id = p_user_id AND permission_id = p_permission_id;

      SELECT ROW_COUNT() AS revoked_count;
    END
  `);

  // SetUserPermissions - Bulk set permissions for user (MariaDB-compatible)
  await knex.raw(`
    CREATE PROCEDURE SetUserPermissions(
      IN p_user_id CHAR(36),
      IN p_permission_ids JSON,
      IN p_granted_by CHAR(36)
    )
    BEGIN
      DECLARE v_idx INT DEFAULT 0;
      DECLARE v_length INT;
      DECLARE v_permission_id INT;

      -- Delete all existing permissions for user
      DELETE FROM user_permissions WHERE user_id = p_user_id;

      -- Get the length of the JSON array
      SET v_length = JSON_LENGTH(p_permission_ids);

      -- Loop through the JSON array and insert each permission
      WHILE v_idx < v_length DO
        SET v_permission_id = JSON_UNQUOTE(JSON_EXTRACT(p_permission_ids, CONCAT('$[', v_idx, ']')));

        INSERT IGNORE INTO user_permissions (user_id, permission_id, granted_by)
        VALUES (p_user_id, v_permission_id, p_granted_by);

        SET v_idx = v_idx + 1;
      END WHILE;

      -- Return the updated permissions
      SELECT up.*, p.name AS permission_name
      FROM user_permissions up
      JOIN permissions p ON p.id = up.permission_id
      WHERE up.user_id = p_user_id;
    END
  `);

  // GetBusinessStaffWithPermissions - Get staff with their permissions (MariaDB-compatible)
  await knex.raw(`
    CREATE PROCEDURE GetBusinessStaffWithPermissions(IN p_business_id VARCHAR(255))
    BEGIN
      SELECT
        s.id AS staff_id,
        s.user_id,
        s.first_name,
        s.middle_name,
        s.last_name,
        s.title,
        s.created_at,
        u.email,
        u.phone_number,
        u.is_active,
        (
          SELECT CONCAT('[',
            COALESCE(GROUP_CONCAT(
              JSON_OBJECT('id', p.id, 'name', p.name)
              SEPARATOR ','
            ), ''),
          ']')
          FROM user_permissions up
          JOIN permissions p ON p.id = up.permission_id
          WHERE up.user_id = s.user_id
        ) AS permissions
      FROM staff s
      JOIN user u ON u.id = s.user_id
      WHERE s.business_id = p_business_id
      ORDER BY s.created_at DESC;
    END
  `);
}

async function dropUserProcedures(knex) {
  // Basic user procedures
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

  // User permission procedures (RBAC)
  await knex.raw("DROP PROCEDURE IF EXISTS GetUserPermissions;");
  await knex.raw("DROP PROCEDURE IF EXISTS GrantUserPermission;");
  await knex.raw("DROP PROCEDURE IF EXISTS RevokeUserPermission;");
  await knex.raw("DROP PROCEDURE IF EXISTS SetUserPermissions;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetBusinessStaffWithPermissions;");

  // Legacy RBAC procedures (cleanup)
  await knex.raw("DROP PROCEDURE IF EXISTS GetUserEffectivePermissions;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetEffectivePermissions;");
  await knex.raw("DROP PROCEDURE IF EXISTS AddPermissionOverride;");
  await knex.raw("DROP PROCEDURE IF EXISTS RemovePermissionOverride;");
  await knex.raw("DROP PROCEDURE IF EXISTS ClonePresetRole;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetOrCreateBusinessStaffRole;");
}

module.exports = { createUserProcedures, dropUserProcedures };