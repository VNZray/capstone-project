/**
 * App Legal Policies Service
 * Handles API calls for platform-wide Terms & Conditions and Privacy Policy
 */

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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
  const response = await axios.get(`${API_URL}/app-legal-policies`);
  return response.data;
}

/**
 * Get legal policies history (all versions)
 */
export async function fetchAppLegalPoliciesHistory(): Promise<AppLegalPolicies[]> {
  const response = await axios.get(`${API_URL}/app-legal-policies/history`);
  return response.data;
}

/**
 * Get specific version of legal policies
 */
export async function fetchAppLegalPoliciesByVersion(version: number): Promise<AppLegalPolicies> {
  const response = await axios.get(`${API_URL}/app-legal-policies/version/${version}`);
  return response.data;
}

/**
 * Update legal policies (creates new version)
 */
export async function updateAppLegalPolicies(
  payload: UpdateAppLegalPoliciesPayload
): Promise<AppLegalPolicies> {
  const response = await axios.put(`${API_URL}/app-legal-policies`, payload);
  return response.data.data;
}
