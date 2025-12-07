import express from "express";
import * as notificationController from "../controller/notificationController.js";
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

// ==================== NOTIFICATION ROUTES ====================

// All notification routes require authentication
router.get("/user/:userId", authenticate, notificationController.getNotificationsByUserId);
router.get("/user/:userId/unread", authenticate, notificationController.getUnreadNotificationsByUserId);
router.get("/user/:userId/unread/count", authenticate, notificationController.getUnreadNotificationCount);
router.post("/user/:userId/mark-all-read", authenticate, notificationController.markAllNotificationsAsRead);
router.get("/:id", authenticate, notificationController.getNotificationById);
router.post("/", authenticate, authorizeRole("Admin", "Business Owner", "Manager", "Receptionist", "Staff"), notificationController.insertNotification);
router.put("/:id/read", authenticate, notificationController.markNotificationAsRead);
router.put("/:id/delivery-status", authenticate, notificationController.updateNotificationDeliveryStatus);
router.delete("/:id", authenticate, notificationController.deleteNotification);

export default router;
