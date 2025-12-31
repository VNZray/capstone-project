/**
 * Permit Stored Procedures
 * Handles permit entity operations
 */

/**
 * Create permit-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createPermitProcedures(sequelize) {
  await sequelize.query(`
    CREATE PROCEDURE InsertPermit(
      IN p_id CHAR(64),
      IN p_business_id CHAR(64),
      IN p_permit_type VARCHAR(100),
      IN p_file_url TEXT,
      IN p_file_format VARCHAR(10),
      IN p_file_size BIGINT,
      IN p_status VARCHAR(50),
      IN p_expiration_date DATE
    )
    BEGIN
      INSERT INTO permit (id, business_id, permit_type, file_url, file_format, file_size, status, expiration_date)
      VALUES (p_id, p_business_id, p_permit_type, p_file_url, p_file_format, p_file_size, IFNULL(p_status, 'pending'), p_expiration_date);
      SELECT * FROM permit WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetPermitById(IN p_id CHAR(64))
    BEGIN
      SELECT p.*, b.business_name
      FROM permit p
      LEFT JOIN business b ON p.business_id = b.id
      WHERE p.id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetPermitsByBusinessId(IN p_business_id CHAR(64))
    BEGIN
      SELECT p.*, b.business_name
      FROM permit p
      LEFT JOIN business b ON p.business_id = b.id
      WHERE p.business_id = p_business_id
      ORDER BY p.submitted_at DESC;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdatePermit(
      IN p_id CHAR(64),
      IN p_permit_type VARCHAR(100),
      IN p_file_url TEXT,
      IN p_file_format VARCHAR(10),
      IN p_file_size BIGINT,
      IN p_status VARCHAR(50),
      IN p_expiration_date DATE,
      IN p_approved_at TIMESTAMP
    )
    BEGIN
      UPDATE permit SET
        permit_type = IFNULL(p_permit_type, permit_type),
        file_url = IFNULL(p_file_url, file_url),
        file_format = IFNULL(p_file_format, file_format),
        file_size = IFNULL(p_file_size, file_size),
        status = IFNULL(p_status, status),
        expiration_date = IFNULL(p_expiration_date, expiration_date),
        approved_at = p_approved_at
      WHERE id = p_id;
      SELECT * FROM permit WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdatePermitStatus(IN p_id CHAR(64), IN p_status VARCHAR(50))
    BEGIN
      UPDATE permit SET
        status = p_status,
        approved_at = CASE WHEN p_status = 'approved' THEN CURRENT_TIMESTAMP ELSE approved_at END
      WHERE id = p_id;
      SELECT * FROM permit WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeletePermit(IN p_id CHAR(64))
    BEGIN
      DELETE FROM permit WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetAllPermits()
    BEGIN
      SELECT p.*, b.business_name
      FROM permit p
      LEFT JOIN business b ON p.business_id = b.id
      ORDER BY p.submitted_at DESC;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetPendingPermits()
    BEGIN
      SELECT p.*, b.business_name
      FROM permit p
      LEFT JOIN business b ON p.business_id = b.id
      WHERE p.status = 'pending'
      ORDER BY p.submitted_at DESC;
    END;
  `);
}

/**
 * Drop permit-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropPermitProcedures(sequelize) {
  const procedures = [
    'InsertPermit',
    'GetPermitById',
    'GetPermitsByBusinessId',
    'UpdatePermit',
    'UpdatePermitStatus',
    'DeletePermit',
    'GetAllPermits',
    'GetPendingPermits'
  ];

  for (const proc of procedures) {
    await sequelize.query(`DROP PROCEDURE IF EXISTS ${proc};`);
  }
}
