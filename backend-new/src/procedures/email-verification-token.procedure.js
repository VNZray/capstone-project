/**
 * Email Verification Token Stored Procedures
 * Extracted from migration: 20251016000001-email-verification-token-table.cjs
 *
 * Procedures:
 * - InsertEmailVerificationToken: Insert a new email verification token (invalidates existing unused tokens)
 * - GetEmailVerificationTokenByToken: Get a valid (unused, not expired) email verification token
 * - UseEmailVerificationToken: Mark an email verification token as used
 * - CleanupExpiredEmailVerificationTokens: Delete expired or used tokens
 */

/**
 * Create email verification token stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createEmailVerificationTokenProcedures(sequelize) {
  // InsertEmailVerificationToken - Insert a new email verification token
  await sequelize.query(`
    CREATE PROCEDURE InsertEmailVerificationToken(
      IN p_user_id CHAR(64),
      IN p_email VARCHAR(100),
      IN p_token VARCHAR(255),
      IN p_expires_at DATETIME
    )
    BEGIN
      DECLARE new_id CHAR(64);
      SET new_id = UUID();

      -- Invalidate any existing unused tokens for this user and email
      UPDATE email_verification_token SET is_used = true WHERE user_id = p_user_id AND email = p_email AND is_used = false;

      INSERT INTO email_verification_token (id, user_id, email, token, expires_at)
      VALUES (new_id, p_user_id, p_email, p_token, p_expires_at);
      SELECT * FROM email_verification_token WHERE id = new_id;
    END;
  `);

  // GetEmailVerificationTokenByToken - Get a valid email verification token
  await sequelize.query(`
    CREATE PROCEDURE GetEmailVerificationTokenByToken(IN p_token VARCHAR(255))
    BEGIN
      SELECT evt.*, u.email AS current_email
      FROM email_verification_token evt
      JOIN user u ON evt.user_id = u.id
      WHERE evt.token = p_token AND evt.is_used = false AND evt.expires_at > NOW();
    END;
  `);

  // UseEmailVerificationToken - Mark a token as used
  await sequelize.query(`
    CREATE PROCEDURE UseEmailVerificationToken(IN p_token VARCHAR(255))
    BEGIN
      UPDATE email_verification_token SET is_used = true, used_at = NOW() WHERE token = p_token;
      SELECT * FROM email_verification_token WHERE token = p_token;
    END;
  `);

  // CleanupExpiredEmailVerificationTokens - Delete expired or used tokens
  await sequelize.query(`
    CREATE PROCEDURE CleanupExpiredEmailVerificationTokens()
    BEGIN
      DELETE FROM email_verification_token WHERE expires_at < NOW() OR is_used = true;
    END;
  `);
}

/**
 * Drop email verification token stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropEmailVerificationTokenProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertEmailVerificationToken;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetEmailVerificationTokenByToken;');
  await sequelize.query('DROP PROCEDURE IF EXISTS UseEmailVerificationToken;');
  await sequelize.query('DROP PROCEDURE IF EXISTS CleanupExpiredEmailVerificationTokens;');
}
