import * as WebBrowser from 'expo-web-browser';

/**
 * @deprecated SECURITY WARNING: Direct PayMongo API calls from mobile apps are NOT SAFE.
 * 
 * This file has been deprecated to prevent secret key exposure in mobile bundles.
 * All PayMongo API calls MUST go through the backend server.
 * 
 * For orders/shops: Use PaymentService.ts which calls backend endpoints
 * For bookings: A backend endpoint should be created to handle PayMongo checkout
 * 
 * The only safe function to use from this file is `openCheckoutUrl()` which
 * just opens a browser to a URL (no credentials involved).
 */

// ============================================================================
// DEPRECATED TYPES - Kept for reference during migration
// ============================================================================

type PayMongoSourceCreateParams = {
    amount: number;
    currency?: string;
    type: 'gcash' | 'paymaya' | 'grab_pay' | 'dob' | 'qrph';
    description?: string;
    billing?: {
        name?: string;
        email?: string;
        phone?: string;
    };
    metadata?: Record<string, any>;
    redirect: {
        success: string;
        failed: string;
    };
};

export type PayMongoSource = {
    id: string;
    type: 'source';
    attributes: {
        amount: number;
        currency: string;
        checkout_url?: string;
        redirect?: {
            checkout_url?: string;
            success?: string;
            failed?: string;
        };
        status: string;
        type: string;
        livemode: boolean;
    };
};

export type PayMongoCheckoutSession = {
    id: string;
    type: 'checkout_session';
    attributes: {
        checkout_url: string;
        description?: string;
        payment_method_types: string[];
        line_items: Array<{
            name: string;
            amount: number;
            currency: string;
            quantity: number;
            description?: string;
        }>;
        billing?: { name?: string; phone?: string; email?: string };
        send_email_receipt?: boolean;
        show_description?: boolean;
        show_line_items?: boolean;
        livemode: boolean;
    };
};

// ============================================================================
// DEPRECATED - These credentials should NEVER be in a mobile app
// ============================================================================

const PAYMONGO_BASE_URL = 'https://api.paymongo.com/v1';

// Credentials removed - this is intentional for security
const BASIC_AUTH: string | undefined = undefined;

// Log deprecation warning once on module load
console.warn(
    '[PayMongoService] ⚠️ DEPRECATED: Direct PayMongo API calls are disabled for security.\n' +
    'Use backend endpoints via PaymentService.ts instead.\n' +
    'Only openCheckoutUrl() is safe to use from this module.'
);

// ============================================================================
// DEPRECATED FUNCTIONS - Will throw errors if called
// ============================================================================

/**
 * @deprecated SECURITY RISK - Do not use.
 * This function has been disabled to prevent secret key exposure.
 * Use backend API endpoints instead.
 * @throws {Error} Always throws - function is disabled
 */
export async function createPayMongoSource(
    _params: PayMongoSourceCreateParams
): Promise<PayMongoSource> {
    throw new Error(
        '[PayMongoService] SECURITY ERROR: createPayMongoSource() is disabled.\n' +
        'Direct PayMongo API calls from mobile apps expose secret keys.\n' +
        'Please use the backend API endpoint instead:\n' +
        '  POST /api/payments/initiate\n' +
        'See PaymentService.ts for the secure implementation.'
    );
}

/**
 * @deprecated SECURITY RISK - Do not use.
 * This function has been disabled to prevent secret key exposure.
 * Use backend API endpoints instead.
 * @throws {Error} Always throws - function is disabled
 */
export async function createCheckoutSession(_params: {
    description?: string;
    payment_method_types: ('gcash' | 'paymaya' | 'grab_pay' | 'dob' | 'qrph' | 'card' | string)[];
    line_items: Array<{
        name: string;
        amount: number;
        currency?: string;
        quantity: number;
        description?: string;
    }>;
    billing?: { name?: string; phone?: string; email?: string };
    send_email_receipt?: boolean;
    show_description?: boolean;
    show_line_items?: boolean;
    success_url?: string;
    cancel_url?: string;
}): Promise<PayMongoCheckoutSession> {
    throw new Error(
        '[PayMongoService] SECURITY ERROR: createCheckoutSession() is disabled.\n' +
        'Direct PayMongo API calls from mobile apps expose secret keys.\n' +
        'Please use the backend API endpoint instead:\n' +
        '  POST /api/payments/initiate (for orders)\n' +
        '  POST /api/bookings/initiate-payment (for accommodations - needs implementation)\n' +
        'See PaymentService.ts for the secure implementation pattern.'
    );
}

// ============================================================================
// SAFE FUNCTION - Can still be used
// ============================================================================

/**
 * Open a PayMongo checkout URL in the browser.
 * This function is SAFE to use as it only opens a URL - no credentials involved.
 * 
 * @param url - The checkout URL returned from backend
 * @returns Promise that resolves when browser is closed
 */
export async function openCheckoutUrl(url: string) {
    if (!url || typeof url !== 'string') {
        throw new Error('Invalid checkout URL provided');
    }
    
    if (!url.startsWith('https://')) {
        console.warn('[PayMongoService] Warning: Checkout URL should use HTTPS');
    }
    
    return WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
}
