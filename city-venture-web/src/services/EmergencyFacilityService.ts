/**
 * Emergency Facility Service
 * API service for emergency facilities management
 */

import apiClient from "./apiClient";
import type {
    EmergencyFacility,
    CreateEmergencyFacilityInput,
    FacilityType
} from "@/src/types/EmergencyFacility";

const BASE_PATH = "/emergency-facilities";

// Get all emergency facilities (Admin)
export const getAllEmergencyFacilities = async (): Promise<EmergencyFacility[]> => {
    const response = await apiClient.get(BASE_PATH);
    return response.data;
};

// Get active emergency facilities (public)
export const getActiveEmergencyFacilities = async (): Promise<EmergencyFacility[]> => {
    const response = await apiClient.get(`${BASE_PATH}/active`);
    return response.data;
};

// Get emergency facility by ID
export const getEmergencyFacilityById = async (id: string): Promise<EmergencyFacility> => {
    const response = await apiClient.get(`${BASE_PATH}/${id}`);
    return response.data;
};

// Get emergency facilities by type
export const getEmergencyFacilitiesByType = async (type: FacilityType): Promise<EmergencyFacility[]> => {
    const response = await apiClient.get(`${BASE_PATH}/type/${type}`);
    return response.data;
};

// Get emergency facilities by barangay
export const getEmergencyFacilitiesByBarangay = async (barangayId: number): Promise<EmergencyFacility[]> => {
    const response = await apiClient.get(`${BASE_PATH}/barangay/${barangayId}`);
    return response.data;
};

// Get nearby emergency facilities
export const getNearbyEmergencyFacilities = async (
    latitude: number,
    longitude: number,
    radius: number = 10,
    type?: FacilityType
): Promise<EmergencyFacility[]> => {
    const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radius: radius.toString(),
    });
    if (type) params.append('type', type);

    const response = await apiClient.get(`${BASE_PATH}/nearby?${params.toString()}`);
    return response.data;
};

// Create emergency facility
export const createEmergencyFacility = async (
    data: CreateEmergencyFacilityInput
): Promise<{ message: string; data: EmergencyFacility }> => {
    const response = await apiClient.post(BASE_PATH, data);
    return response.data;
};

// Update emergency facility
export const updateEmergencyFacility = async (
    id: string,
    data: Partial<CreateEmergencyFacilityInput>
): Promise<{ message: string; data: EmergencyFacility }> => {
    const response = await apiClient.put(`${BASE_PATH}/${id}`, data);
    return response.data;
};

// Update emergency facility status
export const updateEmergencyFacilityStatus = async (
    id: string,
    status: 'active' | 'inactive' | 'under_maintenance'
): Promise<{ message: string; data: EmergencyFacility }> => {
    const response = await apiClient.patch(`${BASE_PATH}/${id}/status`, { status });
    return response.data;
};

// Delete emergency facility
export const deleteEmergencyFacility = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`${BASE_PATH}/${id}`);
    return response.data;
};

export default {
    getAllEmergencyFacilities,
    getActiveEmergencyFacilities,
    getEmergencyFacilityById,
    getEmergencyFacilitiesByType,
    getEmergencyFacilitiesByBarangay,
    getNearbyEmergencyFacilities,
    createEmergencyFacility,
    updateEmergencyFacility,
    updateEmergencyFacilityStatus,
    deleteEmergencyFacility,
};
