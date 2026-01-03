/**
 * Room Blocked Dates Types
 *
 * Types for room date blocking functionality (maintenance, unavailability, etc.)
 */

export type BlockReason = 'Maintenance' | 'Renovation' | 'Private' | 'Seasonal' | 'Other';

export type RoomBlockedDate = {
    id: string;
    room_id: string;
    business_id: string;
    start_date: string;
    end_date: string;
    block_reason: BlockReason;
    notes?: string;
    created_by?: string;
    created_at?: string;
    updated_at?: string;
    // Joined field
    room_number?: string;
};

export type CreateRoomBlockedDateRequest = {
    room_id: string;
    business_id: string;
    start_date: string;
    end_date: string;
    block_reason?: BlockReason;
    notes?: string;
};

export type UpdateRoomBlockedDateRequest = Partial<CreateRoomBlockedDateRequest>;

export type BulkBlockDatesRequest = {
    room_ids: string[];
    business_id: string;
    start_date: string;
    end_date: string;
    block_reason?: BlockReason;
    notes?: string;
};

export type BulkBlockDatesResponse = {
    created: RoomBlockedDate[];
    errors?: Array<{ room_id: string; error: string }>;
    summary: {
        total: number;
        success: number;
        failed: number;
    };
};

export type RoomAvailabilityStatus = 'AVAILABLE' | 'BOOKING_CONFLICT' | 'BLOCKED';

export type RoomAvailabilityCheck = {
    room_id: string;
    start_date: string;
    end_date: string;
    available: boolean;
    status: RoomAvailabilityStatus;
};

// Calendar event type for displaying in calendar
export type CalendarBlockEvent = {
    date: Date;
    status: 'Blocked' | 'Maintenance' | 'Reserved' | 'Occupied' | 'Available';
    label?: string;
    blockId?: string;
    bookingId?: string;
};
