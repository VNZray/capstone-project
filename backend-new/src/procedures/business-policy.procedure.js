/**
 * Business Policy Stored Procedures
 * Extracted from 20251007000001-business-policies-table.cjs
 */

/**
 * Create all business policy-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createBusinessPolicyProcedures(sequelize) {
  await sequelize.query(`
    CREATE PROCEDURE InsertBusinessPolicy(
      IN p_business_id CHAR(64),
      IN p_policy_type ENUM('cancellation', 'refund', 'privacy', 'terms', 'booking', 'payment', 'other'),
      IN p_title VARCHAR(255),
      IN p_content TEXT
    )
    BEGIN
      DECLARE new_id CHAR(64);
      SET new_id = UUID();
      INSERT INTO business_policies (id, business_id, policy_type, title, content)
      VALUES (new_id, p_business_id, p_policy_type, p_title, p_content);
      SELECT * FROM business_policies WHERE id = new_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetBusinessPolicyById(IN p_id CHAR(64))
    BEGIN
      SELECT * FROM business_policies WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetBusinessPoliciesByBusinessId(IN p_business_id CHAR(64))
    BEGIN
      SELECT * FROM business_policies WHERE business_id = p_business_id AND is_active = true ORDER BY policy_type;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetBusinessPolicyByType(
      IN p_business_id CHAR(64),
      IN p_policy_type VARCHAR(50)
    )
    BEGIN
      SELECT * FROM business_policies
      WHERE business_id = p_business_id AND policy_type = p_policy_type AND is_active = true
      ORDER BY version DESC
      LIMIT 1;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateBusinessPolicy(
      IN p_id CHAR(64),
      IN p_title VARCHAR(255),
      IN p_content TEXT,
      IN p_is_active BOOLEAN
    )
    BEGIN
      DECLARE current_version INT;
      SELECT version INTO current_version FROM business_policies WHERE id = p_id;

      UPDATE business_policies SET
        title = IFNULL(p_title, title),
        content = IFNULL(p_content, content),
        is_active = IFNULL(p_is_active, is_active),
        version = current_version + 1
      WHERE id = p_id;
      SELECT * FROM business_policies WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeleteBusinessPolicy(IN p_id CHAR(64))
    BEGIN
      DELETE FROM business_policies WHERE id = p_id;
    END;
  `);
}

/**
 * Drop all business policy-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropBusinessPolicyProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertBusinessPolicy;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetBusinessPolicyById;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetBusinessPoliciesByBusinessId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetBusinessPolicyByType;');
  await sequelize.query('DROP PROCEDURE IF EXISTS UpdateBusinessPolicy;');
  await sequelize.query('DROP PROCEDURE IF EXISTS DeleteBusinessPolicy;');
}
