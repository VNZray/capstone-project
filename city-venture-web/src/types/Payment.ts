export type Payment = {
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