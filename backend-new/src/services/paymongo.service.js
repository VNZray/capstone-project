/**
 * PayMongo Service
 * Handles payment processing via PayMongo API
 */
import axios from 'axios';
import config from '../config/config.js';
import logger from '../config/logger.js';

const PAYMONGO_URL = 'https://api.paymongo.com/v1';
const PAYMONGO_SECRET_KEY = config.payMongo.secretKey;
const PAYMONGO_WEBHOOK_SECRET = config.payMongo.webhookSecret;

// Create axios instance with auth
const paymongoClient = axios.create({
  baseURL: PAYMONGO_URL,
  headers: {
    'Authorization': `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Create a payment intent
 * @param {number} amount - Amount in centavos
 * @param {string} description - Payment description
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Payment intent response
 */
export async function createPaymentIntent(amount, description, metadata = {}) {
  try {
    logger.debug(`Creating payment intent for ₱${amount / 100}`);

    const response = await paymongoClient.post('/payment_intents', {
      data: {
        attributes: {
          amount: Math.round(amount), // in centavos
          currency: 'PHP',
          payment_method_allowed: ['gcash', 'grab_pay', 'paymaya', 'card'],
          description,
          metadata: {
            ...metadata,
            created_at: new Date().toISOString(),
          },
          capture_type: 'automatic',
        },
      },
    });

    return response.data.data;
  } catch (error) {
    logger.error('PayMongo create payment intent error:', error.response?.data || error);
    throw new Error(error.response?.data?.errors?.[0]?.detail || 'Failed to create payment intent');
  }
}

/**
 * Attach a payment method to a payment intent
 * @param {string} paymentIntentId - Payment intent ID
 * @param {string} paymentMethodId - Payment method ID
 * @param {string} returnUrl - Return URL after payment
 * @returns {Promise<Object>} Updated payment intent
 */
export async function attachPaymentMethod(paymentIntentId, paymentMethodId, returnUrl) {
  try {
    const response = await paymongoClient.post(`/payment_intents/${paymentIntentId}/attach`, {
      data: {
        attributes: {
          payment_method: paymentMethodId,
          return_url: returnUrl,
        },
      },
    });

    return response.data.data;
  } catch (error) {
    logger.error('PayMongo attach payment method error:', error.response?.data || error);
    throw new Error(error.response?.data?.errors?.[0]?.detail || 'Failed to attach payment method');
  }
}

/**
 * Create a payment method
 * @param {string} type - Payment method type (gcash, grab_pay, paymaya, card)
 * @param {Object} details - Payment method details
 * @returns {Promise<Object>} Payment method
 */
export async function createPaymentMethod(type, details = {}) {
  try {
    const payload = {
      data: {
        attributes: {
          type,
          billing: details.billing || null,
        },
      },
    };

    // Add card details if type is card
    if (type === 'card' && details.card) {
      payload.data.attributes.details = details.card;
    }

    const response = await paymongoClient.post('/payment_methods', payload);
    return response.data.data;
  } catch (error) {
    logger.error('PayMongo create payment method error:', error.response?.data || error);
    throw new Error(error.response?.data?.errors?.[0]?.detail || 'Failed to create payment method');
  }
}

/**
 * Retrieve a payment intent
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Promise<Object>} Payment intent
 */
export async function getPaymentIntent(paymentIntentId) {
  try {
    const response = await paymongoClient.get(`/payment_intents/${paymentIntentId}`);
    return response.data.data;
  } catch (error) {
    logger.error('PayMongo get payment intent error:', error.response?.data || error);
    throw new Error(error.response?.data?.errors?.[0]?.detail || 'Failed to retrieve payment intent');
  }
}

/**
 * Create a source-based payment (for e-wallets)
 * @param {number} amount - Amount in centavos
 * @param {string} type - Source type (gcash, grab_pay)
 * @param {Object} redirect - Redirect URLs
 * @param {Object} billing - Billing details
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Source object
 */
export async function createSource(amount, type, redirect, billing, metadata = {}) {
  try {
    logger.debug(`Creating ${type} source for ₱${amount / 100}`);

    const response = await paymongoClient.post('/sources', {
      data: {
        attributes: {
          amount: Math.round(amount),
          currency: 'PHP',
          type,
          redirect: {
            success: redirect.success,
            failed: redirect.failed,
          },
          billing: billing || null,
          metadata: {
            ...metadata,
            created_at: new Date().toISOString(),
          },
        },
      },
    });

    return response.data.data;
  } catch (error) {
    logger.error('PayMongo create source error:', error.response?.data || error);
    throw new Error(error.response?.data?.errors?.[0]?.detail || 'Failed to create source');
  }
}

/**
 * Retrieve a source
 * @param {string} sourceId - Source ID
 * @returns {Promise<Object>} Source object
 */
export async function getSource(sourceId) {
  try {
    const response = await paymongoClient.get(`/sources/${sourceId}`);
    return response.data.data;
  } catch (error) {
    logger.error('PayMongo get source error:', error.response?.data || error);
    throw new Error(error.response?.data?.errors?.[0]?.detail || 'Failed to retrieve source');
  }
}

/**
 * Create a payment from a source
 * @param {number} amount - Amount in centavos
 * @param {string} sourceId - Source ID
 * @param {string} description - Payment description
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Payment object
 */
export async function createPayment(amount, sourceId, description, metadata = {}) {
  try {
    logger.debug(`Creating payment from source ${sourceId}`);

    const response = await paymongoClient.post('/payments', {
      data: {
        attributes: {
          amount: Math.round(amount),
          currency: 'PHP',
          source: {
            id: sourceId,
            type: 'source',
          },
          description,
          metadata,
        },
      },
    });

    return response.data.data;
  } catch (error) {
    logger.error('PayMongo create payment error:', error.response?.data || error);
    throw new Error(error.response?.data?.errors?.[0]?.detail || 'Failed to create payment');
  }
}

/**
 * Retrieve a payment
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object>} Payment object
 */
export async function getPayment(paymentId) {
  try {
    const response = await paymongoClient.get(`/payments/${paymentId}`);
    return response.data.data;
  } catch (error) {
    logger.error('PayMongo get payment error:', error.response?.data || error);
    throw new Error(error.response?.data?.errors?.[0]?.detail || 'Failed to retrieve payment');
  }
}

/**
 * Create a refund
 * @param {string} paymentId - Payment ID to refund
 * @param {number} amount - Amount to refund in centavos
 * @param {string} reason - Refund reason
 * @param {string} notes - Additional notes
 * @returns {Promise<Object>} Refund object
 */
export async function createRefund(paymentId, amount, reason, notes = '') {
  try {
    logger.debug(`Creating refund for payment ${paymentId}: ₱${amount / 100}`);

    const response = await paymongoClient.post('/refunds', {
      data: {
        attributes: {
          payment_id: paymentId,
          amount: Math.round(amount),
          reason: reason || 'requested_by_customer',
          notes,
        },
      },
    });

    return response.data.data;
  } catch (error) {
    logger.error('PayMongo create refund error:', error.response?.data || error);
    throw new Error(error.response?.data?.errors?.[0]?.detail || 'Failed to create refund');
  }
}

/**
 * Retrieve a refund
 * @param {string} refundId - Refund ID
 * @returns {Promise<Object>} Refund object
 */
export async function getRefund(refundId) {
  try {
    const response = await paymongoClient.get(`/refunds/${refundId}`);
    return response.data.data;
  } catch (error) {
    logger.error('PayMongo get refund error:', error.response?.data || error);
    throw new Error(error.response?.data?.errors?.[0]?.detail || 'Failed to retrieve refund');
  }
}

/**
 * Verify webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - Webhook signature from header
 * @returns {boolean} Whether signature is valid
 */
export function verifyWebhookSignature(payload, signature) {
  const crypto = require('crypto');

  try {
    // PayMongo signature format: t=timestamp,te=test_signature,li=live_signature
    const parts = signature.split(',');
    const signatureParts = {};

    for (const part of parts) {
      const [key, value] = part.split('=');
      signatureParts[key] = value;
    }

    const timestamp = signatureParts.t;
    const testSignature = signatureParts.te;
    const liveSignature = signatureParts.li;

    // Use the appropriate signature based on environment
    const expectedSignature = config.environment === 'production' ? liveSignature : testSignature;

    if (!expectedSignature || !timestamp) {
      return false;
    }

    // Compute expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const computedSignature = crypto
      .createHmac('sha256', PAYMONGO_WEBHOOK_SECRET)
      .update(signedPayload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(computedSignature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    logger.error('Webhook signature verification error:', error);
    return false;
  }
}

/**
 * Map PayMongo status to internal payment status
 * @param {string} paymongoStatus - PayMongo payment status
 * @returns {string} Internal payment status
 */
export function mapPaymentStatus(paymongoStatus) {
  const statusMap = {
    'awaiting_payment_method': 'pending',
    'awaiting_next_action': 'awaiting_action',
    'processing': 'processing',
    'succeeded': 'paid',
    'failed': 'failed',
    'cancelled': 'cancelled',
    'chargeable': 'chargeable',
    'pending': 'pending',
    'paid': 'paid',
    'expired': 'expired',
  };

  return statusMap[paymongoStatus] || 'pending';
}

/**
 * Parse and validate webhook event
 * @param {Object} event - Webhook event data
 * @returns {Object} Parsed event with type and data
 */
export function parseWebhookEvent(event) {
  if (!event?.data) {
    throw new Error('Invalid webhook event structure');
  }

  const eventType = event.data.attributes?.type;
  const eventData = event.data.attributes?.data;

  if (!eventType) {
    throw new Error('Webhook event missing type');
  }

  return {
    id: event.data.id,
    type: eventType,
    livemode: event.data.attributes?.livemode || false,
    created_at: event.data.attributes?.created_at,
    data: eventData,
    previous_data: event.data.attributes?.previous_data
  };
}

/**
 * PIPM Flow: Create Payment Intent, Payment Method, and Attach in one call
 * This is the recommended flow for booking payments
 *
 * @param {Object} params
 * @param {string} params.referenceId - Booking/Order UUID for tracking
 * @param {number} params.amount - Amount in centavos (minimum 2000 = ₱20)
 * @param {string} params.paymentMethodType - gcash, paymaya, card
 * @param {string} params.description - Payment description
 * @param {string} params.returnUrl - URL to redirect after payment authentication
 * @param {Object} params.billing - Billing info (name, email, phone)
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<Object>} { paymentIntent, paymentMethod, redirectUrl, clientKey }
 */
export async function createPIPMPayment({
  referenceId,
  amount,
  paymentMethodType,
  description,
  returnUrl,
  billing = {},
  metadata = {}
}) {
  // Validate amount
  if (!amount || amount < 2000) {
    throw new Error('Invalid amount: minimum 2000 centavos (₱20.00) for Payment Intents');
  }

  // Validate payment method type
  const validTypes = ['card', 'paymaya', 'gcash', 'grab_pay'];
  if (!validTypes.includes(paymentMethodType)) {
    throw new Error(`Invalid payment method type. Must be one of: ${validTypes.join(', ')}`);
  }

  logger.info(`[PIPM] Creating payment for ${referenceId}: ₱${(amount/100).toFixed(2)} via ${paymentMethodType}`);

  // Step 1: Create Payment Intent
  const paymentIntent = await createPaymentIntent(
    amount,
    description || `Order #${referenceId}`,
    {
      reference_id: referenceId,
      ...metadata
    }
  );

  logger.info(`[PIPM] Payment Intent created: ${paymentIntent.id}`);

  // Step 2: Create Payment Method
  const paymentMethod = await createPaymentMethod(paymentMethodType, { billing });

  logger.info(`[PIPM] Payment Method created: ${paymentMethod.id}`);

  // Step 3: Attach Payment Method to Payment Intent
  const attachedIntent = await attachPaymentMethod(
    paymentIntent.id,
    paymentMethod.id,
    returnUrl
  );

  logger.info(`[PIPM] Payment Method attached. Status: ${attachedIntent.attributes.status}`);

  // Extract redirect URL for e-wallet authentication
  let redirectUrl = null;
  const nextAction = attachedIntent.attributes.next_action;

  if (nextAction && nextAction.type === 'redirect') {
    redirectUrl = nextAction.redirect.url;
    logger.info(`[PIPM] Redirect URL: ${redirectUrl}`);
  }

  return {
    paymentIntent: attachedIntent,
    paymentIntentId: attachedIntent.id,
    paymentMethodId: paymentMethod.id,
    clientKey: paymentIntent.attributes.client_key,
    status: attachedIntent.attributes.status,
    redirectUrl,
    checkout_url: redirectUrl
  };
}

export default {
  createPaymentIntent,
  attachPaymentMethod,
  createPaymentMethod,
  getPaymentIntent,
  createSource,
  getSource,
  createPayment,
  getPayment,
  createRefund,
  getRefund,
  verifyWebhookSignature,
  mapPaymentStatus,
  parseWebhookEvent,
  createPIPMPayment,
};
