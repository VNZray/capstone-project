/**
 * Role Stored Procedures - Simplified RBAC
 * 
 * After RBAC simplification, we only need basic procedures:
 * - Role retrieval (system roles)
 * - Permission category retrieval
 * 
 * User-level permissions are handled by procedures in the migration file:
 * - GetUserPermissions
 * - GrantUserPermission
 * - RevokeUserPermission
 * - SetUserPermissions
 * - GetBusinessStaffWithPermissions
 * - GetOrCreateBusinessStaffRole
 */

async function createRoleProcedures(knex) {
  // ============================================================
  // ROLE RETRIEVAL PROCEDURES
  // ============================================================

  // Get all roles by type
  await knex.raw(`
    CREATE PROCEDURE GetRolesByType(IN p_role_type VARCHAR(20))
    BEGIN
      SELECT 
        ur.*,
        COALESCE(
          (SELECT COUNT(*) FROM role_permissions WHERE user_role_id = ur.id),
          0
        ) AS permission_count
      FROM user_role ur
      WHERE ur.role_type = p_role_type
      ORDER BY ur.role_name ASC;
    END;
  `);

  // Get role with full details including permissions
  await knex.raw(`
    CREATE PROCEDURE GetRoleWithPermissions(IN p_role_id INT)
    BEGIN
      -- Get role details
      SELECT * FROM user_role WHERE id = p_role_id;
      
      -- Get direct permissions (for system roles)
      SELECT 
        p.id,
        p.name,
        p.description,
        p.scope,
        pc.name AS category_name
      FROM role_permissions rp
      JOIN permissions p ON p.id = rp.permission_id
      LEFT JOIN permission_categories pc ON pc.id = p.category_id
      WHERE rp.user_role_id = p_role_id
      ORDER BY pc.sort_order, p.name;
    END;
  `);

  // ============================================================
  // PERMISSION CATEGORY PROCEDURES
  // ============================================================

  // Get all permission categories
  await knex.raw(`
    CREATE PROCEDURE GetPermissionCategories()
    BEGIN
      SELECT 
        pc.*,
        (SELECT COUNT(*) FROM permissions WHERE category_id = pc.id) AS permission_count
      FROM permission_categories pc
      ORDER BY pc.sort_order, pc.name;
    END;
  `);

  // Get permissions grouped by category
  await knex.raw(`
    CREATE PROCEDURE GetPermissionsGroupedByCategory(IN p_scope VARCHAR(20))
    BEGIN
      SELECT 
        p.id,
        p.name,
        p.description,
        p.scope,
        p.category_id,
        pc.name AS category_name,
        pc.sort_order AS category_sort
      FROM permissions p
      LEFT JOIN permission_categories pc ON pc.id = p.category_id
      WHERE p_scope IS NULL 
         OR p_scope = '' 
         OR p.scope = p_scope 
         OR p.scope = 'all'
      ORDER BY pc.sort_order, pc.name, p.name;
    END;
  `);

  // ============================================================
  // USER PERMISSION PROCEDURES (for simplified RBAC)
  // ============================================================

  // Get all permissions for a user (checks user_permissions table)
  await knex.raw(`
    CREATE PROCEDURE GetUserPermissions(IN p_user_id CHAR(36))
    BEGIN
      SELECT 
        p.id,
        p.name,
        p.description,
        p.scope,
        pc.name AS category_name
      FROM user_permissions up
      JOIN permissions p ON p.id = up.permission_id
      LEFT JOIN permission_categories pc ON pc.id = p.category_id
      WHERE up.user_id = p_user_id
      ORDER BY pc.sort_order, p.name;
    END;
  `);

  // Grant a permission to a user
  await knex.raw(`
    CREATE PROCEDURE GrantUserPermission(
      IN p_user_id CHAR(36),
      IN p_permission_id INT,
      IN p_granted_by CHAR(36)
    )
    BEGIN
      INSERT IGNORE INTO user_permissions (user_id, permission_id, granted_by)
      VALUES (p_user_id, p_permission_id, p_granted_by);
      
      SELECT ROW_COUNT() AS granted;
    END;
  `);

  // Revoke a permission from a user
  await knex.raw(`
    CREATE PROCEDURE RevokeUserPermission(
      IN p_user_id CHAR(36),
      IN p_permission_id INT
    )
    BEGIN
      DELETE FROM user_permissions
      WHERE user_id = p_user_id AND permission_id = p_permission_id;
      
      SELECT ROW_COUNT() AS revoked;
    END;
  `);

  // Set all permissions for a user (replaces existing)
  // MariaDB-compatible: uses JSON_VALUE with a loop instead of JSON_TABLE
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
      DECLARE v_inserted INT DEFAULT 0;
      
      -- Remove existing permissions
      DELETE FROM user_permissions WHERE user_id = p_user_id;
      
      -- Get the length of the JSON array
      SET v_length = JSON_LENGTH(p_permission_ids);
      
      -- Loop through the JSON array and insert each permission
      WHILE v_idx < v_length DO
        SET v_permission_id = JSON_VALUE(p_permission_ids, CONCAT('$[', v_idx, ']'));
        
        INSERT IGNORE INTO user_permissions (user_id, permission_id, granted_by)
        VALUES (p_user_id, v_permission_id, p_granted_by);
        
        SET v_inserted = v_inserted + ROW_COUNT();
        SET v_idx = v_idx + 1;
      END WHILE;
      
      SELECT v_inserted AS permissions_set;
    END;
  `);

  // Get all staff members for a business with their permissions
  // MariaDB-compatible: uses GROUP_CONCAT for JSON-like array building
  await knex.raw(`
    CREATE PROCEDURE GetBusinessStaffWithPermissions(IN p_business_id VARCHAR(255))
    BEGIN
      SELECT 
        s.id AS staff_id,
        s.user_id,
        s.title,
        u.firstname,
        u.lastname,
        u.email,
        (SELECT CONCAT('[', 
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
      ORDER BY u.firstname, u.lastname;
    END;
  `);

  console.log("Simplified RBAC procedures created.");
}

async function dropRoleProcedures(knex) {
  const procedures = [
    // Role retrieval
    "GetRolesByType",
    "GetRoleWithPermissions",
    "GetOrCreateBusinessStaffRole",
    // Permission categories
    "GetPermissionCategories",
    "GetPermissionsGroupedByCategory",
    // User permissions
    "GetUserPermissions",
    "GrantUserPermission",
    "RevokeUserPermission",
    "SetUserPermissions",
    "GetBusinessStaffWithPermissions",
    // Legacy procedures to clean up
    "GetBusinessRoles",
    "CreateSystemRole",
    "CreateCustomBusinessRole",
    "UpdateBusinessRole",
    "DeleteBusinessRole",
    "AddPermissionOverride",
    "RemovePermissionOverride",
    "GetEffectivePermissions",
    "GetUserEffectivePermissions",
    "LogRoleAction",
    "GetRoleAuditLog",
    "GetPresetRoles",
    "CreatePresetRole",
    "ClonePresetRole"
  ];

  for (const proc of procedures) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${proc};`);
  }

  console.log("Simplified RBAC procedures dropped.");
}

module.exports = {
  createRoleProcedures,
  dropRoleProcedures
};
