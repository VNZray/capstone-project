/**
 * Room Blocked Dates Service
 *
 * Frontend service for managing room date blocks (maintenance, unavailability, etc.)
 */

import apiClient from "./apiClient";
import type {
    RoomBlockedDate,
    CreateRoomBlockedDateRequest,
    UpdateRoomBlockedDateRequest,
    BulkBlockDatesRequest,
    BulkBlockDatesResponse,
    RoomAvailabilityCheck,
} from "../types/RoomBlockedDates";

const BASE_PATH = "/room-blocked-dates";

/**
 * Get all blocked dates for a business
 */
export const fetchBlockedDatesByBusinessId = async (
    businessId: string
): Promise<RoomBlockedDate[]> => {
    const { data } = await apiClient.get<RoomBlockedDate[]>(
        `${BASE_PATH}/business/${businessId}`
    );
    return Array.isArray(data) ? data : [];
};

/**
 * Get blocked dates for a specific room
 */
export const fetchBlockedDatesByRoomId = async (
    roomId: string
): Promise<RoomBlockedDate[]> => {
    const { data } = await apiClient.get<RoomBlockedDate[]>(
        `${BASE_PATH}/room/${roomId}`
    );
    return Array.isArray(data) ? data : [];
};

/**
 * Get blocked dates for a room within a date range
 */
export const fetchBlockedDatesInRange = async (
    roomId: string,
    startDate: string,
    endDate: string
): Promise<RoomBlockedDate[]> => {
    const { data } = await apiClient.get<RoomBlockedDate[]>(
        `${BASE_PATH}/room/${roomId}/range`,
        { params: { start_date: startDate, end_date: endDate } }
    );
    return Array.isArray(data) ? data : [];
};

/**
 * Check room availability for a date range
 */
export const checkRoomAvailability = async (
    roomId: string,
    startDate: string,
    endDate: string
): Promise<RoomAvailabilityCheck> => {
    const { data } = await apiClient.get<RoomAvailabilityCheck>(
        `${BASE_PATH}/room/${roomId}/availability`,
        { params: { start_date: startDate, end_date: endDate } }
    );
    return data;
};

/**
 * Get a single blocked date by ID
 */
export const fetchBlockedDateById = async (
    id: string
): Promise<RoomBlockedDate> => {
    const { data } = await apiClient.get<RoomBlockedDate>(`${BASE_PATH}/${id}`);
    return data;
};

/**
 * Create a new blocked date range
 */
export const createBlockedDate = async (
    request: CreateRoomBlockedDateRequest
): Promise<RoomBlockedDate> => {
    const { data } = await apiClient.post<RoomBlockedDate>(BASE_PATH, request);
    return data;
};

/**
 * Create blocked dates for multiple rooms at once
 */
export const bulkBlockDates = async (
    request: BulkBlockDatesRequest
): Promise<BulkBlockDatesResponse> => {
    const { data } = await apiClient.post<BulkBlockDatesResponse>(
        `${BASE_PATH}/bulk`,
        request
    );
    return data;
};

/**
 * Update a blocked date range
 */
export const updateBlockedDate = async (
    id: string,
    request: UpdateRoomBlockedDateRequest
): Promise<RoomBlockedDate> => {
    const { data } = await apiClient.put<RoomBlockedDate>(
        `${BASE_PATH}/${id}`,
        request
    );
    return data;
};

/**
 * Delete a blocked date range
 */
export const deleteBlockedDate = async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${id}`);
};

/**
 * Helper: Generate calendar events from blocked dates
 */
export const generateBlockedCalendarEvents = (
    blockedDates: RoomBlockedDate[]
): Array<{ date: Date; status: "Maintenance" | "Blocked"; blockId: string; label?: string }> => {
    const events: Array<{ date: Date; status: "Maintenance" | "Blocked"; blockId: string; label?: string }> = [];

    for (const block of blockedDates) {
        const start = new Date(block.start_date);
        const end = new Date(block.end_date);
        const currentDate = new Date(start);

        while (currentDate <= end) {
            events.push({
                date: new Date(currentDate),
                status: block.block_reason === "Maintenance" ? "Maintenance" : "Blocked",
                blockId: block.id,
                label: block.block_reason,
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    return events;
};
