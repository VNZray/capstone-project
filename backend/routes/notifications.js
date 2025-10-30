import express from "express";
import * as notificationController from "../controller/notificationController.js";

const router = express.Router();

// ==================== NOTIFICATION ROUTES ====================

// Notifications
router.get("/user/:userId", notificationController.getNotificationsByUserId);
router.get("/user/:userId/unread", notificationController.getUnreadNotificationsByUserId);
router.get("/user/:userId/unread/count", notificationController.getUnreadNotificationCount);
router.post("/user/:userId/mark-all-read", notificationController.markAllNotificationsAsRead);
router.get("/:id", notificationController.getNotificationById);
router.post("/", notificationController.insertNotification);
router.put("/:id/read", notificationController.markNotificationAsRead);
router.put("/:id/delivery-status", notificationController.updateNotificationDeliveryStatus);
router.delete("/:id", notificationController.deleteNotification);

export default router;
