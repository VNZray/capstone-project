/**
 * Payment Service
 * Handles payment-related API operations
 * Updated to use new backend v1 API endpoints
 */
import apiClient from './apiClient';
import type { Payment } from '@/src/types/Payment';

/** Fetch payments by booking ID */
export async function fetchPaymentsByBookingId(bookingId: string): Promise<Payment[]> {
    try {
        const { data } = await apiClient.get<Payment[]>(`/payments`, {
            params: { booking_id: bookingId }
        });
        return Array.isArray(data) ? data : [];
    } catch (error: unknown) {
        if ((error as { response?: { status?: number } })?.response?.status === 404) return [];
        throw new Error(`Failed to fetch payments`);
    }
}

/** Fetch payment by ID */
export async function fetchPaymentById(id: string): Promise<Payment | null> {
    try {
        const { data } = await apiClient.get<Payment>(`/payments/${id}`);
        return data;
    } catch {
        return null;
    }
}

/** Fetch payments by payer ID */
export async function fetchPaymentsByPayerId(payerId: string): Promise<Payment[]> {
    try {
        const { data } = await apiClient.get<Payment[]>(`/payments`, {
            params: { payer_id: payerId }
        });
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

/** Fetch payments by payment for ID (order or booking reference) */
export async function fetchPaymentsByReferenceId(referenceId: string): Promise<Payment[]> {
    try {
        const { data } = await apiClient.get<Payment[]>(`/payments`, {
            params: { reference_id: referenceId }
        });
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

/** Fetch payments by business ID */
export async function fetchPaymentsByBusinessId(businessId: string): Promise<Payment[]> {
    try {
        const { data } = await apiClient.get<Payment[]>(`/payments`, {
            params: { business_id: businessId }
        });
        return Array.isArray(data) ? data : [];
    } catch (error: unknown) {
        if ((error as { response?: { status?: number } })?.response?.status === 404) return [];
        throw new Error(`Failed to fetch business payments`);
    }
}

/** Initiate unified payment for order or booking */
export async function initiateUnifiedPayment(payload: {
    payment_for: 'order' | 'booking';
    reference_id: string;
    amount: number;
    payment_method?: string;
}): Promise<{ payment_id: string; payment_url?: string }> {
    const { data } = await apiClient.post<{ payment_id: string; payment_url?: string }>(
        `/payments/workflow/initiate`,
        payload
    );
    return data;
}

/** Verify payment status */
export async function verifyPaymentStatus(
    paymentFor: 'order' | 'booking',
    referenceId: string
): Promise<{ status: string; payment?: Payment }> {
    const { data } = await apiClient.get<{ status: string; payment?: Payment }>(
        `/payments/workflow/${paymentFor}/${referenceId}/verify`
    );
    return data;
}

/** Get payment statistics */
export async function fetchPaymentStats(businessId?: string): Promise<unknown> {
    const { data } = await apiClient.get(`/payments/stats`, {
        params: businessId ? { business_id: businessId } : undefined
    });
    return data;
}

// Legacy aliases for backward compatibility
export const fetchPaymentByPayerId = fetchPaymentsByPayerId;
export const fetchPaymentByPaymentForId = fetchPaymentsByReferenceId;