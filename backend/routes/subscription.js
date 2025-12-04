import express from "express";
import * as subscriptionController from "../controller/subscriptionController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// Public routes
router.get("/plans", subscriptionController.getSubscriptionPlans);

// Protected routes (require authentication)
router.use(authenticate);

// Get subscription by business ID
router.get("/business/:business_id", subscriptionController.getBusinessSubscription);

// Check booking access for business
router.get("/business/:business_id/booking-access", subscriptionController.checkBookingAccess);

// Get subscription history for business
router.get("/business/:business_id/history", subscriptionController.getSubscriptionHistory);

// Create/upgrade subscription
router.post("/subscribe", subscriptionController.createSubscription);

// Cancel subscription
router.delete("/business/:business_id/cancel", subscriptionController.cancelSubscription);

export default router;
