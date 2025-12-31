/**
 * Tourist Stored Procedures
 * Handles tourist entity operations
 */

/**
 * Create tourist-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createTouristProcedures(sequelize) {
  await sequelize.query(`
    CREATE PROCEDURE InsertTourist(
      IN p_id CHAR(64),
      IN p_first_name VARCHAR(30),
      IN p_middle_name VARCHAR(20),
      IN p_last_name VARCHAR(30),
      IN p_ethnicity ENUM('Bicolano', 'Non-Bicolano', 'Foreigner'),
      IN p_birthdate DATE,
      IN p_age INT,
      IN p_gender ENUM('Male', 'Female', 'Prefer not to say'),
      IN p_nationality VARCHAR(20),
      IN p_origin ENUM('Domestic', 'Local', 'Overseas'),
      IN p_user_id CHAR(64)
    )
    BEGIN
      INSERT INTO tourist (id, first_name, middle_name, last_name, ethnicity, birthdate, age, gender, nationality, origin, user_id)
      VALUES (p_id, p_first_name, p_middle_name, p_last_name, p_ethnicity, p_birthdate, p_age, p_gender, p_nationality, p_origin, p_user_id);
      SELECT * FROM tourist WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetTouristById(IN p_id CHAR(64))
    BEGIN
      SELECT t.*, u.email, u.phone_number, u.user_profile, u.is_verified, u.is_active
      FROM tourist t
      LEFT JOIN user u ON t.user_id = u.id
      WHERE t.id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetTouristByUserId(IN p_user_id CHAR(64))
    BEGIN
      SELECT t.*, u.email, u.phone_number, u.user_profile, u.is_verified, u.is_active
      FROM tourist t
      LEFT JOIN user u ON t.user_id = u.id
      WHERE t.user_id = p_user_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateTourist(
      IN p_id CHAR(64),
      IN p_first_name VARCHAR(30),
      IN p_middle_name VARCHAR(20),
      IN p_last_name VARCHAR(30),
      IN p_ethnicity ENUM('Bicolano', 'Non-Bicolano', 'Foreigner'),
      IN p_birthdate DATE,
      IN p_age INT,
      IN p_gender ENUM('Male', 'Female', 'Prefer not to say'),
      IN p_nationality VARCHAR(20),
      IN p_origin ENUM('Domestic', 'Local', 'Overseas')
    )
    BEGIN
      UPDATE tourist SET
        first_name = IFNULL(p_first_name, first_name),
        middle_name = p_middle_name,
        last_name = IFNULL(p_last_name, last_name),
        ethnicity = IFNULL(p_ethnicity, ethnicity),
        birthdate = IFNULL(p_birthdate, birthdate),
        age = IFNULL(p_age, age),
        gender = IFNULL(p_gender, gender),
        nationality = IFNULL(p_nationality, nationality),
        origin = IFNULL(p_origin, origin)
      WHERE id = p_id;
      SELECT * FROM tourist WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeleteTourist(IN p_id CHAR(64))
    BEGIN
      DELETE FROM tourist WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetAllTourists()
    BEGIN
      SELECT t.*, u.email, u.phone_number, u.user_profile, u.is_verified, u.is_active
      FROM tourist t
      LEFT JOIN user u ON t.user_id = u.id
      ORDER BY t.first_name ASC;
    END;
  `);
}

/**
 * Drop tourist-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropTouristProcedures(sequelize) {
  const procedures = [
    'InsertTourist',
    'GetTouristById',
    'GetTouristByUserId',
    'UpdateTourist',
    'DeleteTourist',
    'GetAllTourists'
  ];

  for (const proc of procedures) {
    await sequelize.query(`DROP PROCEDURE IF EXISTS ${proc};`);
  }
}
