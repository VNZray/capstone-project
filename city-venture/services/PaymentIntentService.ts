/**
 * Payment Intent Service
 * Handles Payment Intent workflow for custom checkout integration
 * 
 * This service enables card payments with more control than Checkout Sessions.
 * The flow is:
 * 1. Server creates Payment Intent (via createPaymentIntent)
 * 2. Client collects card details 
 * 3. Client creates Payment Method using PayMongo public key
 * 4. Client attaches Payment Method to Intent
 * 5. Client handles 3DS redirect if needed
 * 6. Webhook confirms payment success/failure
 * 
 * @see docs/ORDERING_SYSTEM_AUDIT.md - Phase 4
 */

import apiClient from '@/services/apiClient';
import * as WebBrowser from 'expo-web-browser';

// PayMongo Public Key from environment
const PAYMONGO_PUBLIC_KEY = process.env.EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY || '';

// =============================================================================
// Types
// =============================================================================

/**
 * Unified payment request - works for both orders and bookings
 * Uses the new /payment/initiate endpoint
 */
export interface CreatePaymentIntentRequest {
  payment_for: 'order' | 'booking';  // Specify the resource type
  reference_id: string;               // Order ID or Booking ID
  payment_method?: 'card' | 'gcash' | 'paymaya' | 'grab_pay'; // Optional: simplified payment method
  payment_method_types?: string[];    // Default: ['card', 'paymaya', 'gcash', 'grab_pay']
}

export interface CreatePaymentIntentResponse {
  success: boolean;
  message: string;
  data: {
    payment_id: string;
    payment_intent_id: string;
    client_key: string;
    payment_for: 'order' | 'booking';  // Resource type
    reference_id: string;               // Order ID or Booking ID
    display_name: string;               // e.g., "Order #12345" or "Booking #..."
    amount: number;
    amount_centavos: number;
    currency: string;
    payment_method_allowed: string[];
    status: string; // 'awaiting_payment_method'
    public_key: string;
    // Legacy compatibility - may be included for orders
    order_id?: string;
    order_number?: string;
  };
}

export interface CardDetails {
  card_number: string;
  exp_month: number;
  exp_year: number;
  cvc: string;
}

export interface BillingDetails {
  name?: string;
  email?: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
}

export interface CreatePaymentMethodResponse {
  data: {
    id: string;
    type: 'payment_method';
    attributes: {
      type: string;
      billing: BillingDetails;
      created_at: number;
      updated_at: number;
    };
  };
}

export interface AttachPaymentMethodResponse {
  success: boolean;
  message: string;
  data: {
    payment_intent_id: string;
    payment_method_id: string;
    status: string; // 'awaiting_next_action' | 'processing' | 'succeeded'
    next_action: {
      type: 'redirect';
      redirect: {
        url: string;
        return_url: string;
      };
    } | null;
    redirect_url: string | null;
    order_id: string;
  };
}

