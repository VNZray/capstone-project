/**
 * Notification Routes
 * Notification management endpoints
 */
import { Router } from 'express';
import * as notificationController from '../../controllers/notification.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { notificationValidation } from '../../validations/notification.validation.js';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get(
  '/',
  validateRequest(notificationValidation.getNotifications),
  asyncHandler(notificationController.getNotifications)
);

/**
 * @route   GET /api/v1/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get(
  '/unread-count',
  asyncHandler(notificationController.getUnreadCount)
);

/**
 * @route   GET /api/v1/notifications/preferences
 * @desc    Get notification preferences
 * @access  Private
 */
router.get(
  '/preferences',
  asyncHandler(notificationController.getPreferences)
);

/**
 * @route   PUT /api/v1/notifications/preferences
 * @desc    Update notification preferences
 * @access  Private
 */
router.put(
  '/preferences',
  validateRequest(notificationValidation.updatePreferences),
  asyncHandler(notificationController.updatePreferences)
);

/**
 * @route   PATCH /api/v1/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.patch(
  '/:id/read',
  asyncHandler(notificationController.markAsRead)
);

/**
 * @route   PATCH /api/v1/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch(
  '/read-all',
  asyncHandler(notificationController.markAllAsRead)
);

/**
 * @route   DELETE /api/v1/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete(
  '/:id',
  asyncHandler(notificationController.deleteNotification)
);

/**
 * @route   POST /api/v1/notifications/test
 * @desc    Send test notification
 * @access  Private
 */
router.post(
  '/test',
  asyncHandler(notificationController.sendTestNotification)
);

export default router;
