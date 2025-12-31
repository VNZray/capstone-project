/**
 * Service Inquiry Stored Procedures
 * Handles service inquiry operations
 */

/**
 * Create service inquiry stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createServiceInquiryProcedures(sequelize) {
  // Insert a new service inquiry
  await sequelize.query(`
    CREATE PROCEDURE InsertServiceInquiry(
      IN p_business_id CHAR(64),
      IN p_service_id CHAR(64),
      IN p_tourist_id CHAR(64),
      IN p_name VARCHAR(100),
      IN p_email VARCHAR(100),
      IN p_phone VARCHAR(20),
      IN p_message TEXT,
      IN p_preferred_date DATETIME
    )
    BEGIN
      DECLARE new_id CHAR(64);
      SET new_id = UUID();
      INSERT INTO service_inquiry (id, business_id, service_id, tourist_id, name, email, phone, message, preferred_date)
      VALUES (new_id, p_business_id, p_service_id, p_tourist_id, p_name, p_email, p_phone, p_message, p_preferred_date);
      SELECT * FROM service_inquiry WHERE id = new_id;
    END;
  `);

  // Get service inquiry by ID
  await sequelize.query(`
    CREATE PROCEDURE GetServiceInquiryById(IN p_id CHAR(64))
    BEGIN
      SELECT si.*, s.name AS service_name, b.name AS business_name
      FROM service_inquiry si
      LEFT JOIN service s ON si.service_id = s.id
      LEFT JOIN business b ON si.business_id = b.id
      WHERE si.id = p_id;
    END;
  `);

  // Get service inquiries by business ID
  await sequelize.query(`
    CREATE PROCEDURE GetServiceInquiriesByBusinessId(IN p_business_id CHAR(64))
    BEGIN
      SELECT si.*, s.name AS service_name
      FROM service_inquiry si
      LEFT JOIN service s ON si.service_id = s.id
      WHERE si.business_id = p_business_id
      ORDER BY si.created_at DESC;
    END;
  `);

  // Update service inquiry status
  await sequelize.query(`
    CREATE PROCEDURE UpdateServiceInquiryStatus(
      IN p_id CHAR(64),
      IN p_status ENUM('pending', 'contacted', 'scheduled', 'completed', 'cancelled'),
      IN p_notes TEXT
    )
    BEGIN
      UPDATE service_inquiry SET
        status = p_status,
        notes = IFNULL(p_notes, notes)
      WHERE id = p_id;
      SELECT * FROM service_inquiry WHERE id = p_id;
    END;
  `);

  // Delete service inquiry
  await sequelize.query(`
    CREATE PROCEDURE DeleteServiceInquiry(IN p_id CHAR(64))
    BEGIN
      DELETE FROM service_inquiry WHERE id = p_id;
    END;
  `);
}

/**
 * Drop service inquiry stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropServiceInquiryProcedures(sequelize) {
  const procedures = [
    'InsertServiceInquiry',
    'GetServiceInquiryById',
    'GetServiceInquiriesByBusinessId',
    'UpdateServiceInquiryStatus',
    'DeleteServiceInquiry'
  ];

  for (const proc of procedures) {
    await sequelize.query(`DROP PROCEDURE IF EXISTS ${proc};`);
  }
}
