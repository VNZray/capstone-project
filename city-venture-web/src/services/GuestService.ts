/**
 * Guest Service
 * Handles API calls for guest management (walk-in guests)
 */

import apiClient from "./apiClient";
import type {
    Guest,
    CreateGuestInput,
    UpdateGuestInput,
    GuestSearchResult,
} from "../types/Guest";

const BASE_URL = "/guest";

/**
 * Get all guests
 */
export const getAllGuests = async (): Promise<Guest[]> => {
    const { data } = await apiClient.get<Guest[]>(BASE_URL);
    return data;
};

/**
 * Get guest by ID
 */
export const getGuestById = async (id: string): Promise<Guest> => {
    const { data } = await apiClient.get<Guest>(`${BASE_URL}/${id}`);
    return data;
};

/**
 * Search guests by name, phone, or email
 */
export const searchGuests = async (
    query: string
): Promise<GuestSearchResult[]> => {
    const { data } = await apiClient.get<GuestSearchResult[]>(
        `${BASE_URL}/search`,
        {
            params: { query },
        }
    );
    return data;
};

/**
 * Get guest by phone number
 */
export const getGuestByPhone = async (phone: string): Promise<Guest> => {
    const { data } = await apiClient.get<Guest>(`${BASE_URL}/phone/${phone}`);
    return data;
};

/**
 * Get guest by email
 */
export const getGuestByEmail = async (email: string): Promise<Guest> => {
    const { data } = await apiClient.get<Guest>(`${BASE_URL}/email/${email}`);
    return data;
};

/**
 * Create new guest
 */
export const createGuest = async (
    guestData: CreateGuestInput
): Promise<Guest> => {
    const { data } = await apiClient.post<Guest>(BASE_URL, guestData);
    return data;
};

/**
 * Update guest
 */
export const updateGuest = async (
    id: string,
    guestData: UpdateGuestInput
): Promise<Guest> => {
    const { data } = await apiClient.put<Guest>(`${BASE_URL}/${id}`, guestData);
    return data;
};

/**
 * Delete guest
 */
export const deleteGuest = async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
};

/**
 * Find existing guest or create new one
 * Used for walk-in bookings - matches by phone/email or creates new guest
 */
export const findOrCreateGuest = async (
    guestData: CreateGuestInput
): Promise<Guest> => {
    const { data } = await apiClient.post<Guest>(
        `${BASE_URL}/find-or-create`,
        guestData
    );
    return data;
};
