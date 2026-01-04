/**
 * RBAC Simplification Migration
 * 
 * This migration simplifies the RBAC system to a user-level permission model:
 * 
 * BEFORE:
 * - Three-tier roles (system, preset, business) with inheritance
 * - role_permissions for role-level permissions
 * - role_permission_overrides for inheritance overrides
 * 
 * AFTER:
 * - Two-tier roles: system (Admin, Tourist, etc.) and business (Staff)
 * - user_permissions for per-user permissions (staff get individual permissions)
 * - System roles still use role_permissions
 * - Staff title is just a display field
 * 
 * @see docs/RBAC_SIMPLIFICATION.md for full documentation
 */

exports.up = async function (knex) {
  console.log("[RBAC Simplification] Starting migration...");

  // ============================================================
  // 1. Create user_permissions table for per-user permissions
  // ============================================================
  await knex.schema.createTable("user_permissions", (table) => {
    table.increments("id").primary();
    
    table.uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("user")
      .onDelete("CASCADE");
    
    table.integer("permission_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("permissions")
      .onDelete("CASCADE");
    
    // Who granted this permission (business owner or admin)
    table.uuid("granted_by").nullable();
    
    table.timestamp("created_at").defaultTo(knex.fn.now());
    
    // Unique constraint: one permission per user
    table.unique(["user_id", "permission_id"], "uq_user_permission");
    
    // Indexes for fast lookups
    table.index(["user_id"], "idx_user_permissions_user");
  });

  console.log("[RBAC Simplification] Created user_permissions table.");

  // ============================================================
  // 2. Add title column to staff table (display-only field)
  // ============================================================
  const hasTitleColumn = await knex.schema.hasColumn("staff", "title");
  if (!hasTitleColumn) {
    await knex.schema.alterTable("staff", (table) => {
      table.string("title", 50).nullable().defaultTo("Staff");
    });
    console.log("[RBAC Simplification] Added title column to staff table.");
  }

  // ============================================================
  // 3. Drop role_permission_overrides table (no longer needed)
  // ============================================================
  const hasOverridesTable = await knex.schema.hasTable("role_permission_overrides");
  if (hasOverridesTable) {
    await knex.schema.dropTable("role_permission_overrides");
    console.log("[RBAC Simplification] Dropped role_permission_overrides table.");
  }

  // ============================================================
  // 4. Clean up user_role table - remove inheritance columns
  // ============================================================
  const hasBasedOnRoleId = await knex.schema.hasColumn("user_role", "based_on_role_id");
  if (hasBasedOnRoleId) {
    await knex.schema.alterTable("user_role", (table) => {
      table.dropForeign(["based_on_role_id"]);
      table.dropColumn("based_on_role_id");
    });
    console.log("[RBAC Simplification] Removed based_on_role_id column.");
  }

  const hasIsCustom = await knex.schema.hasColumn("user_role", "is_custom");
  if (hasIsCustom) {
    await knex.schema.alterTable("user_role", (table) => {
      table.dropColumn("is_custom");
    });
    console.log("[RBAC Simplification] Removed is_custom column.");
  }

  // ============================================================
  // 5. Create simplified stored procedures
  // ============================================================
  
  // Drop old complex procedures
  await knex.raw("DROP PROCEDURE IF EXISTS GetUserEffectivePermissions");
  await knex.raw("DROP PROCEDURE IF EXISTS GetEffectivePermissions");
  await knex.raw("DROP PROCEDURE IF EXISTS AddPermissionOverride");
  await knex.raw("DROP PROCEDURE IF EXISTS RemovePermissionOverride");
  await knex.raw("DROP PROCEDURE IF EXISTS ClonePresetRole");

  // Create new simplified GetUserPermissions procedure
  await knex.raw(`
    CREATE PROCEDURE GetUserPermissions(IN p_user_id CHAR(36))
    BEGIN
      DECLARE v_role_type VARCHAR(20);
      DECLARE v_role_id INT;
      
      -- Get user's role info
      SELECT ur.role_type, ur.id 
      INTO v_role_type, v_role_id
      FROM user u
      JOIN user_role ur ON ur.id = u.user_role_id
      WHERE u.id = p_user_id;
      
      IF v_role_type = 'system' THEN
        -- System roles: get permissions from role_permissions
        SELECT p.id, p.name, p.description, p.scope
        FROM role_permissions rp
        JOIN permissions p ON p.id = rp.permission_id
        WHERE rp.user_role_id = v_role_id;
      ELSE
        -- Business roles (Staff): get permissions from user_permissions
        SELECT p.id, p.name, p.description, p.scope
        FROM user_permissions up
        JOIN permissions p ON p.id = up.permission_id
        WHERE up.user_id = p_user_id;
      END IF;
    END
  `);

  // Create procedure to grant permission to user
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

  // Create procedure to revoke permission from user
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

  // Create procedure to set multiple permissions at once (bulk update)
  await knex.raw(`
    CREATE PROCEDURE SetUserPermissions(
      IN p_user_id CHAR(36),
      IN p_permission_ids JSON,
      IN p_granted_by CHAR(36)
    )
    BEGIN
      -- Delete all existing permissions for user
      DELETE FROM user_permissions WHERE user_id = p_user_id;
      
      -- Insert new permissions from JSON array
      INSERT INTO user_permissions (user_id, permission_id, granted_by)
      SELECT p_user_id, perm_id.value, p_granted_by
      FROM JSON_TABLE(p_permission_ids, '$[*]' COLUMNS (value INT PATH '$')) AS perm_id;
      
      -- Return the updated permissions
      SELECT up.*, p.name AS permission_name
      FROM user_permissions up
      JOIN permissions p ON p.id = up.permission_id
      WHERE up.user_id = p_user_id;
    END
  `);

  // Create procedure to get staff with their permissions for a business
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
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT('id', p.id, 'name', p.name)
          )
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

  // Create or replace the staff role creation procedure
  await knex.raw(`
    CREATE PROCEDURE GetOrCreateBusinessStaffRole(IN p_business_id VARCHAR(255))
    BEGIN
      DECLARE v_role_id INT;
      
      -- Check if Staff role exists for this business
      SELECT id INTO v_role_id
      FROM user_role
      WHERE role_for = p_business_id AND role_type = 'business'
      LIMIT 1;
      
      IF v_role_id IS NULL THEN
        -- Create new Staff role for this business
        INSERT INTO user_role (role_name, role_description, role_for, role_type, is_immutable)
        VALUES ('Staff', 'Staff member of this business', p_business_id, 'business', FALSE);
        
        SET v_role_id = LAST_INSERT_ID();
      END IF;
      
      SELECT * FROM user_role WHERE id = v_role_id;
    END
  `);

  console.log("[RBAC Simplification] Created simplified stored procedures.");
  console.log("[RBAC Simplification] Migration complete!");
};

exports.down = async function (knex) {
  console.log("[RBAC Simplification] Rolling back...");

  // Drop new procedures
  await knex.raw("DROP PROCEDURE IF EXISTS GetUserPermissions");
  await knex.raw("DROP PROCEDURE IF EXISTS GrantUserPermission");
  await knex.raw("DROP PROCEDURE IF EXISTS RevokeUserPermission");
  await knex.raw("DROP PROCEDURE IF EXISTS SetUserPermissions");
  await knex.raw("DROP PROCEDURE IF EXISTS GetBusinessStaffWithPermissions");
  await knex.raw("DROP PROCEDURE IF EXISTS GetOrCreateBusinessStaffRole");

  // Drop user_permissions table
  await knex.schema.dropTableIfExists("user_permissions");

  // Remove title column from staff
  const hasTitleColumn = await knex.schema.hasColumn("staff", "title");
  if (hasTitleColumn) {
    await knex.schema.alterTable("staff", (table) => {
      table.dropColumn("title");
    });
  }

  // Note: We don't restore the old complex RBAC tables/columns
  // as they would need the old procedures too. A full restore would
  // require re-running the original RBAC enhancement migration.

  console.log("[RBAC Simplification] Rollback complete.");
};
