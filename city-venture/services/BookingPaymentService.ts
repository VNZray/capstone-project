/**
 * Booking Payment Service
 * Handles payment initiation for accommodation bookings via unified payment API
 * 
 * MIGRATED: Now uses CLIENT-SIDE Payment Intent flow:
 * 1. Backend creates Payment Intent -> returns client_key
 * 2. Frontend creates Payment Method (direct to PayMongo)
 * 3. Frontend attaches Payment Method to Intent (direct to PayMongo)
 * 4. Frontend receives checkout_url for e-wallet redirect
 * 
 * SECURITY NOTE: Uses openAuthSessionAsync for external browser authentication
 * which is more secure than WebView as it:
 * - Prevents session hijacking
 * - Uses the system browser's security features
 * - Properly handles deep link redirects
 */

import apiClient from '@/services/apiClient';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
// Import helpers from PaymentIntentService for client-side operations
import { 
  createPaymentMethod, 
  attachPaymentMethodClient 
} from './PaymentIntentService';

export interface InitiateBookingPaymentRequest {
  payment_method_type: 'gcash' | 'paymaya' | 'grab_pay' | 'card' | 'dob' | 'qrph' | string;
  payment_type?: 'Full Payment' | 'Partial Payment';
  amount?: number; // Optional - defaults to booking balance or total
}

export interface InitiateBookingPaymentResponse {
  success: boolean;
  message: string;
  data: {
    payment_id: string;
    booking_id: string;
    amount: number;
    currency: string;
    payment_method_type: string;
    payment_type: string;
    payment_intent_id: string;
    checkout_url: string;
    status: string;
  };
}

/**
 * Initiate payment for a booking using the CLIENT-SIDE Payment Intent flow
 * 
 * Flow:
 * 1. Create Payment Intent via backend -> get client_key
 * 2. Create Payment Method directly with PayMongo (frontend)
 * 3. Attach Payment Method to Intent directly with PayMongo (frontend)
 * 4. Return checkout_url for e-wallet redirect
 * 
 * @param bookingId - The booking UUID
 * @param paymentData - Payment details including method type and amount
 * @param billingInfo - Optional billing details for the payment
 * @returns Payment response with checkout URL
 */
