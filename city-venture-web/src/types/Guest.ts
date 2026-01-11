/**
 * Guest type definitions
 * Represents walk-in guests who may not have tourist accounts
 */

export type GuestGender = "Male" | "Female" | "Other" | "Prefer not to say";

export interface Guest {
    id: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    gender?: GuestGender | null;
    ethnicity?: string | null;
    email?: string | null;
    phone_number?: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateGuestInput {
    first_name: string;
    middle_name?: string;
    last_name: string;
    gender?: GuestGender;
    ethnicity?: string;
    email?: string;
    phone_number?: string;
}

export interface UpdateGuestInput {
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    gender?: GuestGender;
    ethnicity?: string;
    email?: string;
    phone_number?: string;
}

export interface GuestSearchResult extends Guest {
    full_name?: string;
    booking_count?: number;
}
