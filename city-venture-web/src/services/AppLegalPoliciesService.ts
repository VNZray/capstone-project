/**
 * App Legal Policies Service
 * Handles API calls for platform-wide Terms & Conditions and Privacy Policy
 * Updated to use new backend v1 API endpoints
 */

import apiClient from "./apiClient";

export interface AppLegalPolicies {
  id?: string;
  terms_and_conditions: string | null;
  privacy_policy: string | null;
  version: number;
  is_active: boolean;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateAppLegalPoliciesPayload {
  terms_and_conditions?: string | null;
  privacy_policy?: string | null;
}

/**
 * Get current active legal policies
 */
export async function fetchAppLegalPolicies(): Promise<AppLegalPolicies> {
  const { data } = await apiClient.get<AppLegalPolicies>(`/app-legal-policies`);
  return data;
}

/**
 * Get legal policies history (all versions)
 */
export async function fetchAppLegalPoliciesHistory(): Promise<AppLegalPolicies[]> {
  const { data } = await apiClient.get<AppLegalPolicies[]>(`/app-legal-policies/history`);
  return data;
}

/**
 * Get specific version of legal policies
 */
export async function fetchAppLegalPoliciesByVersion(version: number): Promise<AppLegalPolicies> {
  const { data } = await apiClient.get<AppLegalPolicies>(`/app-legal-policies/version/${version}`);
  return data;
}

/**
 * Update legal policies (creates new version)
 */
export async function updateAppLegalPolicies(
  payload: UpdateAppLegalPoliciesPayload
): Promise<AppLegalPolicies> {
  const { data } = await apiClient.put<{ data: AppLegalPolicies }>(`/app-legal-policies`, payload);
  return data.data ?? data as unknown as AppLegalPolicies;
}