export async function initiateBookingPayment(
  bookingId: string,
  paymentData: InitiateBookingPaymentRequest,
  billingInfo?: { email?: string; name?: string; phone?: string }
): Promise<InitiateBookingPaymentResponse> {
  try {
    console.log('[BookingPayment] Step 1: Creating Payment Intent (Backend)...');
    
    // Step 1: Create Payment Intent via Backend
    // The backend returns { client_key, payment_intent_id, payment_id }
    const intentResponse = await apiClient.post<any>(
      '/payment/initiate',
      {
        payment_for: 'booking',
        reference_id: bookingId,
        payment_method: paymentData.payment_method_type,
        payment_type: paymentData.payment_type,
        amount: paymentData.amount
      }
    );

    const { client_key, payment_intent_id, payment_id, amount, currency } = intentResponse.data.data || intentResponse.data;
    
    console.log('[BookingPayment] Intent created:', { payment_intent_id, payment_id });

    // Step 2: Create Payment Method directly with PayMongo (Frontend)
    console.log('[BookingPayment] Step 2: Creating Payment Method (Frontend -> PayMongo)...');
    
    const methodResponse = await createPaymentMethod(
      paymentData.payment_method_type as 'gcash' | 'paymaya' | 'grab_pay' | 'card',
      undefined, // Card details - undefined for e-wallets
      { 
        email: billingInfo?.email || 'guest@cityventure.app',
        name: billingInfo?.name || 'Guest User',
        phone: billingInfo?.phone
      }
    );
    const paymentMethodId = methodResponse.data.id;
    
    console.log('[BookingPayment] Payment Method created:', paymentMethodId);

    // Step 3: Attach Payment Method to Intent (Frontend -> PayMongo)
    console.log('[BookingPayment] Step 3: Attaching Payment Method to Intent...');
    
    // Construct return URL for deep linking back to the app
    const returnUrl = Linking.createURL('/payment/verify');
    
    const attachResponse = await attachPaymentMethodClient(
      payment_intent_id,
      paymentMethodId,
      client_key,
      returnUrl
    );

    // Step 4: Extract the Redirect URL from PayMongo's response
    const nextAction = attachResponse.data.attributes.next_action;
    const checkout_url = nextAction?.redirect?.url || '';
    const status = attachResponse.data.attributes.status;

    console.log(`[BookingPayment] Done. Status: ${status}, Checkout URL: ${checkout_url ? 'Available' : 'None'}`);

    // Return combined data so the screen can redirect to the checkout URL
    return {
      success: true,
      message: 'Payment initiated successfully',
      data: {
        payment_id: payment_id || '',
        booking_id: bookingId,
        amount: amount || paymentData.amount || 0,
        currency: currency || 'PHP',
        payment_method_type: paymentData.payment_method_type,
        payment_type: paymentData.payment_type || 'Full Payment',
        payment_intent_id,
        checkout_url, // <-- NOW POPULATED from PayMongo's redirect
        status
      }
    };

  } catch (error: any) {
    console.error('[BookingPaymentService] Initiate payment failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Open PayMongo checkout URL in secure external browser session
 * Uses openAuthSessionAsync which:
 * - Opens in the system browser (more secure than WebView)
 * - Auto-closes when redirect URL is detected
 * - Returns control back to the app with the final URL
 * 
 * @param checkoutUrl - PayMongo checkout URL
 * @param expectedRedirectBase - Base URL that PayMongo will redirect to after payment (your backend bridge)
 * @returns Promise with browser auth session result
 */
export async function openBookingCheckout(
  checkoutUrl: string,
  expectedRedirectBase?: string
): Promise<WebBrowser.WebBrowserAuthSessionResult> {
  try {
    // The redirect URL is typically your backend's bridge endpoint
    // openAuthSessionAsync will detect when the browser navigates to this URL
    // and automatically close, returning the full URL with query params
    const redirectListenUrl = expectedRedirectBase || Linking.createURL('');
    
    console.log('[BookingPaymentService] Opening auth session:', checkoutUrl);
    console.log('[BookingPaymentService] Listening for redirect to:', redirectListenUrl);

    const result = await WebBrowser.openAuthSessionAsync(
      checkoutUrl,
      redirectListenUrl,
      {
        preferEphemeralSession: true, // Don't persist cookies across sessions for security
      }
    );

    console.log('[BookingPaymentService] Auth session result:', result);
    return result;
  } catch (error: any) {
    console.error('[BookingPaymentService] Open checkout failed:', error.message);
    throw new Error('Failed to open payment checkout');
  }
}

/**
 * Dismiss any active browser session
 * Call this when handling deep links from payment completion
 */
export function dismissBookingBrowser(): void {
  try {
    WebBrowser.dismissBrowser();
  } catch {
    // Browser might not be open, ignore
  }
}

/**
 * Helper to map payment method name to PayMongo type
 * @param methodName - Display name of payment method (e.g., 'GCash', 'PayMaya')
 * @returns PayMongo payment method type
 */
export function mapPaymentMethodType(methodName: string): string {
  const method = (methodName || '').toLowerCase();
  
  const methodMap: Record<string, string> = {
    'gcash': 'gcash',
    'paymaya': 'paymaya',
    'maya': 'paymaya',
    'grab_pay': 'grab_pay',
    'grabpay': 'grab_pay',
    'grab pay': 'grab_pay',
    'card': 'card',
    'credit card': 'card',
    'debit card': 'card',
    'dob': 'dob',
    'qrph': 'qrph',
  };

  // Find matching method
  for (const [key, value] of Object.entries(methodMap)) {
    if (method.includes(key)) {
      return value;
    }
  }

  // Default to gcash if no match
  return 'gcash';
}

export interface VerifyBookingPaymentResponse {
  success: boolean;
  data: {
    verified: boolean;
    payment_status: 'success' | 'failed' | 'pending' | 'processing' | 'unknown';
    message: string;
    payment_intent_status: string;
    booking_id: string;
    payment_id: string;
    amount: number;
    last_payment_error?: {
      message?: string;
      code?: string;
    };
  };
}

/**
 * Verify payment status after PayMongo redirect
 * Uses the unified /payment/verify endpoint
 * 
 * @param bookingId - The booking UUID
 * @param paymentId - The local payment record UUID
 * @returns Verification result with actual payment status
 */
export async function verifyBookingPayment(
  bookingId: string,
  paymentId: string
): Promise<VerifyBookingPaymentResponse> {
  try {
    // Use the unified payment verify endpoint
    const response = await apiClient.post<VerifyBookingPaymentResponse>(
      '/payment/verify',
      {
        payment_for: 'booking',
        reference_id: bookingId,
        payment_id: paymentId
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('[BookingPaymentService] Verify payment failed:', error.response?.data || error.message);
    throw error;
  }
}
