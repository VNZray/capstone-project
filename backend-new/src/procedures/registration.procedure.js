/**
 * Registration Stored Procedures
 * Extracted from 20250925000001-registration-table.cjs
 */

/**
 * Create all registration-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createRegistrationProcedures(sequelize) {
  await sequelize.query(`
    CREATE PROCEDURE InsertRegistration(
      IN p_user_id CHAR(64),
      IN p_registration_type ENUM('owner', 'tourism'),
      IN p_email VARCHAR(100),
      IN p_first_name VARCHAR(50),
      IN p_last_name VARCHAR(50),
      IN p_phone VARCHAR(20),
      IN p_business_name VARCHAR(100),
      IN p_business_type VARCHAR(50),
      IN p_business_address TEXT,
      IN p_documents JSON
    )
    BEGIN
      DECLARE new_id CHAR(64);
      SET new_id = UUID();
      INSERT INTO registration (id, user_id, registration_type, email, first_name, last_name, phone, business_name, business_type, business_address, documents)
      VALUES (new_id, p_user_id, p_registration_type, p_email, p_first_name, p_last_name, p_phone, p_business_name, p_business_type, p_business_address, p_documents);
      SELECT * FROM registration WHERE id = new_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetRegistrationById(IN p_id CHAR(64))
    BEGIN
      SELECT r.*, u.email AS reviewer_email
      FROM registration r
      LEFT JOIN user u ON r.reviewed_by = u.id
      WHERE r.id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetAllRegistrations()
    BEGIN
      SELECT * FROM registration ORDER BY created_at DESC;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetRegistrationsByStatus(IN p_status VARCHAR(20))
    BEGIN
      SELECT * FROM registration WHERE status = p_status ORDER BY created_at DESC;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetRegistrationsByType(IN p_registration_type VARCHAR(20))
    BEGIN
      SELECT * FROM registration WHERE registration_type = p_registration_type ORDER BY created_at DESC;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE ApproveRegistration(IN p_id CHAR(64), IN p_reviewed_by CHAR(64))
    BEGIN
      UPDATE registration SET
        status = 'approved',
        reviewed_by = p_reviewed_by,
        reviewed_at = NOW()
      WHERE id = p_id;
      SELECT * FROM registration WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE RejectRegistration(IN p_id CHAR(64), IN p_reviewed_by CHAR(64), IN p_rejection_reason TEXT)
    BEGIN
      UPDATE registration SET
        status = 'rejected',
        reviewed_by = p_reviewed_by,
        reviewed_at = NOW(),
        rejection_reason = p_rejection_reason
      WHERE id = p_id;
      SELECT * FROM registration WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeleteRegistration(IN p_id CHAR(64))
    BEGIN
      DELETE FROM registration WHERE id = p_id;
    END;
  `);
}

/**
 * Drop all registration-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropRegistrationProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertRegistration;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetRegistrationById;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetAllRegistrations;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetRegistrationsByStatus;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetRegistrationsByType;');
  await sequelize.query('DROP PROCEDURE IF EXISTS ApproveRegistration;');
  await sequelize.query('DROP PROCEDURE IF EXISTS RejectRegistration;');
  await sequelize.query('DROP PROCEDURE IF EXISTS DeleteRegistration;');
}
