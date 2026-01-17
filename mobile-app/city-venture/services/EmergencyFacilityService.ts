/**
 * Emergency Facility Service (Mobile)
 * API service for fetching emergency facilities
 */

import apiClient from '@/services/apiClient';
import type { EmergencyFacility, FacilityType } from '@/types/EmergencyFacility';

const BASE_PATH = '/emergency-facilities';

// Get all active emergency facilities (public endpoint)
export const fetchActiveEmergencyFacilities = async (): Promise<EmergencyFacility[]> => {
    const { data } = await apiClient.get(`${BASE_PATH}/active`);
    return data || [];
};

// Get emergency facility by ID
export const fetchEmergencyFacilityById = async (id: string): Promise<EmergencyFacility> => {
    const { data } = await apiClient.get(`${BASE_PATH}/${id}`);
    return data;
};

// Get emergency facilities by type
export const fetchEmergencyFacilitiesByType = async (
    type: FacilityType
): Promise<EmergencyFacility[]> => {
    const { data } = await apiClient.get(`${BASE_PATH}/type/${type}`);
    return data || [];
};

// Get emergency facilities by barangay
export const fetchEmergencyFacilitiesByBarangay = async (
    barangayId: number
): Promise<EmergencyFacility[]> => {
    const { data } = await apiClient.get(`${BASE_PATH}/barangay/${barangayId}`);
    return data || [];
};

// Get nearby emergency facilities based on user location
export const fetchNearbyEmergencyFacilities = async (
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    type?: FacilityType
): Promise<EmergencyFacility[]> => {
    const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radius: radiusKm.toString(),
    });
    if (type) params.append('type', type);

    const { data } = await apiClient.get(`${BASE_PATH}/nearby?${params.toString()}`);
    return data || [];
};

export default {
    fetchActiveEmergencyFacilities,
    fetchEmergencyFacilityById,
    fetchEmergencyFacilitiesByType,
    fetchEmergencyFacilitiesByBarangay,
    fetchNearbyEmergencyFacilities,
};
