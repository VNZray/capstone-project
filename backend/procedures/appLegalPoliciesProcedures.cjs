/**
 * Stored Procedures for App Legal Policies
 * Platform-wide Terms & Conditions and Privacy Policy
 */

async function createAppLegalPoliciesProcedures(knex) {
  // Get the current legal policies
  await knex.raw(`
    CREATE PROCEDURE GetAppLegalPolicies()
    BEGIN
      SELECT * FROM app_legal_policies WHERE is_active = true ORDER BY updated_at DESC LIMIT 1;
    END;
  `);

  // Get legal policies history (all versions)
  await knex.raw(`
    CREATE PROCEDURE GetAppLegalPoliciesHistory()
    BEGIN
      SELECT * FROM app_legal_policies ORDER BY version DESC;
    END;
  `);

  // Update legal policies (creates new version)
  await knex.raw(`
    CREATE PROCEDURE UpdateAppLegalPolicies(
      IN p_terms_and_conditions TEXT,
      IN p_privacy_policy TEXT,
      IN p_updated_by CHAR(36)
    )
    BEGIN
      DECLARE current_version INT DEFAULT 0;

      -- Get current version
      SELECT COALESCE(MAX(version), 0) INTO current_version FROM app_legal_policies;

      -- Deactivate previous version
      UPDATE app_legal_policies SET is_active = false WHERE is_active = true;

      -- Insert new version
      INSERT INTO app_legal_policies (
        id, terms_and_conditions, privacy_policy, version, is_active, updated_by
      ) VALUES (
        UUID(), p_terms_and_conditions, p_privacy_policy, current_version + 1, true, p_updated_by
      );

      SELECT * FROM app_legal_policies WHERE is_active = true;
    END;
  `);

  // Get specific version
  await knex.raw(`
    CREATE PROCEDURE GetAppLegalPoliciesByVersion(IN p_version INT)
    BEGIN
      SELECT * FROM app_legal_policies WHERE version = p_version;
    END;
  `);
}

async function dropAppLegalPoliciesProcedures(knex) {
  const procedures = [
    "GetAppLegalPolicies",
    "GetAppLegalPoliciesHistory",
    "UpdateAppLegalPolicies",
    "GetAppLegalPoliciesByVersion"
  ];

  for (const procedure of procedures) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${procedure}`);
  }
}

module.exports = { createAppLegalPoliciesProcedures, dropAppLegalPoliciesProcedures };
