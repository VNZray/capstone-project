import api from './api';
import type { Payment } from '@/src/types/Payment';

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export async function fetchPaymentsByBookingId(bookingId: string): Promise<Payment[]> {
    const res = await fetch(`${api}/payment/for/${bookingId}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        if (res.status === 404) return []; // no payments yet
        throw new Error(`Failed to fetch payments (${res.status})`);
    }
    return res.json();
}

export async function fetchPaymentById(id: string): Promise<Payment | null> {
    const res = await fetch(`${api}/payment/${id}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    return res.json();
}

export async function fetchPaymentByPayerId(payer_id: string): Promise<Payment | null> {
    const res = await fetch(`${api}/payment/payer/${payer_id}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    return res.json();
}

export async function fetchPaymentByPaymentForId(payment_for_id: string): Promise<Payment | null> {
    const res = await fetch(`${api}/payment/for/${payment_for_id}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    return res.json();
}

// New: fetch payments joined with booking and tourist by business id
export async function fetchPaymentsByBusinessId(businessId: string): Promise<any[]> {
    const res = await fetch(`${api}/payment/business/${businessId}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        if (res.status === 404) return [];
        throw new Error(`Failed to fetch business payments (${res.status})`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
}