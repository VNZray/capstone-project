async function createBusinessPoliciesProcedures(knex) {
  // ==================== BUSINESS POLICIES ====================

  // Get business policies by business ID
  await knex.raw(`
    CREATE PROCEDURE GetBusinessPolicies(IN p_businessId CHAR(36))
    BEGIN
      SELECT * FROM business_policies WHERE business_id = p_businessId AND is_active = true;
    END;
  `);

  // Get all business policies (admin)
  await knex.raw(`
    CREATE PROCEDURE GetAllBusinessPolicies()
    BEGIN
      SELECT bp.*, b.business_name
      FROM business_policies bp
      JOIN business b ON bp.business_id = b.id
      ORDER BY bp.updated_at DESC;
    END;
  `);

  // Insert or update business policies (upsert)
  await knex.raw(`
    CREATE PROCEDURE UpsertBusinessPolicies(
      IN p_business_id CHAR(36),
      IN p_check_in_time TIME,
      IN p_check_out_time TIME,
      IN p_quiet_hours_start TIME,
      IN p_quiet_hours_end TIME,
      IN p_pets_allowed BOOLEAN,
      IN p_smoking_allowed BOOLEAN,
      IN p_parties_allowed BOOLEAN,
      IN p_children_allowed BOOLEAN,
      IN p_visitors_allowed BOOLEAN,
      IN p_max_guests_per_room INT,
      IN p_minimum_age_requirement INT,
      IN p_cancellation_policy TEXT,
      IN p_refund_policy TEXT,
      IN p_payment_policy TEXT,
      IN p_damage_policy TEXT,
      IN p_pet_policy TEXT,
      IN p_smoking_policy TEXT,
      IN p_additional_rules TEXT,
      IN p_terms_and_conditions TEXT,
      IN p_privacy_policy TEXT
    )
    BEGIN
      DECLARE existing_id CHAR(36);

      -- Check if policies already exist for this business
      SELECT id INTO existing_id FROM business_policies WHERE business_id = p_business_id LIMIT 1;

      IF existing_id IS NOT NULL THEN
        -- Update existing policies
        UPDATE business_policies SET
          check_in_time = IFNULL(p_check_in_time, check_in_time),
          check_out_time = IFNULL(p_check_out_time, check_out_time),
          quiet_hours_start = p_quiet_hours_start,
          quiet_hours_end = p_quiet_hours_end,
          pets_allowed = IFNULL(p_pets_allowed, pets_allowed),
          smoking_allowed = IFNULL(p_smoking_allowed, smoking_allowed),
          parties_allowed = IFNULL(p_parties_allowed, parties_allowed),
          children_allowed = IFNULL(p_children_allowed, children_allowed),
          visitors_allowed = IFNULL(p_visitors_allowed, visitors_allowed),
          max_guests_per_room = p_max_guests_per_room,
          minimum_age_requirement = p_minimum_age_requirement,
          cancellation_policy = p_cancellation_policy,
          refund_policy = p_refund_policy,
          payment_policy = p_payment_policy,
          damage_policy = p_damage_policy,
          pet_policy = p_pet_policy,
          smoking_policy = p_smoking_policy,
          additional_rules = p_additional_rules,
          terms_and_conditions = p_terms_and_conditions,
          privacy_policy = p_privacy_policy,
          version = version + 1,
          updated_at = NOW()
        WHERE id = existing_id;
      ELSE
        -- Insert new policies
        INSERT INTO business_policies (
          id, business_id, check_in_time, check_out_time, quiet_hours_start, quiet_hours_end,
          pets_allowed, smoking_allowed, parties_allowed, children_allowed, visitors_allowed,
          max_guests_per_room, minimum_age_requirement,
          cancellation_policy, refund_policy, payment_policy, damage_policy,
          pet_policy, smoking_policy, additional_rules, terms_and_conditions, privacy_policy
        ) VALUES (
          UUID(), p_business_id, p_check_in_time, p_check_out_time, p_quiet_hours_start, p_quiet_hours_end,
          IFNULL(p_pets_allowed, false), IFNULL(p_smoking_allowed, false),
          IFNULL(p_parties_allowed, false), IFNULL(p_children_allowed, true), IFNULL(p_visitors_allowed, true),
          p_max_guests_per_room, p_minimum_age_requirement,
          p_cancellation_policy, p_refund_policy, p_payment_policy, p_damage_policy,
          p_pet_policy, p_smoking_policy, p_additional_rules, p_terms_and_conditions, p_privacy_policy
        );
      END IF;

      SELECT * FROM business_policies WHERE business_id = p_business_id;
    END;
  `);

  // Update house rules only (with upsert logic)
  await knex.raw(`
    CREATE PROCEDURE UpdateHouseRules(
      IN p_business_id CHAR(36),
      IN p_check_in_time TIME,
      IN p_check_out_time TIME,
      IN p_quiet_hours_start TIME,
      IN p_quiet_hours_end TIME,
      IN p_pets_allowed BOOLEAN,
      IN p_smoking_allowed BOOLEAN,
      IN p_parties_allowed BOOLEAN,
      IN p_children_allowed BOOLEAN,
      IN p_visitors_allowed BOOLEAN,
      IN p_max_guests_per_room INT,
      IN p_minimum_age_requirement INT,
      IN p_additional_rules TEXT
    )
    BEGIN
      DECLARE existing_id CHAR(36);

      -- Check if policies already exist for this business
      SELECT id INTO existing_id FROM business_policies WHERE business_id = p_business_id LIMIT 1;

      IF existing_id IS NOT NULL THEN
        -- Update existing policies
        UPDATE business_policies SET
          check_in_time = IFNULL(p_check_in_time, check_in_time),
          check_out_time = IFNULL(p_check_out_time, check_out_time),
          quiet_hours_start = p_quiet_hours_start,
          quiet_hours_end = p_quiet_hours_end,
          pets_allowed = IFNULL(p_pets_allowed, pets_allowed),
          smoking_allowed = IFNULL(p_smoking_allowed, smoking_allowed),
          parties_allowed = IFNULL(p_parties_allowed, parties_allowed),
          children_allowed = IFNULL(p_children_allowed, children_allowed),
          visitors_allowed = IFNULL(p_visitors_allowed, visitors_allowed),
          max_guests_per_room = p_max_guests_per_room,
          minimum_age_requirement = p_minimum_age_requirement,
          additional_rules = p_additional_rules,
          version = version + 1,
          updated_at = NOW()
        WHERE id = existing_id;
      ELSE
        -- Insert new policies record
        INSERT INTO business_policies (
          id, business_id, check_in_time, check_out_time, quiet_hours_start, quiet_hours_end,
          pets_allowed, smoking_allowed, parties_allowed, children_allowed, visitors_allowed,
          max_guests_per_room, minimum_age_requirement, additional_rules
        ) VALUES (
          UUID(), p_business_id, p_check_in_time, p_check_out_time, p_quiet_hours_start, p_quiet_hours_end,
          IFNULL(p_pets_allowed, false), IFNULL(p_smoking_allowed, false),
          IFNULL(p_parties_allowed, false), IFNULL(p_children_allowed, true), IFNULL(p_visitors_allowed, true),
          p_max_guests_per_room, p_minimum_age_requirement, p_additional_rules
        );
      END IF;

      SELECT * FROM business_policies WHERE business_id = p_business_id;
    END;
  `);

  // Update policies only (with upsert logic)
  await knex.raw(`
    CREATE PROCEDURE UpdateBusinessPolicyTexts(
      IN p_business_id CHAR(36),
      IN p_cancellation_policy TEXT,
      IN p_refund_policy TEXT,
      IN p_payment_policy TEXT,
      IN p_damage_policy TEXT,
      IN p_pet_policy TEXT,
      IN p_smoking_policy TEXT
    )
    BEGIN
      DECLARE existing_id CHAR(36);

      -- Check if policies already exist for this business
      SELECT id INTO existing_id FROM business_policies WHERE business_id = p_business_id LIMIT 1;

      IF existing_id IS NOT NULL THEN
        -- Update existing policies
        UPDATE business_policies SET
          cancellation_policy = p_cancellation_policy,
          refund_policy = p_refund_policy,
          payment_policy = p_payment_policy,
          damage_policy = p_damage_policy,
          pet_policy = p_pet_policy,
          smoking_policy = p_smoking_policy,
          version = version + 1,
          updated_at = NOW()
        WHERE id = existing_id;
      ELSE
        -- Insert new policies record
        INSERT INTO business_policies (
          id, business_id, cancellation_policy, refund_policy, payment_policy,
          damage_policy, pet_policy, smoking_policy
        ) VALUES (
          UUID(), p_business_id, p_cancellation_policy, p_refund_policy, p_payment_policy,
          p_damage_policy, p_pet_policy, p_smoking_policy
        );
      END IF;

      SELECT * FROM business_policies WHERE business_id = p_business_id;
    END;
  `);

  // Delete business policies
  await knex.raw(`
    CREATE PROCEDURE DeleteBusinessPolicies(IN p_businessId CHAR(36))
    BEGIN
      DELETE FROM business_policies WHERE business_id = p_businessId;
      SELECT ROW_COUNT() as affected_rows;
    END;
  `);
}

async function dropBusinessPoliciesProcedures(knex) {
  const procedures = [
    "GetBusinessPolicies",
    "GetAllBusinessPolicies",
    "UpsertBusinessPolicies",
    "UpdateHouseRules",
    "UpdateBusinessPolicyTexts",
    "DeleteBusinessPolicies"
  ];

  for (const procedure of procedures) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${procedure}`);
  }
}

module.exports = { createBusinessPoliciesProcedures, dropBusinessPoliciesProcedures };
