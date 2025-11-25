import apiClient from './apiClient';
import type { Payment } from '@/src/types/Payment';

export async function fetchPaymentsByBookingId(bookingId: string): Promise<Payment[]> {
    try {
        const { data } = await apiClient.get<Payment[]>(`/payment/for/${bookingId}`);
        return data;
    } catch (error: any) {
        if (error?.response?.status === 404) return []; // no payments yet
        throw new Error(`Failed to fetch payments (${error?.response?.status || 'unknown'})`);
    }
}

export async function fetchPaymentById(id: string): Promise<Payment | null> {
    try {
        const { data } = await apiClient.get<Payment>(`/payment/${id}`);
        return data;
    } catch {
        return null;
    }
}

export async function fetchPaymentByPayerId(payer_id: string): Promise<Payment | null> {
    try {
        const { data } = await apiClient.get<Payment>(`/payment/payer/${payer_id}`);
        return data;
    } catch {
        return null;
    }
}

export async function fetchPaymentByPaymentForId(payment_for_id: string): Promise<Payment | null> {
    try {
        const { data } = await apiClient.get<Payment>(`/payment/for/${payment_for_id}`);
        return data;
    } catch {
        return null;
    }
}

// New: fetch payments joined with booking and tourist by business id
export async function fetchPaymentsByBusinessId(businessId: string): Promise<any[]> {
    try {
        const { data } = await apiClient.get<any[]>(`/payment/business/${businessId}`);
        return Array.isArray(data) ? data : [];
    } catch (error: any) {
        if (error?.response?.status === 404) return [];
        throw new Error(`Failed to fetch business payments (${error?.response?.status || 'unknown'})`);
    }
}