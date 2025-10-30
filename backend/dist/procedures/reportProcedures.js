// reportProcedures.js
// Defines stored procedures related to the reporting module (report, report_status_history, report_attachment)

async function createReportProcedures(knex) {
  // ======================== FETCHING ========================

  // Get all reports with reporter details
  await knex.raw(`
    CREATE PROCEDURE GetAllReports()
    BEGIN
      SELECT 
        r.*, 
        u.email AS reporter_email,
        t.first_name AS reporter_first_name,
        t.last_name AS reporter_last_name,
        t.phone_number AS reporter_contact
      FROM report r
      JOIN user u ON r.reporter_id = u.id
      LEFT JOIN tourist t ON u.tourist_id = t.id
      ORDER BY r.created_at DESC;
    END;
  `);

  // Get single report by ID returning: report row, status history, attachments (3 result sets)
  await knex.raw(`
    CREATE PROCEDURE GetReportById(IN p_id CHAR(36))
    BEGIN
      -- Report details
      SELECT 
        r.*, 
        u.email AS reporter_email,
        t.first_name AS reporter_first_name,
        t.last_name AS reporter_last_name,
        t.phone_number AS reporter_contact
      FROM report r
      JOIN user u ON r.reporter_id = u.id
      LEFT JOIN tourist t ON u.tourist_id = t.id
      WHERE r.id = p_id;

      -- Status history
      SELECT 
        rsh.*, 
        u.email AS updated_by_email
      FROM report_status_history rsh
      LEFT JOIN user u ON rsh.updated_by = u.id
      WHERE rsh.report_id = p_id
      ORDER BY rsh.updated_at ASC;

      -- Attachments
      SELECT * FROM report_attachment
      WHERE report_id = p_id
      ORDER BY uploaded_at ASC;
    END;
  `);

  // Get reports by reporter
  await knex.raw(`
    CREATE PROCEDURE GetReportsByReporterId(IN p_reporter_id CHAR(36))
    BEGIN
      SELECT * FROM report 
      WHERE reporter_id = p_reporter_id
      ORDER BY created_at DESC;
    END;
  `);

  // Get reports by target entity
  await knex.raw(`
    CREATE PROCEDURE GetReportsByTarget(IN p_target_type VARCHAR(30), IN p_target_id VARCHAR(100))
    BEGIN
      SELECT 
        r.*, 
        u.email AS reporter_email
      FROM report r
      JOIN user u ON r.reporter_id = u.id
      WHERE r.target_type = p_target_type AND r.target_id = p_target_id
      ORDER BY r.created_at DESC;
    END;
  `);

  // Get reports by status
  await knex.raw(`
    CREATE PROCEDURE GetReportsByStatus(IN p_status VARCHAR(30))
    BEGIN
      SELECT 
        r.*, 
        u.email AS reporter_email
      FROM report r
      JOIN user u ON r.reporter_id = u.id
      WHERE r.status = p_status
      ORDER BY r.created_at DESC;
    END;
  `);

  // ======================== MUTATIONS ========================

  // Insert new report + initial status history (submitted)
  await knex.raw(`
    CREATE PROCEDURE InsertReport(
      IN p_id CHAR(36),
      IN p_reporter_id CHAR(36),
      IN p_target_type VARCHAR(30),
      IN p_target_id VARCHAR(100),
      IN p_title VARCHAR(100),
      IN p_description TEXT
    )
    BEGIN
      INSERT INTO report (id, reporter_id, target_type, target_id, title, description, status)
      VALUES (p_id, p_reporter_id, p_target_type, p_target_id, p_title, p_description, 'submitted');

      INSERT INTO report_status_history (id, report_id, status, remarks, updated_by)
      VALUES (UUID(), p_id, 'submitted', 'Report submitted by user', NULL);

      SELECT * FROM report WHERE id = p_id;
    END;
  `);

  // Update report status + insert status history; returns updated report row
  await knex.raw(`
    CREATE PROCEDURE UpdateReportStatus(
      IN p_id CHAR(36),
      IN p_status VARCHAR(30),
      IN p_remarks TEXT,
      IN p_updated_by CHAR(36)
    )
    BEGIN
      UPDATE report 
      SET status = p_status, updated_at = CURRENT_TIMESTAMP
      WHERE id = p_id;

      INSERT INTO report_status_history (id, report_id, status, remarks, updated_by)
      VALUES (UUID(), p_id, p_status, p_remarks, p_updated_by);

      SELECT * FROM report WHERE id = p_id;
    END;
  `);

  // Delete report
  await knex.raw(`
    CREATE PROCEDURE DeleteReport(IN p_id CHAR(36))
    BEGIN
      DELETE FROM report WHERE id = p_id;
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);
}

async function dropReportProcedures(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllReports;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetReportById;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetReportsByReporterId;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetReportsByTarget;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetReportsByStatus;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertReport;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateReportStatus;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteReport;");
}

export { createReportProcedures, dropReportProcedures };
