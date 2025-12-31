import apiClient from './apiClient';

/**
 * Transaction/Payment Status
 * Maps to backend payment.status enum
 */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

/**
 * Payment Method Types
 * Maps to backend payment.payment_method enum
 */
export type PaymentMethod = 'gcash' | 'paymaya' | 'card' | 'cash_on_pickup';

/**
 * Payment Type
 * Maps to backend payment.payment_type enum
 */
export type PaymentType = 'Full Payment' | 'Partial Payment';

/**
 * Payment For
 * Maps to backend payment.payment_for enum
 */
export type PaymentFor = 'order' | 'booking' | 'reservation' | 'subscription';

/**
 * Payer Type
 * Maps to backend payment.payer_type enum
 */
export type PayerType = 'Tourist' | 'Owner';

/**
 * Payment/Transaction Response from Backend
 * Matches the payment table structure
 */
export interface PaymentResponse {
    id: string;
    payer_type: PayerType;
    payment_type?: PaymentType;
    payment_method: PaymentMethod;
    amount: number; // Amount in PHP pesos (backend stores as decimal(10,2))
    status: PaymentStatus;
    payment_for?: PaymentFor;
    payer_id: string;
    payment_for_id: string;
    payment_intent_id?: string;
    payment_method_id?: string;
    client_key?: string;
    paymongo_payment_id?: string;
    refund_reference?: string;
    currency: string;
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;

    // Additional fields that may be joined from related tables
    room_number?: string;
    business_name?: string;
    order_number?: string;
}

/**
 * Formatted Transaction for UI Display
 */
export interface Transaction {
    id: string;
    title: string;
    date: string;
    status: PaymentStatus;
    amount: number; // Amount in PHP (dollars)
    payment_method: string;
    payment_for: PaymentFor;
    reference_id: string;
}

/**
 * Payment Initiation Request
 */
export interface InitiatePaymentRequest {
    payment_for: 'order' | 'booking';
    reference_id: string;
    payment_method?: PaymentMethod;
}

/**
 * Payment Initiation Response
 */
export interface InitiatePaymentResponse {
    success: boolean;
    payment_intent_id: string;
    client_key: string;
    status: PaymentStatus;
    amount: number;
    currency: string;
    next_action?: {
        type: string;
        redirect?: {
            url: string;
            return_url: string;
        };
    };
}

/**
 * Payment Verification Request
 */
export interface VerifyPaymentRequest {
    payment_for: 'order' | 'booking';
    reference_id: string;
    payment_id: string;
}

/**
 * Payment Verification Response
 */
export interface VerifyPaymentResponse {
    success: boolean;
    status: PaymentStatus;
    message: string;
    payment?: PaymentResponse;
}

/**
 * Refund Initiation Request
 */
export interface InitiateRefundRequest {
    amount?: number; // Optional: partial refund amount in cents
    reason?: string;
}

/**
 * Refund Status Response
 */
