/**
 * Refresh Token Stored Procedures
 * Extracted from 20250930000001-refresh-tokens-table.cjs
 */

/**
 * Create all refresh token-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createRefreshTokenProcedures(sequelize) {
  // Note: GetUserByEmail is defined in user.procedure.js

  await sequelize.query(`
    CREATE PROCEDURE InsertRefreshToken(
      IN p_token_hash VARCHAR(255),
      IN p_user_id CHAR(64),
      IN p_expires_at TIMESTAMP,
      IN p_family_id CHAR(64)
    )
    BEGIN
      INSERT INTO refresh_tokens (token_hash, user_id, expires_at, family_id)
      VALUES (p_token_hash, p_user_id, p_expires_at, p_family_id);
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetRefreshToken(IN p_token_hash VARCHAR(255))
    BEGIN
      SELECT * FROM refresh_tokens WHERE token_hash = p_token_hash;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeleteRefreshToken(IN p_token_hash VARCHAR(255))
    BEGIN
      DELETE FROM refresh_tokens WHERE token_hash = p_token_hash;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE RevokeUserRefreshTokens(IN p_user_id CHAR(64))
    BEGIN
      UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = p_user_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE RevokeRefreshTokenFamily(IN p_family_id CHAR(64))
    BEGIN
      UPDATE refresh_tokens SET revoked = TRUE WHERE family_id = p_family_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE CleanupExpiredRefreshTokens(IN p_revoked_retention_days INT)
    BEGIN
      -- Delete expired tokens
      DELETE FROM refresh_tokens WHERE expires_at < NOW();

      -- Delete old revoked tokens (keep for audit trail)
      DELETE FROM refresh_tokens
      WHERE revoked = TRUE
      AND created_at < DATE_SUB(NOW(), INTERVAL p_revoked_retention_days DAY);

      -- Return count of remaining tokens
      SELECT COUNT(*) as remaining_tokens FROM refresh_tokens;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetRefreshTokenStats()
    BEGIN
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN revoked = FALSE AND expires_at > NOW() THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN revoked = TRUE THEN 1 ELSE 0 END) as revoked,
        SUM(CASE WHEN expires_at <= NOW() THEN 1 ELSE 0 END) as expired
      FROM refresh_tokens;
    END;
  `);
}

/**
 * Drop all refresh token-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropRefreshTokenProcedures(sequelize) {
  // Note: GetUserByEmail is managed in user.procedure.js
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertRefreshToken;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetRefreshToken;');
  await sequelize.query('DROP PROCEDURE IF EXISTS DeleteRefreshToken;');
  await sequelize.query('DROP PROCEDURE IF EXISTS RevokeUserRefreshTokens;');
  await sequelize.query('DROP PROCEDURE IF EXISTS RevokeRefreshTokenFamily;');
  await sequelize.query('DROP PROCEDURE IF EXISTS CleanupExpiredRefreshTokens;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetRefreshTokenStats;');
}
