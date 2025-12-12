/**
 * RBAC Enhancement Stored Procedures
 * 
 * Provides database-level operations for the three-tier RBAC system:
 * - System roles (platform-wide, immutable)
 * - Preset roles (templates for business roles)
 * - Business roles (instances created from presets or custom)
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

  // Get all preset roles (templates available for cloning)
  await knex.raw(`
    CREATE PROCEDURE GetPresetRoles()
    BEGIN
      SELECT 
        ur.*,
        COALESCE(
          (SELECT COUNT(*) FROM role_permissions WHERE user_role_id = ur.id),
          0
        ) AS permission_count
      FROM user_role ur
      WHERE ur.role_type = 'preset'
      ORDER BY ur.role_name ASC;
    END;
  `);

  // Get roles for a specific business (both from presets and custom)
  await knex.raw(`
    CREATE PROCEDURE GetBusinessRoles(IN p_business_id VARCHAR(255))
    BEGIN
      SELECT 
        ur.*,
        base.role_name AS based_on_name,
        COALESCE(
          (SELECT COUNT(*) FROM role_permissions WHERE user_role_id = ur.id),
          0
        ) AS permission_count,
        COALESCE(
          (SELECT COUNT(*) FROM user WHERE user_role_id = ur.id),
          0
        ) AS user_count
      FROM user_role ur
      LEFT JOIN user_role base ON base.id = ur.based_on_role_id
      WHERE ur.role_for = p_business_id AND ur.role_type = 'business'
      ORDER BY ur.role_name ASC;
    END;
  `);

  // Get role with full details including permissions
  await knex.raw(`
    CREATE PROCEDURE GetRoleWithPermissions(IN p_role_id INT)
    BEGIN
      -- Get role details
      SELECT 
        ur.*,
        base.role_name AS based_on_name,
        base.role_type AS based_on_type
      FROM user_role ur
      LEFT JOIN user_role base ON base.id = ur.based_on_role_id
      WHERE ur.id = p_role_id;
      
      -- Get direct permissions
      SELECT 
        p.id,
        p.name,
        p.description,
        p.scope,
        pc.name AS category_name,
        'direct' AS source
      FROM role_permissions rp
      JOIN permissions p ON p.id = rp.permission_id
      LEFT JOIN permission_categories pc ON pc.id = p.category_id
      WHERE rp.user_role_id = p_role_id
      ORDER BY pc.sort_order, p.name;
      
      -- Get permission overrides if any
      SELECT 
        rpo.id AS override_id,
        rpo.is_granted,
        p.id AS permission_id,
        p.name AS permission_name,
        p.description AS permission_description
      FROM role_permission_overrides rpo
      JOIN permissions p ON p.id = rpo.permission_id
      WHERE rpo.user_role_id = p_role_id;
    END;
  `);

  // ============================================================
  // ROLE CREATION PROCEDURES
  // ============================================================

  // Create a new system role (admin only)
  await knex.raw(`
    CREATE PROCEDURE CreateSystemRole(
      IN p_role_name VARCHAR(20),
      IN p_role_description TEXT,
      IN p_is_immutable BOOLEAN
    )
    BEGIN
      INSERT INTO user_role (
        role_name, 
        role_description, 
        role_type, 
        role_for, 
        is_custom, 
        is_immutable,
        based_on_role_id
      ) VALUES (
        p_role_name, 
        p_role_description, 
        'system', 
        NULL, 
        FALSE, 
        IFNULL(p_is_immutable, TRUE),
        NULL
      );
      
      SELECT * FROM user_role WHERE id = LAST_INSERT_ID();
    END;
  `);

  // Create a new preset role (admin only)
  await knex.raw(`
    CREATE PROCEDURE CreatePresetRole(
      IN p_role_name VARCHAR(20),
      IN p_role_description TEXT
    )
    BEGIN
      INSERT INTO user_role (
        role_name, 
        role_description, 
        role_type, 
        role_for, 
        is_custom, 
        is_immutable,
        based_on_role_id
      ) VALUES (
        p_role_name, 
        p_role_description, 
        'preset', 
        NULL, 
        FALSE, 
        FALSE,
        NULL
      );
      
      SELECT * FROM user_role WHERE id = LAST_INSERT_ID();
    END;
  `);

  // Clone a preset role for a business
  await knex.raw(`
    CREATE PROCEDURE ClonePresetRole(
      IN p_preset_role_id INT,
      IN p_business_id VARCHAR(255),
      IN p_custom_name VARCHAR(20)
    )
    BEGIN
      DECLARE v_preset_name VARCHAR(20);
      DECLARE v_preset_desc TEXT;
      DECLARE v_new_role_id INT;
      
      -- Get preset details
      SELECT role_name, role_description 
      INTO v_preset_name, v_preset_desc
      FROM user_role 
      WHERE id = p_preset_role_id AND role_type = 'preset';
      
      IF v_preset_name IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Preset role not found';
      END IF;
      
      -- Create the business role instance
      INSERT INTO user_role (
        role_name,
        role_description,
        role_type,
        role_for,
        is_custom,
        is_immutable,
        based_on_role_id
      ) VALUES (
        IFNULL(p_custom_name, v_preset_name),
        v_preset_desc,
        'business',
        p_business_id,
        FALSE,
        FALSE,
        p_preset_role_id
      );
      
      SET v_new_role_id = LAST_INSERT_ID();
      
      -- Copy all permissions from preset to new role
      INSERT INTO role_permissions (user_role_id, permission_id)
      SELECT v_new_role_id, permission_id
      FROM role_permissions
      WHERE user_role_id = p_preset_role_id;
      
      -- Return the new role with permission count
      SELECT 
        ur.*,
        (SELECT COUNT(*) FROM role_permissions WHERE user_role_id = ur.id) AS permission_count
      FROM user_role ur
      WHERE ur.id = v_new_role_id;
    END;
  `);

  // Create a fully custom business role
  await knex.raw(`
    CREATE PROCEDURE CreateCustomBusinessRole(
      IN p_business_id VARCHAR(255),
      IN p_role_name VARCHAR(20),
      IN p_role_description TEXT
    )
    BEGIN
      INSERT INTO user_role (
        role_name,
        role_description,
        role_type,
        role_for,
        is_custom,
        is_immutable,
        based_on_role_id
      ) VALUES (
        p_role_name,
        p_role_description,
        'business',
        p_business_id,
        TRUE,
        FALSE,
        NULL
      );
      
      SELECT * FROM user_role WHERE id = LAST_INSERT_ID();
    END;
  `);

  // ============================================================
  // ROLE UPDATE PROCEDURES
  // ============================================================

  // Update a business role (only non-immutable roles)
  await knex.raw(`
    CREATE PROCEDURE UpdateBusinessRole(
      IN p_role_id INT,
      IN p_role_name VARCHAR(20),
      IN p_role_description TEXT,
      IN p_business_id VARCHAR(255)
    )
    BEGIN
      DECLARE v_is_immutable BOOLEAN;
      DECLARE v_role_for VARCHAR(255);
      
      -- Check if role exists and is mutable
      SELECT is_immutable, role_for 
      INTO v_is_immutable, v_role_for
      FROM user_role 
      WHERE id = p_role_id;
      
      IF v_is_immutable THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot modify immutable role';
      END IF;
      
      -- Verify business ownership
      IF v_role_for IS NOT NULL AND v_role_for != p_business_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Role does not belong to this business';
      END IF;
      
      UPDATE user_role
      SET 
        role_name = IFNULL(p_role_name, role_name),
        role_description = IFNULL(p_role_description, role_description),
        updated_at = NOW()
      WHERE id = p_role_id;
      
      SELECT * FROM user_role WHERE id = p_role_id;
    END;
  `);

  // ============================================================
  // ROLE DELETION PROCEDURES
  // ============================================================

  // Delete a business role (only custom/business roles, not system/preset)
  await knex.raw(`
    CREATE PROCEDURE DeleteBusinessRole(
      IN p_role_id INT,
      IN p_business_id VARCHAR(255)
    )
    BEGIN
      DECLARE v_role_type VARCHAR(20);
      DECLARE v_role_for VARCHAR(255);
      DECLARE v_user_count INT;
      
      -- Get role info
      SELECT role_type, role_for 
      INTO v_role_type, v_role_for
      FROM user_role 
      WHERE id = p_role_id;
      
      -- Can only delete business roles
      IF v_role_type != 'business' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Can only delete business-specific roles';
      END IF;
      
      -- Verify business ownership
      IF v_role_for != p_business_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Role does not belong to this business';
      END IF;
      
      -- Check for users with this role
      SELECT COUNT(*) INTO v_user_count FROM user WHERE user_role_id = p_role_id;
      IF v_user_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot delete role with assigned users';
      END IF;
      
      -- Delete role (cascade will handle role_permissions and overrides)
      DELETE FROM user_role WHERE id = p_role_id;
      
      SELECT ROW_COUNT() AS deleted_count;
    END;
  `);

  // ============================================================
  // PERMISSION OVERRIDE PROCEDURES
  // ============================================================

  // Add permission override (for preset-based roles)
  await knex.raw(`
    CREATE PROCEDURE AddPermissionOverride(
      IN p_role_id INT,
      IN p_permission_id INT,
      IN p_is_granted BOOLEAN,
      IN p_created_by CHAR(36)
    )
    BEGIN
      INSERT INTO role_permission_overrides (
        user_role_id,
        permission_id,
        is_granted,
        created_by
      ) VALUES (
        p_role_id,
        p_permission_id,
        p_is_granted,
        p_created_by
      )
      ON DUPLICATE KEY UPDATE
        is_granted = p_is_granted;
      
      SELECT * FROM role_permission_overrides 
      WHERE user_role_id = p_role_id AND permission_id = p_permission_id;
    END;
  `);

  // Remove permission override
  await knex.raw(`
    CREATE PROCEDURE RemovePermissionOverride(
      IN p_role_id INT,
      IN p_permission_id INT
    )
    BEGIN
      DELETE FROM role_permission_overrides 
      WHERE user_role_id = p_role_id AND permission_id = p_permission_id;
      
      SELECT ROW_COUNT() AS deleted_count;
    END;
  `);

  // ============================================================
  // EFFECTIVE PERMISSIONS CALCULATION
  // ============================================================

  // Get effective permissions for a role (including inheritance and overrides)
  await knex.raw(`
    CREATE PROCEDURE GetEffectivePermissions(IN p_role_id INT)
    BEGIN
      DECLARE v_based_on_role_id INT;
      DECLARE v_is_custom BOOLEAN;
      
      -- Get role inheritance info
      SELECT based_on_role_id, is_custom 
      INTO v_based_on_role_id, v_is_custom
      FROM user_role 
      WHERE id = p_role_id;
      
      -- If custom role or no base role, just return direct permissions
      IF v_is_custom OR v_based_on_role_id IS NULL THEN
        SELECT 
          p.id,
          p.name,
          p.description,
          p.scope,
          'direct' AS source
        FROM role_permissions rp
        JOIN permissions p ON p.id = rp.permission_id
        WHERE rp.user_role_id = p_role_id;
      ELSE
        -- For preset-based roles, merge direct + inherited with overrides
        SELECT 
          p.id,
          p.name,
          p.description,
          p.scope,
          CASE 
            WHEN rp_direct.permission_id IS NOT NULL THEN 'direct'
            WHEN rpo.is_granted = TRUE THEN 'override_grant'
            ELSE 'inherited'
          END AS source
        FROM permissions p
        LEFT JOIN role_permissions rp_direct ON rp_direct.permission_id = p.id AND rp_direct.user_role_id = p_role_id
        LEFT JOIN role_permissions rp_inherited ON rp_inherited.permission_id = p.id AND rp_inherited.user_role_id = v_based_on_role_id
        LEFT JOIN role_permission_overrides rpo ON rpo.permission_id = p.id AND rpo.user_role_id = p_role_id
        WHERE 
          -- Include if: direct permission, OR inherited (not revoked), OR override grants
          (rp_direct.permission_id IS NOT NULL)
          OR (rp_inherited.permission_id IS NOT NULL AND (rpo.is_granted IS NULL OR rpo.is_granted = TRUE))
          OR (rpo.is_granted = TRUE);
      END IF;
    END;
  `);

  // Get effective permissions for a user (by user ID)
  await knex.raw(`
    CREATE PROCEDURE GetUserEffectivePermissions(IN p_user_id CHAR(36))
    BEGIN
      DECLARE v_role_id INT;
      DECLARE v_based_on_role_id INT;
      DECLARE v_is_custom BOOLEAN;
      
      -- Get user's role
      SELECT user_role_id INTO v_role_id FROM user WHERE id = p_user_id;
      
      IF v_role_id IS NULL THEN
        SELECT NULL AS id, NULL AS name LIMIT 0; -- Return empty
      ELSE
        -- Get role inheritance info
        SELECT based_on_role_id, is_custom 
        INTO v_based_on_role_id, v_is_custom
        FROM user_role 
        WHERE id = v_role_id;
        
        -- If custom role or no base role, just return direct permissions
        IF v_is_custom OR v_based_on_role_id IS NULL THEN
          SELECT 
            p.id,
            p.name,
            p.description,
            p.scope
          FROM role_permissions rp
          JOIN permissions p ON p.id = rp.permission_id
          WHERE rp.user_role_id = v_role_id;
        ELSE
          -- For preset-based roles, merge with inheritance and overrides
          SELECT DISTINCT
            p.id,
            p.name,
            p.description,
            p.scope
          FROM permissions p
          LEFT JOIN role_permissions rp_direct ON rp_direct.permission_id = p.id AND rp_direct.user_role_id = v_role_id
          LEFT JOIN role_permissions rp_inherited ON rp_inherited.permission_id = p.id AND rp_inherited.user_role_id = v_based_on_role_id
          LEFT JOIN role_permission_overrides rpo ON rpo.permission_id = p.id AND rpo.user_role_id = v_role_id
          WHERE 
            (rp_direct.permission_id IS NOT NULL)
            OR (rp_inherited.permission_id IS NOT NULL AND (rpo.is_granted IS NULL OR rpo.is_granted = TRUE))
            OR (rpo.is_granted = TRUE);
        END IF;
      END IF;
    END;
  `);

  // ============================================================
  // AUDIT LOG PROCEDURES
  // ============================================================

  // Log role action
  await knex.raw(`
    CREATE PROCEDURE LogRoleAction(
      IN p_role_id INT,
      IN p_action VARCHAR(50),
      IN p_old_values JSON,
      IN p_new_values JSON,
      IN p_performed_by CHAR(36)
    )
    BEGIN
      INSERT INTO role_audit_log (
        user_role_id,
        action,
        old_values,
        new_values,
        performed_by
      ) VALUES (
        p_role_id,
        p_action,
        p_old_values,
        p_new_values,
        p_performed_by
      );
      
      SELECT LAST_INSERT_ID() AS audit_id;
    END;
  `);

  // Get role audit history
  await knex.raw(`
    CREATE PROCEDURE GetRoleAuditLog(
      IN p_role_id INT,
      IN p_limit INT
    )
    BEGIN
      DECLARE v_limit INT;
      SET v_limit = IFNULL(p_limit, 50);
      
      SET @sql = CONCAT(
        'SELECT ral.*, u.email AS performed_by_email ',
        'FROM role_audit_log ral ',
        'LEFT JOIN user u ON u.id = ral.performed_by ',
        'WHERE ral.user_role_id = ', p_role_id, ' ',
        'ORDER BY ral.performed_at DESC ',
        'LIMIT ', v_limit
      );
      
      PREPARE stmt FROM @sql;
      EXECUTE stmt;
      DEALLOCATE PREPARE stmt;
    END;
  `);

  // ============================================================
  // PERMISSION CATEGORY PROCEDURES
  // ============================================================

  // Get all permission categories with permissions
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
      WHERE p_scope IS NULL OR p.scope = p_scope OR p.scope = 'all'
      ORDER BY pc.sort_order, pc.name, p.name;
    END;
  `);

  console.log("RBAC Enhancement procedures created.");
}

async function dropRoleProcedures(knex) {
  const procedures = [
    // Role retrieval
    "GetRolesByType",
    "GetPresetRoles",
    "GetBusinessRoles",
    "GetRoleWithPermissions",
    // Role creation
    "CreateSystemRole",
    "CreatePresetRole",
    "ClonePresetRole",
    "CreateCustomBusinessRole",
    // Role update/delete
    "UpdateBusinessRole",
    "DeleteBusinessRole",
    // Permission overrides
    "AddPermissionOverride",
    "RemovePermissionOverride",
    // Effective permissions
    "GetEffectivePermissions",
    "GetUserEffectivePermissions",
    // Audit
    "LogRoleAction",
    "GetRoleAuditLog",
    // Permission categories
    "GetPermissionCategories",
    "GetPermissionsGroupedByCategory"
  ];

  for (const proc of procedures) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${proc};`);
  }

  console.log("RBAC Enhancement procedures dropped.");
}

module.exports = {
  createRoleProcedures,
  dropRoleProcedures
};
