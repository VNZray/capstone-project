import apiClient from "./apiClient";
import type {
  BusinessPolicies,
  UpsertBusinessPoliciesPayload,
  UpdateHouseRulesPayload,
  UpdatePolicyTextsPayload,
} from "@/src/types/BusinessPolicies";
import { defaultBusinessPolicies } from "@/src/types/BusinessPolicies";

type UnknownRecord = Record<string, unknown>;

/**
 * Type guard to check if a payload looks like BusinessPolicies
 */
function looksLikeBusinessPolicies(
  payload: unknown
): payload is BusinessPolicies {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const record = payload as UnknownRecord;
  return (
    "business_id" in record &&
    ("pets_allowed" in record ||
      "smoking_allowed" in record ||
      "check_in_time" in record)
  );
}

/**
 * Normalize API response to extract BusinessPolicies
 */
function normalizeBusinessPoliciesResponse(
  data: unknown
): BusinessPolicies | null {
  if (!data) return null;

  if (Array.isArray(data)) {
    if (data.length === 0) return null;
    for (const item of data) {
      const normalized = normalizeBusinessPoliciesResponse(item);
      if (normalized) return normalized;
    }
    return null;
  }

  if (typeof data === "object") {
    const record = data as UnknownRecord;
    if (looksLikeBusinessPolicies(record)) {
      // Parse additional_rules if it's a JSON string
      if (
        record.additional_rules &&
        typeof record.additional_rules === "string"
      ) {
        try {
          record.additional_rules = JSON.parse(
            record.additional_rules as string
          );
        } catch {
          // Keep as is if parsing fails
        }
      }
      return record as BusinessPolicies;
    }
    if ("data" in record) {
      return normalizeBusinessPoliciesResponse(record.data);
    }
    if ("rows" in record) {
      return normalizeBusinessPoliciesResponse(record.rows);
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
 * Fetch business policies by business ID
 */
export const fetchBusinessPolicies = async (
  businessId: string
): Promise<BusinessPolicies> => {
  const { data } = await apiClient.get(`/business-policies/${businessId}`);
  const normalized = normalizeBusinessPoliciesResponse(data);
  return mergeWithDefaults(businessId, normalized);
};

/**
 * Fetch all business policies (admin view)
 */
export const fetchAllBusinessPolicies = async (): Promise<
  BusinessPolicies[]
> => {
  const { data } = await apiClient.get("/business-policies");
  if (Array.isArray(data)) {
    return data as BusinessPolicies[];
  }
  return [];
};

/**
 * Upsert (create or update) business policies
 */
export const upsertBusinessPolicies = async (
  businessId: string,
  payload: UpsertBusinessPoliciesPayload
): Promise<BusinessPolicies> => {
  const { data } = await apiClient.put(
    `/business-policies/${businessId}`,
    payload
  );
  const responsePayload =
    typeof data === "object" &&
    data !== null &&
    "data" in (data as UnknownRecord)
      ? (data as UnknownRecord).data
      : data;

  const normalized = normalizeBusinessPoliciesResponse(responsePayload);
  return mergeWithDefaults(businessId, normalized);
};

/**
 * Update house rules only
 */
export const updateHouseRules = async (
  businessId: string,
  payload: UpdateHouseRulesPayload
): Promise<BusinessPolicies> => {
  const { data } = await apiClient.patch(
    `/business-policies/${businessId}/house-rules`,
    payload
  );
  const responsePayload =
    typeof data === "object" &&
    data !== null &&
    "data" in (data as UnknownRecord)
      ? (data as UnknownRecord).data
      : data;

  const normalized = normalizeBusinessPoliciesResponse(responsePayload);
  return mergeWithDefaults(businessId, normalized);
};

/**
 * Update policy texts only
 */
export const updatePolicyTexts = async (
  businessId: string,
  payload: UpdatePolicyTextsPayload
): Promise<BusinessPolicies> => {
  const { data } = await apiClient.patch(
    `/business-policies/${businessId}/policy-texts`,
    payload
  );
  const responsePayload =
    typeof data === "object" &&
    data !== null &&
    "data" in (data as UnknownRecord)
      ? (data as UnknownRecord).data
      : data;

  const normalized = normalizeBusinessPoliciesResponse(responsePayload);
  return mergeWithDefaults(businessId, normalized);
};

/**
 * Delete business policies
 */
export const deleteBusinessPolicies = async (
  businessId: string
): Promise<{ message: string; affected_rows: number }> => {
  const { data } = await apiClient.delete(`/business-policies/${businessId}`);
  return data as { message: string; affected_rows: number };
};
