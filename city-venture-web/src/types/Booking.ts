export type BookingSource = 'online' | 'walk-in';

export type Booking = {
    id?: string;
    room_id?: string;
    booking_type?: 'overnight' | 'short-stay';
    tourist_id?: string;
    check_in_time?: Date | string;
    check_out_time?: Date | string;
    check_in_date?: Date;
    check_out_date?: Date;
    booking_status?: 'Pending' | 'Reserved' | 'Checked-In' | 'Checked-Out' | 'Canceled';
    pax: number;
    total_price?: number;
    created_at?: Date;
    updated_at?: Date;
    num_children?: number;
    num_adults?: number;
    num_infants?: number;
    foreign_counts?: number;
    domestic_counts?: number;
    overseas_counts?: number;
    local_counts?: number;
    trip_purpose?: string;
    balance?: number;
    business_id?: string;
    // Walk-in booking fields
    booking_source?: BookingSource;
    guest_name?: string;
    guest_phone?: string;
    guest_email?: string;
}

export type Bookings = Booking[];

// Walk-in booking request type
export type WalkInBookingRequest = {
    pax: number;
    num_children?: number;
    num_adults?: number;
    num_infants?: number;
    foreign_counts?: number;
    domestic_counts?: number;
    overseas_counts?: number;
    local_counts?: number;
    trip_purpose?: string;
    booking_type?: 'overnight' | 'short-stay';
    check_in_date: string;
    check_out_date: string;
    check_in_time?: string;
    check_out_time?: string;
    total_price: number;
    balance?: number;
    room_id: string;
    business_id: string;
    guest_name?: string;
    guest_phone?: string;
    guest_email?: string;
    tourist_id?: string;
    immediate_checkin?: boolean;
}

// Guest search result type
export type GuestSearchResult = {
    tourist_id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email?: string;
    phone_number?: string;
    user_profile?: string;
    booking_history?: {
        total_bookings: number;
        last_booking: string;
    };
}

// Today's arrivals/departures types
export type ArrivalDeparture = Booking & {
    room_number?: string;
    room_type?: string;
    tourist_first_name?: string;
    tourist_last_name?: string;
    tourist_email?: string;
    tourist_phone?: string;
    nights_remaining?: number;
}

export type TodaysArrivalsResponse = {
    date: string;
    total: number;
    arrivals: ArrivalDeparture[];
}

export type TodaysDeparturesResponse = {
    date: string;
    total: number;
    departures: ArrivalDeparture[];
}

export type CurrentlyOccupiedResponse = {
    total: number;
    occupied: ArrivalDeparture[];
}
