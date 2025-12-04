import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../utils/errorHandler.js";

/**
 * Mock Subscription Plans
 * These are the available subscription tiers for businesses
 */
export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    booking_system: false,
    promotion_tools: false,
    visibility_boost: false,
    publication: true,
    duration_days: null, // Unlimited
    description: "Basic business listing with limited features"
  },
  BASIC: {
    name: "Basic",
    price: 499,
    booking_system: true,
    promotion_tools: false,
    visibility_boost: false,
    publication: true,
    duration_days: 30,
    description: "Enable online booking system for your business"
  },
  PREMIUM: {
    name: "Premium",
    price: 999,
    booking_system: true,
    promotion_tools: true,
    visibility_boost: true,
    publication: true,
    duration_days: 30,
    description: "Full access to all features including promotions and visibility boost"
  }
};

/**
 * Get all subscription plans (mock data)
 */
export const getSubscriptionPlans = async (req, res) => {
  try {
    res.json({
      success: true,
      plans: Object.values(SUBSCRIPTION_PLANS)
    });
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return handleDbError(error, res);
  }
};

/**
 * Get subscription by business ID
 */
export const getBusinessSubscription = async (req, res) => {
  try {
    const { business_id } = req.params;

    const [rows] = await db.query(
      `SELECT * FROM subscription WHERE business_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
      [business_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active subscription found for this business"
      });
    }

    res.json({
      success: true,
      subscription: rows[0]
    });
  } catch (error) {
    console.error("Error fetching business subscription:", error);
    return handleDbError(error, res);
  }
};

/**
 * Create or upgrade subscription for a business
 */
export const createSubscription = async (req, res) => {
  try {
    const { business_id, plan_name } = req.body;

    if (!business_id || !plan_name) {
      return res.status(400).json({
        success: false,
        message: "business_id and plan_name are required"
      });
    }

    // Validate plan
    const plan = SUBSCRIPTION_PLANS[plan_name.toUpperCase()];
    if (!plan) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan name. Available plans: Free, Basic, Premium"
      });
    }

    // Check if business exists
    const [business] = await db.query(
      `SELECT id FROM business WHERE id = ?`,
      [business_id]
    );

    if (business.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Business not found"
      });
    }

    // Deactivate existing subscriptions
    await db.query(
      `UPDATE subscription SET status = 'expired' WHERE business_id = ? AND status = 'active'`,
      [business_id]
    );

    // Calculate end date
    const start_date = new Date();
    const end_date = plan.duration_days
      ? new Date(start_date.getTime() + plan.duration_days * 24 * 60 * 60 * 1000)
      : null;

    // Create new subscription
    const subscription_id = uuidv4();
    await db.query(
      `INSERT INTO subscription (
        id, business_id, plan_name, booking_system, promotion_tools,
        visibility_boost, publication, price, start_date, end_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        subscription_id,
        business_id,
        plan.name,
        plan.booking_system,
        plan.promotion_tools,
        plan.visibility_boost,
        plan.publication,
        plan.price,
        start_date,
        end_date
      ]
    );

    // Fetch created subscription
    const [created] = await db.query(
      `SELECT * FROM subscription WHERE id = ?`,
      [subscription_id]
    );

    res.status(201).json({
      success: true,
      message: `Successfully subscribed to ${plan.name} plan`,
      subscription: created[0]
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return handleDbError(error, res);
  }
};

/**
 * Check if business has active booking system
 */
export const checkBookingAccess = async (req, res) => {
  try {
    const { business_id } = req.params;

    const [rows] = await db.query(
      `SELECT booking_system, end_date, status
       FROM subscription
       WHERE business_id = ? AND status = 'active'
       ORDER BY created_at DESC LIMIT 1`,
      [business_id]
    );

    if (rows.length === 0) {
      return res.json({
        success: true,
        has_access: false,
        message: "No active subscription found"
      });
    }

    const subscription = rows[0];
    const now = new Date();
    const isExpired = subscription.end_date && new Date(subscription.end_date) < now;

    if (isExpired) {
      // Auto-expire the subscription
      await db.query(
        `UPDATE subscription SET status = 'expired' WHERE business_id = ? AND status = 'active'`,
        [business_id]
      );

      return res.json({
        success: true,
        has_access: false,
        message: "Subscription expired"
      });
    }

    res.json({
      success: true,
      has_access: subscription.booking_system,
      subscription: {
        booking_system: subscription.booking_system,
        end_date: subscription.end_date,
        status: subscription.status
      }
    });
  } catch (error) {
    console.error("Error checking booking access:", error);
    return handleDbError(error, res);
  }
};

/**
 * Cancel/Expire subscription
 */
export const cancelSubscription = async (req, res) => {
  try {
    const { business_id } = req.params;

    const [result] = await db.query(
      `UPDATE subscription SET status = 'cancelled', end_date = NOW()
       WHERE business_id = ? AND status = 'active'`,
      [business_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "No active subscription found to cancel"
      });
    }

    res.json({
      success: true,
      message: "Subscription cancelled successfully"
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return handleDbError(error, res);
  }
};

/**
 * Get all subscriptions for a business (history)
 */
export const getSubscriptionHistory = async (req, res) => {
  try {
    const { business_id } = req.params;

    const [rows] = await db.query(
      `SELECT * FROM subscription WHERE business_id = ? ORDER BY created_at DESC`,
      [business_id]
    );

    res.json({
      success: true,
      subscriptions: rows
    });
  } catch (error) {
    console.error("Error fetching subscription history:", error);
    return handleDbError(error, res);
  }
};