export interface RefundStatusResponse {
    success: boolean;
    status: string;
    amount: number;
    refund_reference?: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * Transaction Service
 * Handles all payment and transaction-related API calls
 */
class TransactionService {
    /**
     * Get all transactions for a specific payer (user)
     */
    async getTransactionsByPayerId(payerId: string): Promise<Transaction[]> {
        try {
            console.log('[TransactionService] Fetching transactions for payer ID:', payerId);
            const response = await apiClient.get<PaymentResponse[]>(
                `/payment/payer/${payerId}`
            );

            console.log('[TransactionService] Received response:', response.data?.length || 0, 'payments');
            return this.formatTransactions(response.data);
        } catch (error: any) {
            console.error('[TransactionService] Failed to fetch transactions by payer ID:', error);
            console.error('[TransactionService] Error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        }
    }

    /**
     * Get all payments (Admin only)
     */
    async getAllPayments(): Promise<PaymentResponse[]> {
        try {
            const response = await apiClient.get<PaymentResponse[]>('/payment');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch all payments:', error);
            throw error;
        }
    }

    /**
     * Get payment by ID
     */
    async getPaymentById(paymentId: string): Promise<PaymentResponse> {
        try {
            const response = await apiClient.get<PaymentResponse>(
                `/payment/${paymentId}`
            );
            return response.data;
        } catch (error) {
            console.error('Failed to fetch payment by ID:', error);
            throw error;
        }
    }

    /**
     * Get payments by reference ID (order ID, booking ID, etc.)
     */
    async getPaymentsByReferenceId(
        referenceId: string
    ): Promise<PaymentResponse[]> {
        try {
            const response = await apiClient.get<PaymentResponse[]>(
                `/payment/for/${referenceId}`
            );
            return response.data;
        } catch (error) {
            console.error('Failed to fetch payments by reference ID:', error);
            throw error;
        }
    }

    /**
     * Get payments by business ID (Business Owner/Staff only)
     */
    async getPaymentsByBusinessId(businessId: string): Promise<PaymentResponse[]> {
        try {
            const response = await apiClient.get<PaymentResponse[]>(
                `/payment/business/${businessId}`
            );
            return response.data;
        } catch (error) {
            console.error('Failed to fetch payments by business ID:', error);
            throw error;
        }
    }

    /**
     * Get payment by order ID (convenience method)
     */
    async getPaymentByOrderId(orderId: string): Promise<PaymentResponse> {
        try {
            const response = await apiClient.get<{ success: boolean; data: PaymentResponse }>(
                `/payment/order/${orderId}`
            );
            return response.data.data;
        } catch (error) {
            console.error('Failed to fetch payment by order ID:', error);
            throw error;
        }
    }

    /**
     * Initiate a new payment (for orders or bookings)
     */
    async initiatePayment(
        request: InitiatePaymentRequest
    ): Promise<InitiatePaymentResponse> {
        try {
            const response = await apiClient.post<InitiatePaymentResponse>(
                '/payment/initiate',
                request
            );
            return response.data;
        } catch (error) {
            console.error('Failed to initiate payment:', error);
            throw error;
        }
    }

    /**
     * Get payment status by Payment Intent ID
     */
    async getPaymentStatus(
        paymentIntentId: string
    ): Promise<InitiatePaymentResponse> {
        try {
            const response = await apiClient.get<InitiatePaymentResponse>(
                `/payment/intent/${paymentIntentId}`
            );
            return response.data;
        } catch (error) {
            console.error('Failed to get payment status:', error);
            throw error;
        }
    }

    /**
     * Verify and fulfill payment after redirect
     */
    async verifyPayment(
        request: VerifyPaymentRequest
    ): Promise<VerifyPaymentResponse> {
        try {
            const response = await apiClient.post<VerifyPaymentResponse>(
                '/payment/verify',
                request
            );
            return response.data;
        } catch (error) {
            console.error('Failed to verify payment:', error);
            throw error;
        }
    }

    /**
     * Initiate a refund (Admin only)
     */
    async initiateRefund(
        paymentId: string,
        request?: InitiateRefundRequest
    ): Promise<RefundStatusResponse> {
        try {
            const response = await apiClient.post<RefundStatusResponse>(
                `/payment/${paymentId}/refund`,
                request || {}
            );
            return response.data;
        } catch (error) {
            console.error('Failed to initiate refund:', error);
            throw error;
        }
    }

    /**
     * Get refund status (Admin/Business Owner only)
     */
    async getRefundStatus(paymentId: string): Promise<RefundStatusResponse> {
        try {
            const response = await apiClient.get<RefundStatusResponse>(
                `/payment/${paymentId}/refund`
            );
            return response.data;
        } catch (error) {
            console.error('Failed to get refund status:', error);
            throw error;
        }
    }

    /**
     * Format backend payment responses into UI-friendly transactions
     */
    private formatTransactions(payments: PaymentResponse[]): Transaction[] {
        return payments.map((payment) => ({
            id: payment.id,
            title: this.formatPaymentTitle(payment),
            date: payment.created_at,
            status: payment.status,
            amount: payment.amount, // Amount already in PHP pesos from backend
            payment_method:
                payment.payment_method?.replace('_', ' ').toUpperCase() || 'Unknown',
            payment_for: payment.payment_for || 'order',
            reference_id: payment.payment_for_id,
        }));
    }

    /**
     * Generate a human-readable title for a payment
     */
    private formatPaymentTitle(payment: PaymentResponse): string {
        if (payment.payment_for === 'booking') {
            const roomInfo = payment.room_number
                ? ` - Room ${payment.room_number}`
                : '';
            const businessInfo = payment.business_name
                ? ` at ${payment.business_name}`
                : '';
            return `Room Booking${roomInfo}${businessInfo}`;
        }

        if (payment.payment_for === 'order') {
            const orderRef = payment.payment_for_id?.substring(0, 8) || 'Unknown';
            const businessInfo = payment.business_name
                ? ` from ${payment.business_name}`
                : '';
            return `Order #${orderRef}${businessInfo}`;
        }

        if (payment.payment_for === 'subscription') {
            return `Subscription Payment`;
        }

        if (payment.payment_for === 'reservation') {
            return `Reservation Payment`;
        }

        return `Payment #${payment.id.substring(0, 8)}`;
    }

    /**
     * Format amount to PHP with currency symbol
     */
    formatAmount(amount: number): string {
        return `₱${amount.toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    }

    /**
     * Format payment method for display
     */
    formatPaymentMethod(method: PaymentMethod): string {
        const methods: Record<PaymentMethod, string> = {
            gcash: 'GCash',
            paymaya: 'PayMaya',
            card: 'Credit/Debit Card',
            cash_on_pickup: 'Cash on Pickup',
        };
        return methods[method] || method;
    }

    /**
     * Get status color for UI
     */
    getStatusColor(status: PaymentStatus): string {
        const colors: Record<PaymentStatus, string> = {
            paid: '#10B981', // green
            pending: '#F59E0B', // orange
            failed: '#EF4444', // red
            refunded: '#3B82F6', // blue
        };
        return colors[status] || '#6B7280'; // default gray
    }

    /**
     * Get status label for display
     */
    getStatusLabel(status: PaymentStatus): string {
        const labels: Record<PaymentStatus, string> = {
            paid: 'Paid',
            pending: 'Pending',
            failed: 'Failed',
            refunded: 'Refunded',
        };
        return labels[status] || status;
    }
}

export default new TransactionService();
