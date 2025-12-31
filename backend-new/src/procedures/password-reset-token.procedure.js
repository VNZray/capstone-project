/**
 * Password Reset Token Stored Procedures
 * Extracted from migration: 20251015000001-password-reset-token-table.cjs
 *
 * Procedures:
 * - InsertPasswordResetToken: Insert a new password reset token (invalidates existing unused tokens)
 * - GetPasswordResetTokenByToken: Get a valid (unused, not expired) password reset token
 * - UsePasswordResetToken: Mark a password reset token as used
 * - CleanupExpiredPasswordResetTokens: Delete expired or used tokens
 */

/**
 * Create password reset token stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createPasswordResetTokenProcedures(sequelize) {
  // InsertPasswordResetToken - Insert a new password reset token
  await sequelize.query(`
    CREATE PROCEDURE InsertPasswordResetToken(
      IN p_user_id CHAR(64),
      IN p_token VARCHAR(255),
      IN p_expires_at DATETIME
    )
    BEGIN
      DECLARE new_id CHAR(64);
      SET new_id = UUID();

      -- Invalidate any existing unused tokens for this user
      UPDATE password_reset_token SET is_used = true WHERE user_id = p_user_id AND is_used = false;

      INSERT INTO password_reset_token (id, user_id, token, expires_at)
      VALUES (new_id, p_user_id, p_token, p_expires_at);
      SELECT * FROM password_reset_token WHERE id = new_id;
    END;
  `);

  // GetPasswordResetTokenByToken - Get a valid password reset token
  await sequelize.query(`
    CREATE PROCEDURE GetPasswordResetTokenByToken(IN p_token VARCHAR(255))
    BEGIN
      SELECT prt.*, u.email
      FROM password_reset_token prt
      JOIN user u ON prt.user_id = u.id
      WHERE prt.token = p_token AND prt.is_used = false AND prt.expires_at > NOW();
    END;
  `);

  // UsePasswordResetToken - Mark a token as used
  await sequelize.query(`
    CREATE PROCEDURE UsePasswordResetToken(IN p_token VARCHAR(255))
    BEGIN
      UPDATE password_reset_token SET is_used = true, used_at = NOW() WHERE token = p_token;
      SELECT * FROM password_reset_token WHERE token = p_token;
    END;
  `);

  // CleanupExpiredPasswordResetTokens - Delete expired or used tokens
  await sequelize.query(`
    CREATE PROCEDURE CleanupExpiredPasswordResetTokens()
    BEGIN
      DELETE FROM password_reset_token WHERE expires_at < NOW() OR is_used = true;
    END;
  `);
}

/**
 * Drop password reset token stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropPasswordResetTokenProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertPasswordResetToken;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetPasswordResetTokenByToken;');
  await sequelize.query('DROP PROCEDURE IF EXISTS UsePasswordResetToken;');
  await sequelize.query('DROP PROCEDURE IF EXISTS CleanupExpiredPasswordResetTokens;');
}
