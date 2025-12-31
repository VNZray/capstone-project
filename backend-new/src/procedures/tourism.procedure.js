/**
 * Tourism Stored Procedures
 * Handles tourism admin entity operations
 */

/**
 * Create tourism-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createTourismProcedures(sequelize) {
  await sequelize.query(`
    CREATE PROCEDURE InsertTourism(
      IN p_id CHAR(64),
      IN p_first_name VARCHAR(30),
      IN p_middle_name VARCHAR(20),
      IN p_last_name VARCHAR(30),
      IN p_position VARCHAR(20),
      IN p_user_id CHAR(64)
    )
    BEGIN
      INSERT INTO tourism (id, first_name, middle_name, last_name, position, user_id)
      VALUES (p_id, p_first_name, p_middle_name, p_last_name, p_position, p_user_id);
      SELECT * FROM tourism WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetTourismById(IN p_id CHAR(64))
    BEGIN
      SELECT t.*, u.email, u.phone_number, u.user_profile, u.is_verified, u.is_active
      FROM tourism t
      LEFT JOIN user u ON t.user_id = u.id
      WHERE t.id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetTourismByUserId(IN p_user_id CHAR(64))
    BEGIN
      SELECT t.*, u.email, u.phone_number, u.user_profile, u.is_verified, u.is_active
      FROM tourism t
      LEFT JOIN user u ON t.user_id = u.id
      WHERE t.user_id = p_user_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateTourism(
      IN p_id CHAR(64),
      IN p_first_name VARCHAR(30),
      IN p_middle_name VARCHAR(20),
      IN p_last_name VARCHAR(30),
      IN p_position VARCHAR(20)
    )
    BEGIN
      UPDATE tourism SET
        first_name = IFNULL(p_first_name, first_name),
        middle_name = p_middle_name,
        last_name = IFNULL(p_last_name, last_name),
        position = IFNULL(p_position, position)
      WHERE id = p_id;
      SELECT * FROM tourism WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeleteTourism(IN p_id CHAR(64))
    BEGIN
      DELETE FROM tourism WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetAllTourism()
    BEGIN
      SELECT t.*, u.email, u.phone_number, u.user_profile, u.is_verified, u.is_active
      FROM tourism t
      LEFT JOIN user u ON t.user_id = u.id
      ORDER BY t.first_name ASC;
    END;
  `);
}

/**
 * Drop tourism-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropTourismProcedures(sequelize) {
  const procedures = [
    'InsertTourism',
    'GetTourismById',
    'GetTourismByUserId',
    'UpdateTourism',
    'DeleteTourism',
    'GetAllTourism'
  ];

  for (const proc of procedures) {
    await sequelize.query(`DROP PROCEDURE IF EXISTS ${proc};`);
  }
}
