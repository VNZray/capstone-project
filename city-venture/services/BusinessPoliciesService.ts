/**
 * Business Policies Service
 * Handles API calls for business policies and house rules
 */

import apiClient from './apiClient';
import type { BusinessPolicies } from '@/types/BusinessPolicies';
import { defaultBusinessPolicies } from '@/types/BusinessPolicies';

/**
 * Fetch business policies by business ID
 */
export const fetchBusinessPolicies = async (
  businessId: string
): Promise<BusinessPolicies> => {
  try {
    const { data } = await apiClient.get(`/business-policies/${businessId}`);

    // Normalize the response
    const policies = normalizeResponse(data);

    // Parse additional_rules if it's a JSON string
    if (policies && policies.additional_rules && typeof policies.additional_rules === 'string') {
      try {
        policies.additional_rules = JSON.parse(policies.additional_rules);
      } catch {
        // Keep as is if parsing fails
      }
    }

    return mergeWithDefaults(businessId, policies);
  } catch (error) {
    console.error('[BusinessPoliciesService] Error fetching policies:', error);
    return mergeWithDefaults(businessId, null);
  }
};

/**
 * Normalize API response to extract BusinessPolicies
 */
function normalizeResponse(data: unknown): BusinessPolicies | null {
  if (!data) return null;

  if (Array.isArray(data)) {
    if (data.length === 0) return null;
    return data[0] as BusinessPolicies;
  }

  if (typeof data === 'object') {
    const record = data as Record<string, unknown>;
    if ('business_id' in record) {
      return record as unknown as BusinessPolicies;
    }
    if ('data' in record) {
      return normalizeResponse(record.data);
    }
  }

  return null;
}

/**
 * Merge response with defaults
 */
function mergeWithDefaults(
  businessId: string,
  policies: BusinessPolicies | null
): BusinessPolicies {
  return {
    ...defaultBusinessPolicies,
    business_id: businessId,
    ...(policies ?? {}),
  };
}

/**
 * Check if business has any policies configured
 */
export const hasConfiguredPolicies = (policies: BusinessPolicies): boolean => {
  return !!(
    policies.cancellation_policy ||
    policies.refund_policy ||
    policies.payment_policy ||
    policies.damage_policy ||
    policies.pet_policy ||
    policies.smoking_policy ||
    policies.terms_and_conditions ||
    policies.additional_rules?.length
  );
};

/**
 * Check if business has house rules configured
 */
export const hasConfiguredHouseRules = (policies: BusinessPolicies): boolean => {
  return !!(
    policies.check_in_time ||
    policies.check_out_time ||
    policies.quiet_hours_start ||
    policies.quiet_hours_end ||
    policies.max_guests_per_room ||
    policies.minimum_age_requirement ||
    policies.additional_rules?.length
  );
};
