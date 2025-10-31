// Stored procedures for `staff` entity
async function createProcedures(knex) {
	// Get all staff
	await knex.raw(`
		CREATE PROCEDURE GetAllStaff()
		BEGIN
			SELECT * FROM staff ORDER BY created_at DESC;
		END;
	`);

	// Get staff by ID
	await knex.raw(`
		CREATE PROCEDURE GetStaffById(IN p_id CHAR(64))
		BEGIN
			SELECT * FROM staff WHERE id = p_id;
		END;
	`);

	// Get staff by foreign key: user_id
	await knex.raw(`
		CREATE PROCEDURE GetStaffByUserId(IN p_user_id CHAR(64))
		BEGIN
			SELECT * FROM staff WHERE user_id = p_user_id;
		END;
	`);

	// Insert staff
	await knex.raw(`
		CREATE PROCEDURE InsertStaff(
			IN p_id CHAR(64),
			IN p_first_name VARCHAR(255),
			IN p_middle_name VARCHAR(255),
			IN p_last_name VARCHAR(255),
			IN p_user_id CHAR(64)
		)
		BEGIN
			INSERT INTO staff (id, first_name, middle_name, last_name, user_id)
			VALUES (p_id, p_first_name, p_middle_name, p_last_name, p_user_id);
			SELECT * FROM staff WHERE id = p_id;
		END;
	`);

	// Update staff (all fields optional)
	await knex.raw(`
		CREATE PROCEDURE UpdateStaff(
			IN p_id CHAR(64),
			IN p_first_name VARCHAR(255),
			IN p_middle_name VARCHAR(255),
			IN p_last_name VARCHAR(255),
			IN p_user_id CHAR(64)
		)
		BEGIN
			UPDATE staff
			SET first_name = IFNULL(p_first_name, first_name),
					middle_name = IFNULL(p_middle_name, middle_name),
					last_name = IFNULL(p_last_name, last_name),
					user_id = IFNULL(p_user_id, user_id)
			WHERE id = p_id;
			SELECT * FROM staff WHERE id = p_id;
		END;
	`);

	// Delete staff
	await knex.raw(`
		CREATE PROCEDURE DeleteStaff(IN p_id CHAR(64))
		BEGIN
			DELETE FROM staff WHERE id = p_id;
		END;
	`);
}

async function dropProcedures(knex) {
	await knex.raw("DROP PROCEDURE IF EXISTS GetAllStaff;");
	await knex.raw("DROP PROCEDURE IF EXISTS GetStaffById;");
	await knex.raw("DROP PROCEDURE IF EXISTS GetStaffByUserId;");
	await knex.raw("DROP PROCEDURE IF EXISTS InsertStaff;");
	await knex.raw("DROP PROCEDURE IF EXISTS UpdateStaff;");
	await knex.raw("DROP PROCEDURE IF EXISTS DeleteStaff;");
}

export { createProcedures, dropProcedures };
