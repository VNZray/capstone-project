import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';

// Basic PayMongo integration helpers. For production, move secret usage to your backend.

type PayMongoSourceCreateParams = {
    amount: number; // in cents/lowest currency unit
    currency?: string; // default PHP
    type: 'gcash' | 'paymaya' | 'grab_pay' | 'dob' | 'qrph';
    description?: string;
    billing?: {
        name?: string;
        email?: string;
        phone?: string;
    };
    metadata?: Record<string, any>;
    redirect: {
        success: string; // deep link or https
        failed: string; // deep link or https
    };
};

export type PayMongoSource = {
    id: string;
    type: 'source';
    attributes: {
        amount: number;
        currency: string;
        checkout_url?: string; // some docs show it nested under redirect
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

const PAYMONGO_BASE_URL = 'https://api.paymongo.com/v1';

// WARNING: This should be handled by a secure backend in production.
// Store a pre-encoded Basic token in Expo extra (e.g., "Basic base64(sk_test_xxx:)"), or use a proxy server.
const extra = (Constants?.expoConfig?.extra || {}) as Record<string, any>;
const BASIC_AUTH =
    process.env.EXPO_PUBLIC_PAYMONGO_BASIC_AUTH ||
    (extra?.EXPO_PUBLIC_PAYMONGO_BASIC_AUTH as string) ||
    (extra?.PAYMONGO_BASIC_AUTH as string);

if (!BASIC_AUTH) {
    // eslint-disable-next-line no-console
    console.warn(
        '[PayMongoService] Missing EXPO_PUBLIC_PAYMONGO_BASIC_AUTH. Online payments will not work.'
    );
}

export async function createPayMongoSource(
    params: PayMongoSourceCreateParams
): Promise<PayMongoSource> {
    if (!BASIC_AUTH) throw new Error('PayMongo credentials not configured');

    // PayMongo requires https URLs for redirects; deep links are not accepted.
    const normalizeRedirect = (url: string, fallback: string) =>
        /^https?:\/\//i.test(url) ? url : fallback;

    const redirect = {
        success: normalizeRedirect(
            params.redirect.success,
            'https://city-venture.com/payment/success'
        ),
        failed: normalizeRedirect(
            params.redirect.failed,
            'https://city-venture.com/payment/failed'
        ),
    };

    const payload = {
        data: {
            attributes: {
                amount: Math.round(params.amount),
                currency: params.currency || 'PHP',
                type: params.type,
                description: params.description || 'Payment',
                billing: params.billing,
                redirect,
            },
            metadata: params.metadata,

        },
    };

    const res = await fetch(`${PAYMONGO_BASE_URL}/sources`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: BASIC_AUTH,
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`PayMongo create source failed: ${res.status} ${text}`);
    }
    const json = (await res.json()) as { data: PayMongoSource };
    return json.data;
}

export async function openCheckoutUrl(url: string) {
    // Open the hosted checkout in a browser tab
    return WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
}

// Checkout Sessions API (hosted checkout)
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

export async function createCheckoutSession(params: {
    description?: string;
    payment_method_types: ('gcash' | 'paymaya' | 'grab_pay' | 'dob' | 'qrph' | 'card' | string)[];
    line_items: Array<{
        name: string;
        amount: number; // centavos
        currency?: string; // default PHP
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
    if (!BASIC_AUTH) throw new Error('PayMongo credentials not configured');

    const normalizeHttps = (url?: string) =>
        url && /^https?:\/\//i.test(url) ? url : undefined;

    const payload = {
        data: {
            attributes: {
                description: params.description,
                billing: params.billing,
                send_email_receipt: params.send_email_receipt ?? true,
                show_description: params.show_description ?? true,
                show_line_items: params.show_line_items ?? true,
                line_items: params.line_items.map((li) => ({
                    currency: li.currency || 'PHP',
                    amount: Math.round(li.amount),
                    name: li.name,
                    quantity: li.quantity,
                    description: li.description,
                })),
                payment_method_types: params.payment_method_types,
                // Optional redirect URLs for hosted checkout completion
                success_url:
                    normalizeHttps(params.success_url) ||
                    'https://city-venture.com/payment/success',
                cancel_url:
                    normalizeHttps(params.cancel_url) ||
                    'https://city-venture.com/payment/cancel',
            },
        },
    };

    const res = await fetch(`${PAYMONGO_BASE_URL}/checkout_sessions`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: BASIC_AUTH,
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`PayMongo create checkout_session failed: ${res.status} ${text}`);
    }
    const json = (await res.json()) as { data: PayMongoCheckoutSession };
    return json.data;
}
