export type Booking = {
    id?: string;
    room_id?: string;
    tourist_id?: string;
    check_in_date?: Date | String;
    check_out_date?: Date | String;
    booking_status?: 'Pending' | 'Reserved' | 'Checked-In' | 'Checked-Out' | 'Canceled';
    booking_type?: 'overnight' | 'short-stay';
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
}

export type Bookings = Booking[];

export type Guest = {
    id?: number;
    booking_id: string;
    name: string;
    age: number | null;
    gender: 'Male' | 'Female' | string;
}

export type Guests = Guest[];


export type BookingPayment = {
    id?: number;
    payer_type?: 'Tourist' | 'Owner';
    payment_type?: 'Full Payment' | 'Partial Payment';
    payment_method?: 'Gcash' | 'Paymaya' | 'Credit Card' | 'Cash';
    status?: 'Paid' | 'Completed' | 'Pending Balance';
    amount: number;
    payer_id?: string;
    payment_for_type?: 'Reservation' | 'Pending Balance' | 'Subscription';
    payment_for_id?: string;
    created_at?: Date;
    payment_for?: string;
}

