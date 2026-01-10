import db from "../../db.js";
import { handleDbError } from "../../utils/errorHandler.js";

// ==================== BUSINESS POLICIES ====================

/**
 * Get business policies by business ID
 */
export async function getBusinessPolicies(req, res) {
  const { businessId } = req.params;

  try {
    const [data] = await db.query("CALL GetBusinessPolicies(?)", [businessId]);

    if (!data || !data[0] || data[0].length === 0) {
      // Return default policies if not found
      return res.json({
        business_id: businessId,
        check_in_time: null,
        check_out_time: null,
        quiet_hours_start: null,
        quiet_hours_end: null,
        pets_allowed: false,
        smoking_allowed: false,
        parties_allowed: false,
        children_allowed: true,
        visitors_allowed: true,
        max_guests_per_room: null,
        minimum_age_requirement: null,
        cancellation_policy: null,
        refund_policy: null,
        payment_policy: null,
        damage_policy: null,
        pet_policy: null,
        smoking_policy: null,
        additional_rules: null,
        terms_and_conditions: null,
        privacy_policy: null,
        is_active: true,
        version: 1
      });
    }

    // Parse additional_rules if it's a JSON string
    const policy = data[0][0];
    if (policy.additional_rules && typeof policy.additional_rules === 'string') {
      try {
        policy.additional_rules = JSON.parse(policy.additional_rules);
      } catch {
        // Keep as string if parsing fails
      }
    }

    res.json(policy);
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Get all business policies (admin view)
 */
export async function getAllBusinessPolicies(req, res) {
  try {
    const [data] = await db.query("CALL GetAllBusinessPolicies()");
    res.json(data[0] || []);
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Upsert business policies (insert or update)
 */
export async function upsertBusinessPolicies(req, res) {
  const { businessId } = req.params;

  try {
    const {
      check_in_time,
      check_out_time,
      quiet_hours_start,
      quiet_hours_end,
      pets_allowed,
      smoking_allowed,
      parties_allowed,
      children_allowed,
      visitors_allowed,
      max_guests_per_room,
      minimum_age_requirement,
      cancellation_policy,
      refund_policy,
      payment_policy,
      damage_policy,
      pet_policy,
      smoking_policy,
      additional_rules,
      terms_and_conditions,
      privacy_policy
    } = req.body;

    // Stringify additional_rules if it's an array
    const additionalRulesStr = Array.isArray(additional_rules)
      ? JSON.stringify(additional_rules)
      : additional_rules;

    const [data] = await db.query(
      "CALL UpsertBusinessPolicies(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        businessId,
        check_in_time ?? null,
        check_out_time ?? null,
        quiet_hours_start ?? null,
        quiet_hours_end ?? null,
        pets_allowed ?? false,
        smoking_allowed ?? false,
        parties_allowed ?? false,
        children_allowed ?? true,
        visitors_allowed ?? true,
        max_guests_per_room ?? null,
        minimum_age_requirement ?? null,
        cancellation_policy ?? null,
        refund_policy ?? null,
        payment_policy ?? null,
        damage_policy ?? null,
        pet_policy ?? null,
        smoking_policy ?? null,
        additionalRulesStr ?? null,
        terms_and_conditions ?? null,
        privacy_policy ?? null
      ]
    );

    res.json({
      message: "Business policies updated successfully",
      data: data[0][0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Update house rules only
 */
export async function updateHouseRules(req, res) {
  const { businessId } = req.params;

  try {
    const {
      check_in_time,
      check_out_time,
      quiet_hours_start,
      quiet_hours_end,
      pets_allowed,
      smoking_allowed,
      parties_allowed,
      children_allowed,
      visitors_allowed,
      max_guests_per_room,
      minimum_age_requirement,
      additional_rules
    } = req.body;

    // Stringify additional_rules if it's an array
    const additionalRulesStr = Array.isArray(additional_rules)
      ? JSON.stringify(additional_rules)
      : additional_rules;

    const [data] = await db.query(
      "CALL UpdateHouseRules(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        businessId,
        check_in_time ?? null,
        check_out_time ?? null,
        quiet_hours_start ?? null,
        quiet_hours_end ?? null,
        pets_allowed ?? false,
        smoking_allowed ?? false,
        parties_allowed ?? false,
        children_allowed ?? true,
        visitors_allowed ?? true,
        max_guests_per_room ?? null,
        minimum_age_requirement ?? null,
        additionalRulesStr ?? null
      ]
    );

    res.json({
      message: "House rules updated successfully",
      data: data[0][0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Update policy texts only
 */
export async function updatePolicyTexts(req, res) {
  const { businessId } = req.params;

  try {
    const {
      cancellation_policy,
      refund_policy,
      payment_policy,
      damage_policy,
      pet_policy,
      smoking_policy
    } = req.body;

    const [data] = await db.query(
      "CALL UpdateBusinessPolicyTexts(?, ?, ?, ?, ?, ?, ?)",
      [
        businessId,
        cancellation_policy ?? null,
        refund_policy ?? null,
        payment_policy ?? null,
        damage_policy ?? null,
        pet_policy ?? null,
        smoking_policy ?? null
      ]
    );

    res.json({
      message: "Policy texts updated successfully",
      data: data[0][0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Delete business policies
 */
export async function deleteBusinessPolicies(req, res) {
  const { businessId } = req.params;

  try {
    const [data] = await db.query("CALL DeleteBusinessPolicies(?)", [businessId]);

    res.json({
      message: "Business policies deleted successfully",
      affected_rows: data[0][0]?.affected_rows || 0
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}
