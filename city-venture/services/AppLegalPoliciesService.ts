/**
 * App Legal Policies Service
 * Handles API calls for platform-wide Terms & Conditions and Privacy Policy
 */

import apiClient from './apiClient';

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

/**
 * Get current active legal policies
 */
export async function fetchAppLegalPolicies(): Promise<AppLegalPolicies> {
    const response = await apiClient.get('/app-legal-policies');

    if (!response) {
        throw new Error('Failed to fetch legal policies');
    }

    return response.data;
}

/**
 * Get specific version of legal policies
 */
export async function fetchAppLegalPoliciesByVersion(version: number): Promise<AppLegalPolicies> {
    const response = await apiClient.get(`/app-legal-policies/version/${version}`);

    if (!response) {
        throw new Error('Failed to fetch legal policies version');
    }

    return response.data;
}
