export type Booking = {
    id?: string;
    room_id?: string;
    tourist_id?: string;
    check_in_date?: Date;
    check_out_date?: Date;
    booking_status?: 'Pending' | 'Booked' | 'Checked-In' | 'Checked-Out' | 'Canceled';
    pax: number;
    total_price?: number;
    created_at?: Date;
    updated_at?: Date;
    num_children?: number;
    num_adults?: number;
    foreign_counts?: number;
    domestic_counts?: number;
    overseas_counts?: number;
    local_counts?: number;
    trip_purpose?: string;
    balance?: number;
}

export type Guest = {
    id?: number;
    booking_id: number;
    guest_name: string;
    age: number | null;
    gender: 'male' | 'female' | string;
}

export type Guests = Guest[];


export type BookingPayment = {
    id?: number;
    payer_type?: 'Tourist' | 'Owner';
    payment_type: 'Full Payment' | 'Partial Payment';
    payment_method?: 'Gcash' | 'Paymaya' | 'Credit Card' | 'Cash';
    status?: 'Paid' | 'Completed' | 'Pending Balance';
    amount: number;
    payer_id?: string;
    payment_for_type?: 'Reservation' | 'Pending Balance' | 'Subscription';
    payment_for_id?: string;
    created_at?: Date;
}

