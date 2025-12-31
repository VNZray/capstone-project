/**
 * Emergency Facility Types
 * Type definitions for emergency facilities management
 */

export type FacilityType = 'police_station' | 'hospital' | 'fire_station' | 'evacuation_center';
export type FacilityStatus = 'active' | 'inactive' | 'under_maintenance';

export interface EmergencyFacility {
    id: string;
    name: string;
    description?: string;
    facility_type: FacilityType;
    barangay_id: number;
    address?: string;
    latitude?: number;
    longitude?: number;
    contact_phone?: string;
    contact_email?: string;
    emergency_hotline?: string;
    operating_hours?: string;
    facility_image?: string;
    status: FacilityStatus;
    capacity?: number;
    services_offered?: string;
    created_at?: string;
    updated_at?: string;
    // Joined fields
    barangay_name?: string;
    municipality_name?: string;
    province_name?: string;
    distance_km?: number;
}

export interface CreateEmergencyFacilityInput {
    name: string;
    description?: string;
    facility_type: FacilityType;
    barangay_id: number;
    address?: string;
    latitude?: number;
    longitude?: number;
    contact_phone?: string;
    contact_email?: string;
    emergency_hotline?: string;
    operating_hours?: string;
    facility_image?: string;
    status?: FacilityStatus;
    capacity?: number;
    services_offered?: string;
}

export interface UpdateEmergencyFacilityInput extends Partial<CreateEmergencyFacilityInput> {
    id: string;
}

export const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
    police_station: 'Police Station',
    hospital: 'Hospital',
    fire_station: 'Fire Station',
    evacuation_center: 'Evacuation Center'
};

export const FACILITY_STATUS_LABELS: Record<FacilityStatus, string> = {
    active: 'Active',
    inactive: 'Inactive',
    under_maintenance: 'Under Maintenance'
};

export const FACILITY_TYPE_ICONS: Record<FacilityType, string> = {
    police_station: 'shield',
    hospital: 'hospital',
    fire_station: 'flame',
    evacuation_center: 'home'
};

export const FACILITY_TYPE_COLORS: Record<FacilityType, string> = {
    police_station: '#1976D2', // Blue
    hospital: '#D32F2F', // Red
    fire_station: '#F57C00', // Orange
    evacuation_center: '#388E3C' // Green
};
