async function createRefreshTokenProcedures(knex) {
  // Get User By Email (for login)
  await knex.raw(`
    CREATE PROCEDURE GetUserByEmail(IN p_email VARCHAR(40))
    BEGIN
      SELECT * FROM user WHERE email = p_email;
    END;
  `);

  // Insert Refresh Token
  await knex.raw(`
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

  // Get Refresh Token
  await knex.raw(`
    CREATE PROCEDURE GetRefreshToken(IN p_token_hash VARCHAR(255))
    BEGIN
      SELECT * FROM refresh_tokens WHERE token_hash = p_token_hash;
    END;
  `);

  // Delete Refresh Token (Logout)
  await knex.raw(`
    CREATE PROCEDURE DeleteRefreshToken(IN p_token_hash VARCHAR(255))
    BEGIN
      DELETE FROM refresh_tokens WHERE token_hash = p_token_hash;
    END;
  `);

  // Revoke User's Tokens (Security event)
  await knex.raw(`
    CREATE PROCEDURE RevokeUserRefreshTokens(IN p_user_id CHAR(64))
    BEGIN
      UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = p_user_id;
    END;
  `);

  // Revoke Family (Rotation reuse detection)
  await knex.raw(`
    CREATE PROCEDURE RevokeRefreshTokenFamily(IN p_family_id CHAR(64))
    BEGIN
      UPDATE refresh_tokens SET revoked = TRUE WHERE family_id = p_family_id;
    END;
  `);

  // Cleanup Expired Tokens (for scheduled maintenance)
  await knex.raw(`
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

  // Get Token Statistics (for monitoring)
  await knex.raw(`
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

async function dropRefreshTokenProcedures(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS GetUserByEmail;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertRefreshToken;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetRefreshToken;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteRefreshToken;");
  await knex.raw("DROP PROCEDURE IF EXISTS RevokeUserRefreshTokens;");
  await knex.raw("DROP PROCEDURE IF EXISTS RevokeRefreshTokenFamily;");
}

export { createRefreshTokenProcedures, dropRefreshTokenProcedures };

