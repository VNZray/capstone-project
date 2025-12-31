/**
 * Permissions Stored Procedures
 * Extracted from 20250928000001-permissions-table.cjs migration
 */

/**
 * Create all permissions-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createPermissionsProcedures(sequelize) {
  // InsertPermission - Create a new permission
  await sequelize.query(`
    CREATE PROCEDURE InsertPermission(
      IN p_name VARCHAR(255),
      IN p_description VARCHAR(255),
      IN p_category_id INT,
      IN p_scope ENUM('system', 'business', 'all')
    )
    BEGIN
      INSERT INTO permissions (name, description, category_id, scope)
      VALUES (p_name, p_description, p_category_id, IFNULL(p_scope, 'all'));
      SELECT * FROM permissions WHERE id = LAST_INSERT_ID();
    END;
  `);

  // GetAllPermissions - Retrieve all permissions with category info
  await sequelize.query(`
    CREATE PROCEDURE GetAllPermissions()
    BEGIN
      SELECT p.*, pc.name AS category_name
      FROM permissions p
      LEFT JOIN permission_categories pc ON p.category_id = pc.id
      ORDER BY pc.sort_order, p.name;
    END;
  `);

  // GetPermissionById - Retrieve a specific permission
  await sequelize.query(`
    CREATE PROCEDURE GetPermissionById(IN p_id INT)
    BEGIN
      SELECT p.*, pc.name AS category_name
      FROM permissions p
      LEFT JOIN permission_categories pc ON p.category_id = pc.id
      WHERE p.id = p_id;
    END;
  `);

  // GetPermissionsByCategoryId - Retrieve permissions by category
  await sequelize.query(`
    CREATE PROCEDURE GetPermissionsByCategoryId(IN p_category_id INT)
    BEGIN
      SELECT * FROM permissions WHERE category_id = p_category_id ORDER BY name;
    END;
  `);

  // AssignPermissionToRole - Link a permission to a role
  await sequelize.query(`
    CREATE PROCEDURE AssignPermissionToRole(IN p_user_role_id INT, IN p_permission_id INT)
    BEGIN
      INSERT IGNORE INTO role_permissions (user_role_id, permission_id)
      VALUES (p_user_role_id, p_permission_id);
      SELECT * FROM role_permissions WHERE user_role_id = p_user_role_id AND permission_id = p_permission_id;
    END;
  `);

  // RemovePermissionFromRole - Remove a permission from a role
  await sequelize.query(`
    CREATE PROCEDURE RemovePermissionFromRole(IN p_user_role_id INT, IN p_permission_id INT)
    BEGIN
      DELETE FROM role_permissions WHERE user_role_id = p_user_role_id AND permission_id = p_permission_id;
    END;
  `);

  // GetPermissionsByRoleId - Retrieve all permissions for a role
  await sequelize.query(`
    CREATE PROCEDURE GetPermissionsByRoleId(IN p_user_role_id INT)
    BEGIN
      SELECT p.*, pc.name AS category_name
      FROM permissions p
      LEFT JOIN permission_categories pc ON p.category_id = pc.id
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.user_role_id = p_user_role_id
      ORDER BY pc.sort_order, p.name;
    END;
  `);

  // GetRolesByPermissionId - Retrieve all roles with a specific permission
  await sequelize.query(`
    CREATE PROCEDURE GetRolesByPermissionId(IN p_permission_id INT)
    BEGIN
      SELECT ur.*
      FROM user_role ur
      JOIN role_permissions rp ON ur.id = rp.user_role_id
      WHERE rp.permission_id = p_permission_id;
    END;
  `);

  console.log('Permissions procedures created.');
}

/**
 * Drop all permissions-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropPermissionsProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertPermission;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetAllPermissions;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetPermissionById;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetPermissionsByCategoryId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS AssignPermissionToRole;');
  await sequelize.query('DROP PROCEDURE IF EXISTS RemovePermissionFromRole;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetPermissionsByRoleId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetRolesByPermissionId;');

  console.log('Permissions procedures dropped.');
}
