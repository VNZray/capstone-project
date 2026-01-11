/**
 * Role Stored Procedures - Simplified RBAC
 * 
 * After RBAC simplification, this file contains only role retrieval procedures.
 * 
 * User-level permission procedures are now in user.procedures.cjs:
 * - GetUserPermissions
 * - GrantUserPermission
 * - RevokeUserPermission
 * - SetUserPermissions
 * - GetBusinessStaffWithPermissions
 * 
 * NOTE: This file is currently NOT used by any migration.
 * All RBAC procedures are now in user.procedures.cjs.
 * This file is kept for reference or future use.
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

  console.log("Role retrieval and permission category procedures created.");
}

async function dropRoleProcedures(knex) {
  const procedures = [
    // Role retrieval
    "GetRolesByType",
    "GetRoleWithPermissions",
    // Permission categories
    "GetPermissionCategories",
    "GetPermissionsGroupedByCategory",
    // Legacy procedures to clean up (kept for backward compatibility during drops)
    "GetOrCreateBusinessStaffRole",
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

  console.log("Role procedures dropped.");
}

module.exports = {
  createRoleProcedures,
  dropRoleProcedures
};