export interface PaymentIntentStatus {
  success: boolean;
  data: {
    payment_intent_id: string;
    status: 'awaiting_payment_method' | 'awaiting_next_action' | 'processing' | 'succeeded';
    amount: number;
    currency: string;
    payment_method_allowed: string[];
    last_payment_error: {
      code: string;
      message: string;
    } | null;
    next_action: {
      type: 'redirect';
      redirect: {
        url: string;
        return_url: string;
      };
    } | null;
    payments: {
      id: string;
      type: 'payment';
      attributes: {
        status: string;
        amount: number;
      };
    }[];
    order_id: string;
    order_status: string;
    order_payment_status: string;
  };
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Create a Payment Intent for an order or booking
 * Call this from your checkout screen when user confirms payment
 * 
 * Uses the unified /payment/initiate endpoint
 * 
 * @param request - Payment Intent creation request with payment_for and reference_id
 * @returns Payment Intent with client_key for client-side operations
 * 
 * @example
 * // For orders:
 * createPaymentIntent({ payment_for: 'order', reference_id: orderId })
 * 
 * // For bookings:
 * createPaymentIntent({ payment_for: 'booking', reference_id: bookingId })
 */
export async function createPaymentIntent(
  request: CreatePaymentIntentRequest
): Promise<CreatePaymentIntentResponse> {
  try {
    const response = await apiClient.post<CreatePaymentIntentResponse>(
      '/payment/initiate',  // Unified endpoint
      request
    );

    return response.data;
  } catch (error: any) {
    console.error('[PaymentIntentService] Create intent failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Create a Payment Method directly with PayMongo (client-side)
 * Uses the public key for PCI-compliant card data handling
 * 
 * IMPORTANT: This calls PayMongo API directly from the client
 * Card data never touches your server
 * 
 * @param type - Payment method type ('card' for card payments)
 * @param details - Card details (for card type)
 * @param billing - Billing information
 * @returns Payment Method object with ID
 */
export async function createPaymentMethod(
  type: 'card' | 'gcash' | 'paymaya' | 'grab_pay',
  details?: CardDetails,
  billing?: BillingDetails
): Promise<CreatePaymentMethodResponse> {
  if (!PAYMONGO_PUBLIC_KEY) {
    throw new Error('PAYMONGO_PUBLIC_KEY not configured');
  }

  const attributes: any = { type };

  if (type === 'card' && details) {
    attributes.details = {
      card_number: details.card_number.replace(/\s/g, ''), // Remove spaces
      exp_month: details.exp_month,
      exp_year: details.exp_year,
      cvc: details.cvc
    };
  }

  if (billing) {
    attributes.billing = billing;
  }

  try {
    const response = await fetch('https://api.paymongo.com/v1/payment_methods', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(PAYMONGO_PUBLIC_KEY + ':')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        data: { attributes }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[PaymentIntentService] PayMongo error:', errorData);
      // Create an error with the PayMongo error structure preserved
      const paymongoError = new Error(errorData.errors?.[0]?.detail || 'Failed to create payment method');
      (paymongoError as any).response = { data: errorData };
      (paymongoError as any).sub_code = errorData.errors?.[0]?.sub_code;
      (paymongoError as any).code = errorData.errors?.[0]?.code;
      throw paymongoError;
    }

    return response.json();
  } catch (error: any) {
    console.error('[PaymentIntentService] Create payment method failed:', error.message);
    throw error;
  }
}

/**
 * Attach Payment Method to Payment Intent (client-side for cards)
 * Uses client_key for authentication
 * 
 * @param paymentIntentId - Payment Intent ID
 * @param paymentMethodId - Payment Method ID
 * @param clientKey - Client key from createPaymentIntent response
 * @param returnUrl - URL to return after 3DS authentication
 * @returns Updated Payment Intent with next_action
 */
export async function attachPaymentMethodClient(
  paymentIntentId: string,
  paymentMethodId: string,
  clientKey: string,
  returnUrl: string
): Promise<{
  data: {
    id: string;
    type: 'payment_intent';
    attributes: {
      status: string;
      next_action: {
        type: 'redirect';
        redirect: {
          url: string;
          return_url: string;
        };
      } | null;
      payments: { id: string }[];
    };
  };
}> {
  if (!PAYMONGO_PUBLIC_KEY) {
    throw new Error('PAYMONGO_PUBLIC_KEY not configured');
  }

  try {
    const response = await fetch(
      `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}/attach`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(PAYMONGO_PUBLIC_KEY + ':')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          data: {
            attributes: {
              payment_method: paymentMethodId,
              client_key: clientKey,
              return_url: returnUrl
            }
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[PaymentIntentService] Attach error:', errorData);
      // Create an error with the PayMongo error structure preserved
      // so the error handler can map sub_code to user-friendly messages
      const paymongoError = new Error(errorData.errors?.[0]?.detail || 'Failed to attach payment method');
      (paymongoError as any).response = { data: errorData };
      (paymongoError as any).sub_code = errorData.errors?.[0]?.sub_code;
      (paymongoError as any).code = errorData.errors?.[0]?.code;
      throw paymongoError;
    }

    return response.json();
  } catch (error: any) {
    console.error('[PaymentIntentService] Attach payment method failed:', error.message);
    throw error;
  }
}

/**
 * Attach e-wallet Payment Method to Payment Intent (Client-Side)
 * Communicates directly with PayMongo, bypassing the backend.
 * 
 * This is the recommended approach for e-wallets (GCash, PayMaya)
 * as it keeps the backend clean and follows the same pattern as card payments.
 * 
 * @param paymentIntentId - Payment Intent ID
 * @param paymentMethodType - E-wallet type ('gcash', 'paymaya')
 * @param returnUrl - URL to return after wallet authorization
 * @param clientKey - Client key from createPaymentIntent response (REQUIRED)
 * @param billing - Optional billing information
 * @returns Response with redirect URL for e-wallet authorization
 */
export async function attachEwalletPaymentMethod(
  paymentIntentId: string,
  paymentMethodType: 'gcash' | 'paymaya',
  returnUrl: string,
  clientKey: string,
  billing?: BillingDetails
): Promise<{
  data: {
    id: string;
    type: 'payment_intent';
    attributes: {
      status: string;
      next_action: {
        type: 'redirect';
        redirect: {
          url: string;
          return_url: string;
        };
      } | null;
      payments: { id: string }[];
    };
  };
}> {
  console.log('[PaymentIntentService] Attaching e-wallet (Client-Side)...');

  try {
    // 1. Create the Payment Method (Direct to PayMongo)
    const methodResponse = await createPaymentMethod(
      paymentMethodType,
      undefined, // No card details for e-wallets
      billing
    );
    const paymentMethodId = methodResponse.data.id;
    console.log('[PaymentIntentService] E-wallet payment method created:', paymentMethodId);

    // 2. Attach to the Intent (Direct to PayMongo)
    // Reuses the existing client-side attachment function
    const attachResult = await attachPaymentMethodClient(
      paymentIntentId,
      paymentMethodId,
      clientKey,
      returnUrl
    );

    console.log('[PaymentIntentService] E-wallet attached, status:', attachResult.data.attributes.status);
    return attachResult;

  } catch (error: any) {
    console.error('[PaymentIntentService] Attach e-wallet failed:', error.message);
    throw error;
  }
}

/**
 * Get Payment Intent status
 * Uses the unified /payment/intent/:id endpoint
 * 
 * @param paymentIntentId - Payment Intent ID
 * @returns Payment Intent status details
 */
export async function getPaymentIntentStatus(
  paymentIntentId: string
): Promise<PaymentIntentStatus> {
  try {
    const response = await apiClient.get<PaymentIntentStatus>(
      `/payment/intent/${paymentIntentId}`  // Unified endpoint
    );

    return response.data;
  } catch (error: any) {
    console.error('[PaymentIntentService] Get status failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Open 3DS/e-wallet authentication URL in an in-app browser session
 * Uses openAuthSessionAsync which:
 * - Opens browser inside the app
 * - Auto-closes when redirect URL is detected  
 * - Returns control back to the app with the final URL
 * 
 * @param redirectUrl - 3DS or e-wallet authentication URL from PayMongo
 * @param expectedRedirectBase - Base URL that PayMongo will redirect to after auth (your backend bridge)
 * @returns Browser auth session result with final URL
 */
export async function open3DSAuthentication(
  redirectUrl: string,
  expectedRedirectBase?: string
): Promise<WebBrowser.WebBrowserAuthSessionResult> {
  try {
    // The redirect URL is typically your backend's bridge endpoint
    // openAuthSessionAsync will detect when the browser navigates to this URL
    // and automatically close, returning the full URL with query params
    const redirectListenUrl = expectedRedirectBase || redirectUrl;
    
    console.log('[PaymentIntentService] Opening auth session:', redirectUrl);
    console.log('[PaymentIntentService] Listening for redirect to:', redirectListenUrl);
    
    const result = await WebBrowser.openAuthSessionAsync(
      redirectUrl,
      redirectListenUrl,
      {
        preferEphemeralSession: true, // Don't persist cookies across sessions
      }
    );

    console.log('[PaymentIntentService] Auth session result:', result);
    return result;
  } catch (error: any) {
    console.error('[PaymentIntentService] Auth session failed:', error.message);
    throw new Error('Failed to open payment authentication');
  }
}

/**
 * Dismiss any active browser session
 * Call this when handling deep links from payment completion
 */
export function dismissBrowser(): void {
  try {
    WebBrowser.dismissBrowser();
  } catch {
    // Browser might not be open, ignore
  }
}

// =============================================================================
// High-Level Workflow Functions
// =============================================================================

/**
 * Complete card payment flow
 * Combines all steps: create intent, create method, attach, handle 3DS
 * 
 * @param orderId - Order ID to pay for
 * @param cardDetails - Card information
 * @param billing - Billing information
 * @param returnUrl - URL for 3DS return
 * @returns Final payment intent status
 */
export async function processCardPayment(
  orderId: string,
  cardDetails: CardDetails,
  billing: BillingDetails,
  returnUrl: string
): Promise<{
  success: boolean;
  requiresAction: boolean;
  actionUrl?: string;
  paymentIntentId: string;
  status: string;
}> {
  try {
    // Step 1: Create Payment Intent via backend (unified endpoint)
    console.log('[PaymentIntentService] Step 1: Creating Payment Intent...');
    const intentResponse = await createPaymentIntent({
      payment_for: 'order',
      reference_id: orderId,
      payment_method_types: ['card']
    });

    const { payment_intent_id, client_key } = intentResponse.data;
    console.log('[PaymentIntentService] Intent created:', payment_intent_id);

    // Step 2: Create Payment Method (client-side)
    console.log('[PaymentIntentService] Step 2: Creating Payment Method...');
    const methodResponse = await createPaymentMethod('card', cardDetails, billing);
    const paymentMethodId = methodResponse.data.id;
    console.log('[PaymentIntentService] Method created:', paymentMethodId);

    // Step 3: Attach Payment Method to Intent (client-side)
    console.log('[PaymentIntentService] Step 3: Attaching Payment Method...');
    const attachResponse = await attachPaymentMethodClient(
      payment_intent_id,
      paymentMethodId,
      client_key,
      returnUrl
    );

    const status = attachResponse.data.attributes.status;
    const nextAction = attachResponse.data.attributes.next_action;

    console.log('[PaymentIntentService] Attach result - Status:', status);

    // Step 4: Handle 3DS if required
    if (status === 'awaiting_next_action' && nextAction?.redirect?.url) {
      console.log('[PaymentIntentService] 3DS required, redirecting...');
      return {
        success: false,
        requiresAction: true,
        actionUrl: nextAction.redirect.url,
        paymentIntentId: payment_intent_id,
        status
      };
    }

    // Payment processing or succeeded
    return {
      success: status === 'succeeded',
      requiresAction: false,
      paymentIntentId: payment_intent_id,
      status
    };

  } catch (error: any) {
    console.error('[PaymentIntentService] Card payment failed:', error.message);
    throw error;
  }
}

/**
 * Poll for Payment Intent status after 3DS
 * Use this after user returns from 3DS authentication
 * 
 * @param paymentIntentId - Payment Intent ID
 * @param maxAttempts - Maximum polling attempts (default 15)
 * @param intervalMs - Polling interval (default 2000ms)
 * @returns Final Payment Intent status
 */
export async function pollPaymentIntentStatus(
  paymentIntentId: string,
  maxAttempts: number = 15,
  intervalMs: number = 2000
): Promise<PaymentIntentStatus> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const status = await getPaymentIntentStatus(paymentIntentId);

      // Check if payment is complete (success)
      const piStatus = status.data.status;
      if (piStatus === 'succeeded' || status.data.order_payment_status === 'paid') {
        return status;
      }

      // Check if webhook has already marked the order as failed
      if (status.data.order_payment_status === 'failed') {
        console.log('[PaymentIntentService] Order payment marked as failed by webhook');
        return status;
      }

      // Check for payment error from PayMongo
      if (status.data.last_payment_error) {
        console.error('[PaymentIntentService] Payment failed:', status.data.last_payment_error);
        return status;
      }

      // Wait before next attempt
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    } catch (error: any) {
      console.error(`[PaymentIntentService] Poll attempt ${attempt + 1} failed:`, error.message);
      
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }
  }

  throw new Error('Payment status polling timeout - please check order status manually');
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Validate card number using Luhn algorithm
 * @param cardNumber - Card number string
 * @returns True if valid
 */
export function validateCardNumber(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Format card number with spaces
 * @param cardNumber - Raw card number
 * @returns Formatted card number (e.g., "4242 4242 4242 4242")
 */
export function formatCardNumber(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '');
  const groups = digits.match(/.{1,4}/g);
  return groups ? groups.join(' ') : digits;
}

/**
 * Get card brand from card number
 * @param cardNumber - Card number string
 * @returns Card brand or 'unknown'
 */
export function getCardBrand(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '');

  if (/^4/.test(digits)) return 'visa';
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  if (/^6(?:011|5)/.test(digits)) return 'discover';
  if (/^35(?:2[89]|[3-8])/.test(digits)) return 'jcb';

  return 'unknown';
}

/**
 * Test card numbers for PayMongo sandbox
 * @see https://developers.paymongo.com/docs/testing
 * 
 * Use any future expiration date and any 3-digit CVC
 */
export const TEST_CARDS = {
  // ===== SUCCESSFUL PAYMENTS =====
  SUCCESS_VISA: '4343434343434345',
  SUCCESS_VISA_DEBIT: '4571736000000075',
  SUCCESS_VISA_CREDIT_PH: '4009930000001421',
  SUCCESS_VISA_DEBIT_PH: '4404520000001439',
  SUCCESS_MASTERCARD: '5555444444444457',
  SUCCESS_MASTERCARD_DEBIT: '5455590000000009',
  SUCCESS_MASTERCARD_PREPAID: '5339080000000003',
  SUCCESS_MASTERCARD_CREDIT_PH: '5240050000001440',
  SUCCESS_MASTERCARD_DEBIT_PH: '5577510000001446',

  // ===== 3DS REQUIRED =====
  THREE_DS_REQUIRED: '4120000000000007', // Must complete 3DS to succeed
  THREE_DS_DECLINE_BEFORE_AUTH: '4230000000000004', // Declines with generic_decline before 3DS
  THREE_DS_DECLINE_AFTER_AUTH: '5234000000000106', // Declines with generic_decline after 3DS
  THREE_DS_OPTIONAL: '5123000000000001', // 3DS supported but not required

  // ===== DECLINED - CARD ERRORS =====
  DECLINED_CARD_EXPIRED: '4200000000000018', // sub_code: card_expired
  DECLINED_CVC_INVALID: '4300000000000017', // sub_code: cvc_invalid
  DECLINED_GENERIC: '4400000000000016', // sub_code: generic_decline
  DECLINED_GENERIC_PH: '4028220000001457', // sub_code: generic_decline (PH)
  DECLINED_INSUFFICIENT_FUNDS: '5100000000000198', // sub_code: insufficient_funds
  DECLINED_INSUFFICIENT_FUNDS_PH: '5240460000001466', // sub_code: insufficient_funds (PH)

  // ===== DECLINED - BLOCKED (Security-sensitive - show generic message) =====
  DECLINED_FRAUDULENT: '4500000000000015', // sub_code: fraudulent
  DECLINED_PROCESSOR_BLOCKED: '5200000000000197', // sub_code: processor_blocked
  DECLINED_LOST_CARD: '5300000000000196', // sub_code: lost_card
  DECLINED_LOST_CARD_PH: '5483530000001462', // sub_code: lost_card (PH)
  DECLINED_STOLEN_CARD: '5400000000000195', // sub_code: stolen_card
  DECLINED_BLOCKED: '4600000000000014', // sub_code: blocked (fraud engine)

  // ===== PROCESSOR ERRORS =====
  DECLINED_PROCESSOR_UNAVAILABLE: '5500000000000194', // sub_code: processor_unavailable

  // ===== SPECIAL SCENARIOS =====
  CANCEL_AWAITING_CAPTURE_NON_3DS: '5417881844647288', // resource_failed_state on cancel
  CANCEL_AWAITING_CAPTURE_3DS: '5417886761138807', // resource_failed_state on cancel (3DS)

  // Legacy aliases for backward compatibility
  SUCCESS: '4343434343434345',
  DECLINED_EXPIRED: '4200000000000018',
  DECLINED_PROCESSING_ERROR: '5500000000000194',
  FOREIGN_CARD: '4000000000000069'
};

export default {
  createPaymentIntent,
  createPaymentMethod,
  attachPaymentMethodClient,
  attachEwalletPaymentMethod,
  getPaymentIntentStatus,
  open3DSAuthentication,
  dismissBrowser,
  processCardPayment,
  pollPaymentIntentStatus,
  validateCardNumber,
  formatCardNumber,
  getCardBrand,
  TEST_CARDS
};
