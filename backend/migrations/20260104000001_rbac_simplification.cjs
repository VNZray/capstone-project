/**
 * RBAC Simplification Migration
 * 
 * This migration simplifies the RBAC system to a user-level permission model:
 * 
 * BEFORE:
 * - Three-tier roles (system, preset, business) with inheritance
 * - Per-business Staff roles with role_for column
 * - role_permissions for role-level permissions
 * - role_permission_overrides for inheritance overrides
 * 
 * AFTER:
 * - Simple system roles only: Admin, Tourism Officer, Business Owner, Tourist, Staff
 * - One "Staff" role for ALL staff (business access via staff.business_id)
 * - user_permissions for per-user permissions (staff get individual permissions)
 * - No role_for column - business access determined by staff table join
 * - Staff title is just a display field
 * 
 * @see docs/RBAC_SIMPLIFICATION.md for full documentation
 */

exports.up = async function (knex) {
  console.log("[RBAC Simplification] Starting migration...");

  // ============================================================
  // 1. Create user_permissions table for per-user permissions
  // ============================================================
  const hasUserPermissions = await knex.schema.hasTable("user_permissions");
  if (!hasUserPermissions) {
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
  }

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
  // 5. Create single Staff role and migrate all staff users
  // ============================================================
  
  // First, ensure we have a single Staff role (id=6)
  const existingStaffRole = await knex("user_role")
    .where({ role_name: "Staff", role_type: "system" })
    .whereNull("role_for")
    .first();
  
  let staffRoleId;
  if (!existingStaffRole) {
    // Insert the single Staff system role
    const [insertedId] = await knex("user_role").insert({
      id: 6,
      role_name: "Staff",
      role_description: "Staff member of a business. Permissions are assigned per-user.",
      role_type: "system",
      is_immutable: true,
      role_for: null,
    });
    staffRoleId = 6;
    console.log("[RBAC Simplification] Created single Staff system role (id=6).");
  } else {
    staffRoleId = existingStaffRole.id;
    console.log(`[RBAC Simplification] Staff system role already exists (id=${staffRoleId}).`);
  }

  // Get all per-business staff roles (role_type='business' with role_for set)
  const businessStaffRoles = await knex("user_role")
    .where({ role_type: "business" })
    .whereNotNull("role_for")
    .select("id");

  if (businessStaffRoles.length > 0) {
    const oldRoleIds = businessStaffRoles.map(r => r.id);
    
    // Update all users with per-business staff roles to use the single Staff role
    const updatedCount = await knex("user")
      .whereIn("user_role_id", oldRoleIds)
      .update({ user_role_id: staffRoleId });
    
    console.log(`[RBAC Simplification] Migrated ${updatedCount} staff users to single Staff role.`);
    
    // Delete the old per-business staff roles
    await knex("role_permissions").whereIn("user_role_id", oldRoleIds).del();
    await knex("user_role").whereIn("id", oldRoleIds).del();
    
    console.log(`[RBAC Simplification] Deleted ${oldRoleIds.length} per-business staff roles.`);
  }

  // ============================================================
  // 6. Remove role_for column from user_role table
  // ============================================================
  const hasRoleFor = await knex.schema.hasColumn("user_role", "role_for");
  if (hasRoleFor) {
    // Drop index first if it exists
    try {
      await knex.schema.alterTable("user_role", (table) => {
        table.dropIndex(["role_for", "role_type"], "idx_role_for_type");
      });
    } catch (e) {
      // Index might not exist, ignore
    }
    
    await knex.schema.alterTable("user_role", (table) => {
      table.dropColumn("role_for");
    });
    console.log("[RBAC Simplification] Removed role_for column from user_role.");
  }

  // ============================================================
  // 7. Create simplified stored procedures
  // ============================================================
  
  // Drop old complex procedures and any existing versions
  await knex.raw("DROP PROCEDURE IF EXISTS GetUserEffectivePermissions");
  await knex.raw("DROP PROCEDURE IF EXISTS GetEffectivePermissions");
  await knex.raw("DROP PROCEDURE IF EXISTS AddPermissionOverride");
  await knex.raw("DROP PROCEDURE IF EXISTS RemovePermissionOverride");
  await knex.raw("DROP PROCEDURE IF EXISTS ClonePresetRole");
  
  // Drop procedures that will be recreated
  await knex.raw("DROP PROCEDURE IF EXISTS GetUserPermissions");
  await knex.raw("DROP PROCEDURE IF EXISTS GrantUserPermission");
  await knex.raw("DROP PROCEDURE IF EXISTS RevokeUserPermission");
  await knex.raw("DROP PROCEDURE IF EXISTS SetUserPermissions");
  await knex.raw("DROP PROCEDURE IF EXISTS GetBusinessStaffWithPermissions");
  await knex.raw("DROP PROCEDURE IF EXISTS GetOrCreateBusinessStaffRole");

  // Create new simplified GetUserPermissions procedure
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
  // MariaDB-compatible: uses loop instead of JSON_TABLE
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

  // Create procedure to get staff with their permissions for a business
  // MariaDB-compatible: uses GROUP_CONCAT instead of JSON_ARRAYAGG
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
