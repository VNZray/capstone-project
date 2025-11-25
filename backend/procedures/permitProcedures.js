async function createPermitProcedures(knex) {
  // Get all permits
  await knex.raw(`
    CREATE PROCEDURE GetAllPermits()
    BEGIN
      SELECT * FROM permit;
    END;
  `);

  // Get permit by business ID
  await knex.raw(`
    CREATE PROCEDURE GetPermitByBusinessId(IN p_business_id CHAR(64))
    BEGIN
      SELECT * FROM permit WHERE business_id = p_business_id;
    END;
  `);

  // Get permit by ID
  await knex.raw(`
    CREATE PROCEDURE GetPermitById(IN p_id CHAR(64))
    BEGIN
      SELECT * FROM permit WHERE id = p_id;
    END;
  `);

  // Insert permit
  await knex.raw(`
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
      INSERT INTO permit (
        id, business_id, permit_type, file_url, file_format, file_size, status, expiration_date
      ) VALUES (
        p_id, p_business_id, p_permit_type, p_file_url, p_file_format, p_file_size, p_status, p_expiration_date
      );
      SELECT * FROM permit WHERE id = p_id;
    END;
  `);

  // Update permit (all fields optional)
  await knex.raw(`
    CREATE PROCEDURE UpdatePermit(
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
      UPDATE permit SET
        business_id = IFNULL(p_business_id, business_id),
        permit_type = IFNULL(p_permit_type, permit_type),
        file_url = IFNULL(p_file_url, file_url),
        file_format = IFNULL(p_file_format, file_format),
        file_size = IFNULL(p_file_size, file_size),
        status = IFNULL(p_status, status),
        expiration_date = IFNULL(p_expiration_date, expiration_date)
      WHERE id = p_id;
      SELECT * FROM permit WHERE id = p_id;
    END;
  `);

  // Delete permit
  await knex.raw(`
    CREATE PROCEDURE DeletePermit(IN p_id CHAR(64))
    BEGIN
      DELETE FROM permit WHERE id = p_id;
    END;
  `);
}

async function dropPermitProcedures(knex) {

}

export { createPermitProcedures, dropPermitProcedures };
