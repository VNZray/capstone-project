export type Payment = {
    id?: string | number;
    payer_type?: 'Tourist' | 'Owner';
    payment_type?: 'Full Payment' | 'Partial Payment';
    payment_method?: 'Gcash' | 'Paymaya' | 'Credit Card' | 'Cash';
    status?: 'Paid' | 'Completed' | 'Pending Balance';
    amount: number;
    payer_id?: string;
    payment_for_type?: 'Reservation' | 'Pending Balance' | 'Subscription';
    payment_for_id?: string;
    created_at?: Date | string;
    payment_for?: string;
}

export type Payments = Payment[];