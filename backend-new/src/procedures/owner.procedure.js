/**
 * Owner Stored Procedures
 * Handles business owner entity operations
 */

/**
 * Create owner-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createOwnerProcedures(sequelize) {
  await sequelize.query(`
    CREATE PROCEDURE InsertOwner(
      IN p_id CHAR(64),
      IN p_first_name VARCHAR(30),
      IN p_middle_name VARCHAR(20),
      IN p_last_name VARCHAR(30),
      IN p_age INT,
      IN p_birthdate DATE,
      IN p_gender ENUM('Male', 'Female'),
      IN p_user_id CHAR(64)
    )
    BEGIN
      INSERT INTO owner (id, first_name, middle_name, last_name, age, birthdate, gender, user_id)
      VALUES (p_id, p_first_name, p_middle_name, p_last_name, p_age, p_birthdate, p_gender, p_user_id);
      SELECT * FROM owner WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetOwnerById(IN p_id CHAR(64))
    BEGIN
      SELECT o.*, u.email, u.phone_number, u.user_profile, u.is_verified, u.is_active
      FROM owner o
      LEFT JOIN user u ON o.user_id = u.id
      WHERE o.id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetOwnerByUserId(IN p_user_id CHAR(64))
    BEGIN
      SELECT o.*, u.email, u.phone_number, u.user_profile, u.is_verified, u.is_active
      FROM owner o
      LEFT JOIN user u ON o.user_id = u.id
      WHERE o.user_id = p_user_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateOwner(
      IN p_id CHAR(64),
      IN p_first_name VARCHAR(30),
      IN p_middle_name VARCHAR(20),
      IN p_last_name VARCHAR(30),
      IN p_age INT,
      IN p_birthdate DATE,
      IN p_gender ENUM('Male', 'Female')
    )
    BEGIN
      UPDATE owner SET
        first_name = IFNULL(p_first_name, first_name),
        middle_name = p_middle_name,
        last_name = IFNULL(p_last_name, last_name),
        age = IFNULL(p_age, age),
        birthdate = IFNULL(p_birthdate, birthdate),
        gender = IFNULL(p_gender, gender)
      WHERE id = p_id;
      SELECT * FROM owner WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeleteOwner(IN p_id CHAR(64))
    BEGIN
      DELETE FROM owner WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetAllOwners()
    BEGIN
      SELECT o.*, u.email, u.phone_number, u.user_profile, u.is_verified, u.is_active
      FROM owner o
      LEFT JOIN user u ON o.user_id = u.id
      ORDER BY o.first_name ASC;
    END;
  `);
}

/**
 * Drop owner-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropOwnerProcedures(sequelize) {
  const procedures = [
    'InsertOwner',
    'GetOwnerById',
    'GetOwnerByUserId',
    'UpdateOwner',
    'DeleteOwner',
    'GetAllOwners'
  ];

  for (const proc of procedures) {
    await sequelize.query(`DROP PROCEDURE IF EXISTS ${proc};`);
  }
}
