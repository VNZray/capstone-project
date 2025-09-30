export type Booking = {
    id?: string;
    room_id?: string;
    tourist_id?: string;
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
}

export type Bookings = Booking[];
