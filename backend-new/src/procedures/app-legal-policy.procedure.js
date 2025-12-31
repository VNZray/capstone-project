/**
 * App Legal Policy Stored Procedures
 * Extracted from 20251008000001-app-legal-policies-table.cjs
 */

/**
 * Create all app legal policy-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createAppLegalPolicyProcedures(sequelize) {
  await sequelize.query(`
    CREATE PROCEDURE InsertAppLegalPolicy(
      IN p_policy_type ENUM('terms_of_service', 'privacy_policy', 'cookie_policy', 'community_guidelines', 'refund_policy', 'disclaimer'),
      IN p_title VARCHAR(255),
      IN p_content LONGTEXT,
      IN p_version VARCHAR(20),
      IN p_effective_date DATE,
      IN p_created_by CHAR(64)
    )
    BEGIN
      DECLARE new_id CHAR(64);
      SET new_id = UUID();
      INSERT INTO app_legal_policies (id, policy_type, title, content, version, effective_date, created_by)
      VALUES (new_id, p_policy_type, p_title, p_content, IFNULL(p_version, '1.0'), p_effective_date, p_created_by);
      SELECT * FROM app_legal_policies WHERE id = new_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetAppLegalPolicyById(IN p_id CHAR(64))
    BEGIN
      SELECT * FROM app_legal_policies WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetAppLegalPolicyByType(IN p_policy_type VARCHAR(50))
    BEGIN
      SELECT * FROM app_legal_policies WHERE policy_type = p_policy_type AND is_active = true;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetAllAppLegalPolicies()
    BEGIN
      SELECT * FROM app_legal_policies WHERE is_active = true ORDER BY policy_type;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateAppLegalPolicy(
      IN p_id CHAR(64),
      IN p_title VARCHAR(255),
      IN p_content LONGTEXT,
      IN p_version VARCHAR(20),
      IN p_effective_date DATE,
      IN p_is_active BOOLEAN
    )
    BEGIN
      UPDATE app_legal_policies SET
        title = IFNULL(p_title, title),
        content = IFNULL(p_content, content),
        version = IFNULL(p_version, version),
        effective_date = IFNULL(p_effective_date, effective_date),
        is_active = IFNULL(p_is_active, is_active)
      WHERE id = p_id;
      SELECT * FROM app_legal_policies WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeleteAppLegalPolicy(IN p_id CHAR(64))
    BEGIN
      DELETE FROM app_legal_policies WHERE id = p_id;
    END;
  `);
}

/**
 * Drop all app legal policy-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropAppLegalPolicyProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertAppLegalPolicy;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetAppLegalPolicyById;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetAppLegalPolicyByType;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetAllAppLegalPolicies;');
  await sequelize.query('DROP PROCEDURE IF EXISTS UpdateAppLegalPolicy;');
  await sequelize.query('DROP PROCEDURE IF EXISTS DeleteAppLegalPolicy;');
}
