/**
 * RBAC Simplification Stored Procedures
 *
 * Simplified RBAC procedures for user-level permission model:
 * - GetUserPermissions: Get permissions for a user (staff get per-user, others get role-based)
 * - GrantUserPermission: Grant a single permission to a user
 * - RevokeUserPermission: Revoke a single permission from a user
 * - SetUserPermissions: Bulk set permissions for a user (replaces all existing)
 * - GetBusinessStaffWithPermissions: Get staff for a business with their permissions
 */

async function createProcedures(knex) {
  // GetUserPermissions - Get permissions based on user role type
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
        SET v_permission_id = JSON_VALUE(p_permission_ids, CONCAT('$[', v_idx, ']'));

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

async function dropProcedures(knex) {
  // Drop old complex procedures
  await knex.raw("DROP PROCEDURE IF EXISTS GetUserEffectivePermissions");
  await knex.raw("DROP PROCEDURE IF EXISTS GetEffectivePermissions");
  await knex.raw("DROP PROCEDURE IF EXISTS AddPermissionOverride");
  await knex.raw("DROP PROCEDURE IF EXISTS RemovePermissionOverride");
  await knex.raw("DROP PROCEDURE IF EXISTS ClonePresetRole");

  // Drop simplified procedures
  await knex.raw("DROP PROCEDURE IF EXISTS GetUserPermissions");
  await knex.raw("DROP PROCEDURE IF EXISTS GrantUserPermission");
  await knex.raw("DROP PROCEDURE IF EXISTS RevokeUserPermission");
  await knex.raw("DROP PROCEDURE IF EXISTS SetUserPermissions");
  await knex.raw("DROP PROCEDURE IF EXISTS GetBusinessStaffWithPermissions");
  await knex.raw("DROP PROCEDURE IF EXISTS GetOrCreateBusinessStaffRole");
}

module.exports = { createProcedures, dropProcedures };
