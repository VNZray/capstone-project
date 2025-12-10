import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";
import * as controller from "../controller/testNotificationController.js";

const router = express.Router();

// Test push notification (Admin/Development only)
router.post(
  "/push-notification",
  authenticate,
  authorizeRole("Admin", "Tourist"),
  controller.testPushNotification
);

// Test full notification flow (Admin/Development only)
router.post(
  "/notification",
  authenticate,
  authorizeRole("Admin", "Tourist"),
  controller.testNotification
);

export default router;
