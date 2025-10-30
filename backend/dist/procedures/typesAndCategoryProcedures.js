async function createTypesAndCategoryProcedures(knex) {
  // Get all types
  await knex.raw(`
		CREATE PROCEDURE GetAllTypes()
		BEGIN
			SELECT * FROM type;
		END;
	`);

  // Get all Accommodation and Shop types
  await knex.raw(`
		CREATE PROCEDURE GetAccommodationAndShopTypes()
		BEGIN
			SELECT * FROM type WHERE type IN ('Accommodation', 'Shop');
		END;
	`);

  // Get categories by type_id
  await knex.raw(`
		CREATE PROCEDURE GetCategoryByTypeId(IN p_type_id INT)
		BEGIN
			SELECT * FROM category WHERE type_id = p_type_id;
		END;
	`);

  // Get type by ID
  await knex.raw(`
		CREATE PROCEDURE GetTypeById(IN p_id INT)
		BEGIN
			SELECT * FROM type WHERE id = p_id;
		END;
	`);

  // Get category by ID
  await knex.raw(`
		CREATE PROCEDURE GetCategoryById(IN p_id INT)
		BEGIN
			SELECT * FROM category WHERE id = p_id;
		END;
	`);
}

async function dropTypesAndCategoryProcedures(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllTypes;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetAccommodationAndShopTypes;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetCategoryByTypeId;");
}

export { createTypesAndCategoryProcedures, dropTypesAndCategoryProcedures };
