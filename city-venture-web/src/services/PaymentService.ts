import api from './api';
import type { Payment } from '@/src/types/Payment';

export async function fetchPaymentsByBookingId(bookingId: string): Promise<Payment[]> {
    const res = await fetch(`${api}/payment/for/${bookingId}`);
    if (!res.ok) {
        if (res.status === 404) return []; // no payments yet
        throw new Error(`Failed to fetch payments (${res.status})`);
    }
    return res.json();
}

export async function fetchPaymentById(id: string): Promise<Payment | null> {
    const res = await fetch(`${api}/payment/${id}`);
    if (!res.ok) return null;
    return res.json();
}

export async function fetchPaymentByPayerId(payer_id: string): Promise<Payment | null> {
    const res = await fetch(`${api}/payment/payer/${payer_id}`);
    if (!res.ok) return null;
    return res.json();
}

export async function fetchPaymentByPaymentForId(payment_for_id: string): Promise<Payment | null> {
    const res = await fetch(`${api}/payment/for/${payment_for_id}`);
    if (!res.ok) return null;
    return res.json();
}