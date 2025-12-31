/**
 * Audit Log Stored Procedures
 * Extracted from 20251012000001-audit-log-table.cjs
 */

/**
 * Create audit log stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createAuditLogProcedures(sequelize) {
  // InsertAuditLog - Insert a new audit log entry
  await sequelize.query(`
    CREATE PROCEDURE InsertAuditLog(
      IN p_user_id CHAR(64),
      IN p_action VARCHAR(100),
      IN p_entity_type VARCHAR(50),
      IN p_entity_id VARCHAR(64),
      IN p_old_values JSON,
      IN p_new_values JSON,
      IN p_ip_address VARCHAR(45),
      IN p_user_agent TEXT,
      IN p_metadata JSON
    )
    BEGIN
      DECLARE new_id CHAR(64);
      SET new_id = UUID();
      INSERT INTO audit_log (id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, metadata)
      VALUES (new_id, p_user_id, p_action, p_entity_type, p_entity_id, p_old_values, p_new_values, p_ip_address, p_user_agent, p_metadata);
      SELECT * FROM audit_log WHERE id = new_id;
    END;
  `);

  // GetAuditLogById - Get audit log entry by ID
  await sequelize.query(`
    CREATE PROCEDURE GetAuditLogById(IN p_id CHAR(64))
    BEGIN
      SELECT al.*, u.email AS user_email
      FROM audit_log al
      LEFT JOIN user u ON al.user_id = u.id
      WHERE al.id = p_id;
    END;
  `);

  // GetAuditLogsByUserId - Get audit logs by user with pagination
  await sequelize.query(`
    CREATE PROCEDURE GetAuditLogsByUserId(IN p_user_id CHAR(64), IN p_limit INT, IN p_offset INT)
    BEGIN
      SELECT * FROM audit_log
      WHERE user_id = p_user_id
      ORDER BY created_at DESC
      LIMIT p_limit OFFSET p_offset;
    END;
  `);

  // GetAuditLogsByEntity - Get audit logs by entity type and ID
  await sequelize.query(`
    CREATE PROCEDURE GetAuditLogsByEntity(IN p_entity_type VARCHAR(50), IN p_entity_id VARCHAR(64))
    BEGIN
      SELECT al.*, u.email AS user_email
      FROM audit_log al
      LEFT JOIN user u ON al.user_id = u.id
      WHERE al.entity_type = p_entity_type AND al.entity_id = p_entity_id
      ORDER BY al.created_at DESC;
    END;
  `);

  // GetAuditLogsByAction - Get audit logs by action with pagination
  await sequelize.query(`
    CREATE PROCEDURE GetAuditLogsByAction(IN p_action VARCHAR(100), IN p_limit INT, IN p_offset INT)
    BEGIN
      SELECT al.*, u.email AS user_email
      FROM audit_log al
      LEFT JOIN user u ON al.user_id = u.id
      WHERE al.action = p_action
      ORDER BY al.created_at DESC
      LIMIT p_limit OFFSET p_offset;
    END;
  `);

  // GetRecentAuditLogs - Get most recent audit logs
  await sequelize.query(`
    CREATE PROCEDURE GetRecentAuditLogs(IN p_limit INT)
    BEGIN
      SELECT al.*, u.email AS user_email
      FROM audit_log al
      LEFT JOIN user u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT p_limit;
    END;
  `);

  // CleanupOldAuditLogs - Delete audit logs older than specified days
  await sequelize.query(`
    CREATE PROCEDURE CleanupOldAuditLogs(IN p_days_old INT)
    BEGIN
      DELETE FROM audit_log WHERE created_at < DATE_SUB(NOW(), INTERVAL p_days_old DAY);
    END;
  `);
}

/**
 * Drop audit log stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropAuditLogProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertAuditLog;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetAuditLogById;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetAuditLogsByUserId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetAuditLogsByEntity;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetAuditLogsByAction;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetRecentAuditLogs;');
  await sequelize.query('DROP PROCEDURE IF EXISTS CleanupOldAuditLogs;');
}
