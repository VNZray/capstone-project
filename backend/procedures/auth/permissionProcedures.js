// Stored procedures for permissions and role_permissions

async function createPermissionProcedures(knex) {
	// List all permissions
	await knex.raw(`
		CREATE PROCEDURE GetAllPermissions()
		BEGIN
			SELECT * FROM permissions ORDER BY id ASC;
		END;
	`);

	// Get permission by id
	await knex.raw(`
		CREATE PROCEDURE GetPermissionById(IN p_id INT)
		BEGIN
			SELECT * FROM permissions WHERE id = p_id;
		END;
	`);

	// Insert permission
	await knex.raw(`
		CREATE PROCEDURE InsertPermission(
			IN p_name VARCHAR(255),
			IN p_description VARCHAR(255)
		)
		BEGIN
			INSERT INTO permissions(name, description) VALUES(p_name, p_description);
			SELECT * FROM permissions WHERE id = LAST_INSERT_ID();
		END;
	`);

	// Update permission
	await knex.raw(`
		CREATE PROCEDURE UpdatePermission(
			IN p_id INT,
			IN p_name VARCHAR(255),
			IN p_description VARCHAR(255)
		)
		BEGIN
			UPDATE permissions
			SET name = IFNULL(p_name, name),
					description = IFNULL(p_description, description)
			WHERE id = p_id;
			SELECT * FROM permissions WHERE id = p_id;
		END;
	`);

	// Delete permission
	await knex.raw(`
		CREATE PROCEDURE DeletePermission(IN p_id INT)
		BEGIN
			DELETE FROM permissions WHERE id = p_id;
		END;
	`);
}

async function dropPermissionProcedures(knex) {
	await knex.raw("DROP PROCEDURE IF EXISTS GetAllPermissions;");
	await knex.raw("DROP PROCEDURE IF EXISTS GetPermissionById;");
	await knex.raw("DROP PROCEDURE IF EXISTS InsertPermission;");
	await knex.raw("DROP PROCEDURE IF EXISTS UpdatePermission;");
	await knex.raw("DROP PROCEDURE IF EXISTS DeletePermission;");
}

// Procedures for role_permissions assignments and lookups
async function createRolePermissionProcedures(knex) {
	// List permissions by role (joined with permission details)
	await knex.raw(`
		CREATE PROCEDURE GetPermissionsByRoleId(IN p_role_id INT)
		BEGIN
			SELECT rp.user_role_id, p.*
			FROM role_permissions rp
			JOIN permissions p ON p.id = rp.permission_id
			WHERE rp.user_role_id = p_role_id
			ORDER BY p.id ASC;
		END;
	`);

	// Assign permission to role
	await knex.raw(`
		CREATE PROCEDURE InsertRolePermission(
			IN p_role_id INT,
			IN p_permission_id INT
		)
		BEGIN
			INSERT INTO role_permissions(user_role_id, permission_id)
			VALUES(p_role_id, p_permission_id);
			SELECT * FROM role_permissions WHERE user_role_id = p_role_id AND permission_id = p_permission_id;
		END;
	`);

	// Remove permission from role
	await knex.raw(`
		CREATE PROCEDURE DeleteRolePermission(
			IN p_role_id INT,
			IN p_permission_id INT
		)
		BEGIN
			DELETE FROM role_permissions WHERE user_role_id = p_role_id AND permission_id = p_permission_id;
		END;
	`);
}

async function dropRolePermissionProcedures(knex) {
	await knex.raw("DROP PROCEDURE IF EXISTS GetPermissionsByRoleId;");
	await knex.raw("DROP PROCEDURE IF EXISTS InsertRolePermission;");
	await knex.raw("DROP PROCEDURE IF EXISTS DeleteRolePermission;");
}

export default {
	createPermissionProcedures,
	dropPermissionProcedures,
	createRolePermissionProcedures,
	dropRolePermissionProcedures,
};
