/**
 * Report Stored Procedures
 * CRUD operations for report table
 */

/**
 * Create all report stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createReportProcedures(sequelize) {
  // InsertReport - Create a new report
  await sequelize.query(`
    CREATE PROCEDURE InsertReport(
      IN p_id CHAR(64),
      IN p_reporter_id CHAR(64),
      IN p_target_type ENUM('business', 'event', 'tourist_spot', 'accommodation'),
      IN p_target_id VARCHAR(64),
      IN p_title VARCHAR(100),
      IN p_description TEXT,
      IN p_status ENUM('submitted', 'under_review', 'in_progress', 'resolved', 'rejected')
    )
    BEGIN
      INSERT INTO report (id, reporter_id, target_type, target_id, title, description, status)
      VALUES (p_id, p_reporter_id, p_target_type, p_target_id, p_title, p_description, IFNULL(p_status, 'submitted'));
      SELECT * FROM report WHERE id = p_id;
    END;
  `);

  // GetReportById - Get report by ID with reporter info
  await sequelize.query(`
    CREATE PROCEDURE GetReportById(IN p_id CHAR(64))
    BEGIN
      SELECT r.*, u.email AS reporter_email
      FROM report r
      LEFT JOIN user u ON r.reporter_id = u.id
      WHERE r.id = p_id;
    END;
  `);

  // GetReportsByReporterId - Get all reports by a reporter
  await sequelize.query(`
    CREATE PROCEDURE GetReportsByReporterId(IN p_reporter_id CHAR(64))
    BEGIN
      SELECT * FROM report WHERE reporter_id = p_reporter_id ORDER BY created_at DESC;
    END;
  `);

  // GetReportsByTargetTypeAndId - Get reports for a specific target
  await sequelize.query(`
    CREATE PROCEDURE GetReportsByTargetTypeAndId(IN p_target_type VARCHAR(20), IN p_target_id VARCHAR(64))
    BEGIN
      SELECT r.*, u.email AS reporter_email
      FROM report r
      LEFT JOIN user u ON r.reporter_id = u.id
      WHERE r.target_type = p_target_type AND r.target_id = p_target_id
      ORDER BY r.created_at DESC;
    END;
  `);

  // UpdateReport - Update report details
  await sequelize.query(`
    CREATE PROCEDURE UpdateReport(
      IN p_id CHAR(64),
      IN p_title VARCHAR(100),
      IN p_description TEXT,
      IN p_status ENUM('submitted', 'under_review', 'in_progress', 'resolved', 'rejected')
    )
    BEGIN
      UPDATE report SET
        title = IFNULL(p_title, title),
        description = IFNULL(p_description, description),
        status = IFNULL(p_status, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = p_id;
      SELECT * FROM report WHERE id = p_id;
    END;
  `);

  // UpdateReportStatus - Update only the status
  await sequelize.query(`
    CREATE PROCEDURE UpdateReportStatus(IN p_id CHAR(64), IN p_status ENUM('submitted', 'under_review', 'in_progress', 'resolved', 'rejected'))
    BEGIN
      UPDATE report SET status = p_status, updated_at = CURRENT_TIMESTAMP WHERE id = p_id;
      SELECT * FROM report WHERE id = p_id;
    END;
  `);

  // DeleteReport - Delete a report
  await sequelize.query(`
    CREATE PROCEDURE DeleteReport(IN p_id CHAR(64))
    BEGIN
      DELETE FROM report WHERE id = p_id;
    END;
  `);

  // GetAllReports - Get all reports with reporter info
  await sequelize.query(`
    CREATE PROCEDURE GetAllReports()
    BEGIN
      SELECT r.*, u.email AS reporter_email
      FROM report r
      LEFT JOIN user u ON r.reporter_id = u.id
      ORDER BY r.created_at DESC;
    END;
  `);

  // GetReportsByStatus - Get reports filtered by status
  await sequelize.query(`
    CREATE PROCEDURE GetReportsByStatus(IN p_status VARCHAR(20))
    BEGIN
      SELECT r.*, u.email AS reporter_email
      FROM report r
      LEFT JOIN user u ON r.reporter_id = u.id
      WHERE r.status = p_status
      ORDER BY r.created_at DESC;
    END;
  `);
}

/**
 * Drop all report stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropReportProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertReport;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetReportById;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetReportsByReporterId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetReportsByTargetTypeAndId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS UpdateReport;');
  await sequelize.query('DROP PROCEDURE IF EXISTS UpdateReportStatus;');
  await sequelize.query('DROP PROCEDURE IF EXISTS DeleteReport;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetAllReports;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetReportsByStatus;');
}
