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
			IN p_description VARCHAR(255),
			IN p_can_add BOOLEAN,
			IN p_can_view BOOLEAN,
			IN p_can_update BOOLEAN,
			IN p_can_delete BOOLEAN,
			IN p_permission_for CHAR(36)
		)
		BEGIN
			INSERT INTO permissions(name, description, can_add, can_view, can_update, can_delete, permission_for)
			VALUES(p_name, p_description, p_can_add, p_can_view, p_can_update, p_can_delete, p_permission_for);
			SELECT * FROM permissions WHERE id = LAST_INSERT_ID();
		END;
	`);

	// Update permission
	await knex.raw(`
		CREATE PROCEDURE UpdatePermission(
			IN p_id INT,
			IN p_name VARCHAR(255),
			IN p_description VARCHAR(255),
			IN p_can_add BOOLEAN,
			IN p_can_view BOOLEAN,
			IN p_can_update BOOLEAN,
			IN p_can_delete BOOLEAN,
			IN p_permission_for CHAR(36)
		)
		BEGIN
			UPDATE permissions
			SET name = IFNULL(p_name, name),
					description = IFNULL(p_description, description),
					can_add = IFNULL(p_can_add, can_add),
					can_view = IFNULL(p_can_view, can_view),
					can_update = IFNULL(p_can_update, can_update),
					can_delete = IFNULL(p_can_delete, can_delete),
					permission_for = IFNULL(p_permission_for, permission_for)
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

	// Create default permissions for a new business
	await knex.raw(`
		CREATE PROCEDURE CreateDefaultBusinessPermissions(IN p_business_id CHAR(36))
		BEGIN
			INSERT INTO permissions(name, description, can_add, can_view, can_update, can_delete, permission_for) VALUES
			('dashboard', 'Access to business analytics and overview', false, true, false, false, p_business_id),
			('transactions', 'View and manage payment transactions', false, true, true, false, p_business_id),
			('bookings', 'Handle customer reservations and bookings', true, true, true, true, p_business_id),
			('business_profile', 'Edit business information and settings', false, true, true, false, p_business_id),
			('rooms', 'Add, edit, and manage room inventory', true, true, true, true, p_business_id),
			('promotions', 'Create and manage promotional offers', true, true, true, true, p_business_id),
			('subscriptions', 'Handle business subscription plans', false, true, true, false, p_business_id),
			('reviews', 'Respond to and manage customer feedback', false, true, true, false, p_business_id),
			('staff', 'Add and manage staff members', true, true, true, true, p_business_id);
		
			SELECT * FROM permissions WHERE permission_for = p_business_id;
		END;
	`);
}

async function dropPermissionProcedures(knex) {
	await knex.raw("DROP PROCEDURE IF EXISTS GetAllPermissions;");
	await knex.raw("DROP PROCEDURE IF EXISTS GetPermissionById;");
	await knex.raw("DROP PROCEDURE IF EXISTS InsertPermission;");
	await knex.raw("DROP PROCEDURE IF EXISTS UpdatePermission;");
	await knex.raw("DROP PROCEDURE IF EXISTS DeletePermission;");
	await knex.raw("DROP PROCEDURE IF EXISTS CreateDefaultBusinessPermissions;");
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
