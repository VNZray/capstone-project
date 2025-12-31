/**
 * User Session Stored Procedures
 * Extracted from migration: 20251018000001-user-session-table.cjs
 *
 * Procedures:
 * - InsertUserSession: Insert a new user session
 * - GetUserSessionByToken: Get a valid (active, not expired) session by token
 * - GetActiveSessionsByUserId: Get all active sessions for a user
 * - UpdateSessionActivity: Update last activity timestamp for a session
 * - InvalidateSession: Invalidate a single session
 * - InvalidateAllUserSessions: Invalidate all sessions for a user
 * - CleanupExpiredSessions: Delete expired or inactive sessions
 */

/**
 * Create user session stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createUserSessionProcedures(sequelize) {
  // InsertUserSession - Insert a new user session
  await sequelize.query(`
    CREATE PROCEDURE InsertUserSession(
      IN p_user_id CHAR(64),
      IN p_session_token VARCHAR(500),
      IN p_device_info VARCHAR(255),
      IN p_ip_address VARCHAR(45),
      IN p_user_agent TEXT,
      IN p_expires_at DATETIME
    )
    BEGIN
      DECLARE new_id CHAR(64);
      SET new_id = UUID();
      INSERT INTO user_session (id, user_id, session_token, device_info, ip_address, user_agent, expires_at)
      VALUES (new_id, p_user_id, p_session_token, p_device_info, p_ip_address, p_user_agent, p_expires_at);
      SELECT * FROM user_session WHERE id = new_id;
    END;
  `);

  // GetUserSessionByToken - Get a valid session by token with user info
  await sequelize.query(`
    CREATE PROCEDURE GetUserSessionByToken(IN p_session_token VARCHAR(500))
    BEGIN
      SELECT us.*, u.email, u.role_id
      FROM user_session us
      JOIN user u ON us.user_id = u.id
      WHERE us.session_token = p_session_token AND us.is_active = true AND us.expires_at > NOW();
    END;
  `);

  // GetActiveSessionsByUserId - Get all active sessions for a user
  await sequelize.query(`
    CREATE PROCEDURE GetActiveSessionsByUserId(IN p_user_id CHAR(64))
    BEGIN
      SELECT * FROM user_session
      WHERE user_id = p_user_id AND is_active = true AND expires_at > NOW()
      ORDER BY last_activity DESC;
    END;
  `);

  // UpdateSessionActivity - Update last activity timestamp
  await sequelize.query(`
    CREATE PROCEDURE UpdateSessionActivity(IN p_session_token VARCHAR(500))
    BEGIN
      UPDATE user_session SET last_activity = NOW() WHERE session_token = p_session_token;
    END;
  `);

  // InvalidateSession - Invalidate a single session
  await sequelize.query(`
    CREATE PROCEDURE InvalidateSession(IN p_session_token VARCHAR(500))
    BEGIN
      UPDATE user_session SET is_active = false WHERE session_token = p_session_token;
    END;
  `);

  // InvalidateAllUserSessions - Invalidate all sessions for a user
  await sequelize.query(`
    CREATE PROCEDURE InvalidateAllUserSessions(IN p_user_id CHAR(64))
    BEGIN
      UPDATE user_session SET is_active = false WHERE user_id = p_user_id;
    END;
  `);

  // CleanupExpiredSessions - Delete expired or inactive sessions
  await sequelize.query(`
    CREATE PROCEDURE CleanupExpiredSessions()
    BEGIN
      DELETE FROM user_session WHERE expires_at < NOW() OR is_active = false;
    END;
  `);
}

/**
 * Drop user session stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropUserSessionProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertUserSession;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetUserSessionByToken;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetActiveSessionsByUserId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS UpdateSessionActivity;');
  await sequelize.query('DROP PROCEDURE IF EXISTS InvalidateSession;');
  await sequelize.query('DROP PROCEDURE IF EXISTS InvalidateAllUserSessions;');
  await sequelize.query('DROP PROCEDURE IF EXISTS CleanupExpiredSessions;');
}
