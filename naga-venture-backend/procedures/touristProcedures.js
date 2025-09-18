async function createProcedures(knex) {
  // Get all tourists
  await knex.raw(`
		CREATE PROCEDURE GetAllTourists()
		BEGIN
			SELECT * FROM tourist;
		END;
	`);

  // Get tourist by ID
  await knex.raw(`
		CREATE PROCEDURE GetTouristById(IN p_id CHAR(36))
		BEGIN
			SELECT * FROM tourist WHERE id = p_id;
		END;
	`);

	// Insert tourist (matches migration columns)
	await knex.raw(`
		CREATE PROCEDURE InsertTourist(
			IN p_id CHAR(36),
			IN p_first_name VARCHAR(30),
			IN p_middle_name VARCHAR(20),
			IN p_last_name VARCHAR(30),
			IN p_ethnicity ENUM('Bicolano','Non-Bicolano','Foreigner'),
			IN p_birthdate DATE,
			IN p_age INT,
			IN p_gender ENUM('Male','Female','Prefer not to say'),
			IN p_nationality VARCHAR(20),
			IN p_category ENUM('Domestic','Overseas'),
			IN p_address_id INT,
			IN p_user_id CHAR(36)
		)
		BEGIN
			INSERT INTO tourist (
				id, first_name, middle_name, last_name, ethnicity, birthdate, age, gender, nationality, category, address_id, user_id
			) VALUES (
				p_id, p_first_name, p_middle_name, p_last_name, p_ethnicity, p_birthdate, p_age, p_gender, p_nationality, p_category, p_address_id, p_user_id
			);
			SELECT * FROM tourist WHERE id = p_id;
		END;
	`);

	// Update tourist (all fields optional; matches migration columns)
	await knex.raw(`
		CREATE PROCEDURE UpdateTourist(
			IN p_id CHAR(36),
			IN p_first_name VARCHAR(30),
			IN p_middle_name VARCHAR(20),
			IN p_last_name VARCHAR(30),
			IN p_ethnicity ENUM('Bicolano','Non-Bicolano','Foreigner'),
			IN p_birthdate DATE,
			IN p_age INT,
			IN p_gender ENUM('Male','Female','Prefer not to say'),
			IN p_nationality VARCHAR(20),
			IN p_category ENUM('Domestic','Overseas'),
			IN p_address_id INT,
			IN p_user_id CHAR(36)
		)
		BEGIN
			UPDATE tourist SET
				first_name = IFNULL(p_first_name, first_name),
				middle_name = IFNULL(p_middle_name, middle_name),
				last_name = IFNULL(p_last_name, last_name),
				ethnicity = IFNULL(p_ethnicity, ethnicity),
				birthdate = IFNULL(p_birthdate, birthdate),
				age = IFNULL(p_age, age),
				gender = IFNULL(p_gender, gender),
				nationality = IFNULL(p_nationality, nationality),
				category = IFNULL(p_category, category),
				address_id = IFNULL(p_address_id, address_id),
				user_id = IFNULL(p_user_id, user_id)
			WHERE id = p_id;
			SELECT * FROM tourist WHERE id = p_id;
		END;
	`);

  // Delete tourist
  await knex.raw(`
		CREATE PROCEDURE DeleteTourist(IN p_id CHAR(36))
		BEGIN
			DELETE FROM tourist WHERE id = p_id;
		END;
	`);

  // Get tourist by user ID
  await knex.raw(`
    CREATE PROCEDURE GetTouristByUserId(IN p_user_id CHAR(36))
    BEGIN
      SELECT * FROM tourist WHERE user_id = p_user_id;
    END;
  `);
}

async function dropProcedures(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllTourists;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetTouristById;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertTourist;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateTourist;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteTourist;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetTouristByUserId;");
}

export { createProcedures, dropProcedures };
