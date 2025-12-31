/**
 * Emergency Facility Types (Mobile)
 * Type definitions for emergency facilities
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

export const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
    police_station: 'Police Station',
    hospital: 'Hospital',
    fire_station: 'Fire Station',
    evacuation_center: 'Evacuation Center',
};

export const FACILITY_TYPE_ICONS: Record<FacilityType, string> = {
    police_station: 'shield',
    hospital: 'hospital-box',
    fire_station: 'fire-truck',
    evacuation_center: 'home-group',
};

export const FACILITY_TYPE_COLORS: Record<FacilityType, string> = {
    police_station: '#1976D2', // Blue
    hospital: '#D32F2F', // Red
    fire_station: '#F57C00', // Orange
    evacuation_center: '#388E3C', // Green
};
