async function createTourismProcedures(knex) {
  // Get all tourism
  await knex.raw(`
    CREATE PROCEDURE GetAllTourism()
    BEGIN
      SELECT * FROM tourism;
    END;
  `);

  // Get tourism by ID
  await knex.raw(`
    CREATE PROCEDURE GetTourismById(IN p_id CHAR(64))
    BEGIN
      SELECT * FROM tourism WHERE id = p_id;
    END;
  `);

  // Insert tourism
  await knex.raw(`
    CREATE PROCEDURE InsertTourism(
      IN p_id CHAR(64),
      IN p_first_name VARCHAR(30),
      IN p_middle_name VARCHAR(20),
      IN p_last_name VARCHAR(30),
      IN p_position VARCHAR(20),
      IN p_user_id CHAR(64)
    )
    BEGIN
      INSERT INTO tourism (
        id, first_name, middle_name, last_name, position, user_id
      ) VALUES (
        p_id, p_first_name, p_middle_name, p_last_name, p_position, p_user_id
      );
      SELECT * FROM tourism WHERE id = p_id;
    END;
  `);

  // Update tourism (all fields optional)
  await knex.raw(`
    CREATE PROCEDURE UpdateTourism(
      IN p_id CHAR(64),
      IN p_first_name VARCHAR(30),
      IN p_middle_name VARCHAR(20),
      IN p_last_name VARCHAR(30),
      IN p_position VARCHAR(20),
      IN p_user_id CHAR(64)
    )
    BEGIN
      UPDATE tourism
      SET first_name = IFNULL(p_first_name, first_name),
          middle_name = IFNULL(p_middle_name, middle_name),
          last_name = IFNULL(p_last_name, last_name),
          position = IFNULL(p_position, position),
          user_id = IFNULL(p_user_id, user_id)
      WHERE id = p_id;
      SELECT * FROM tourism WHERE id = p_id;
    END;
  `);

  // Delete tourism
  await knex.raw(`
    CREATE PROCEDURE DeleteTourism(IN p_id CHAR(64))
    BEGIN
      DELETE FROM tourism WHERE id = p_id;
    END;
  `);

  // Get tourism by user ID
  await knex.raw(`
    CREATE PROCEDURE GetTourismByUserId(IN p_user_id CHAR(64))
    BEGIN
      SELECT * FROM tourism WHERE user_id = p_user_id;
    END;
  `);
}

async function dropTourismProcedures(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllTourism;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetTourismById;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertTourism;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateTourism;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteTourism;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetTourismByUserId;");
}

export { createTourismProcedures, dropTourismProcedures };
