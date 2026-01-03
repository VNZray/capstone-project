import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import * as controller from "../controller/notificationPreferencesController.js";

const router = express.Router();

// ==================== NOTIFICATION PREFERENCES ROUTES ====================

// Get notification preferences for a user
router.get("/:userId", authenticate, controller.getNotificationPreferences);

// Update notification preferences
router.put("/:userId", authenticate, controller.updateNotificationPreferences);

// ==================== PUSH TOKEN ROUTES ====================

// Register or update push token
router.post("/push-tokens", authenticate, controller.registerPushToken);

// Get active push tokens for user
router.get("/push-tokens/:userId", authenticate, controller.getActivePushTokens);

// Deactivate push token
router.put("/push-tokens/:token/deactivate", authenticate, controller.deactivatePushToken);

// Delete push token
router.delete("/push-tokens/:token", authenticate, controller.deletePushToken);

export default router;
