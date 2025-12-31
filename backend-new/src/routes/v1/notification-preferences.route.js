/**
 * Notification Preferences Routes
 * User notification preferences and push token management
 */
import { Router } from 'express';
import * as notificationPreferencesController from '../../controllers/notification-preferences.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// User routes
router.get('/me', asyncHandler(notificationPreferencesController.getMyNotificationPreferences));
router.put('/me', asyncHandler(notificationPreferencesController.updateNotificationPreferences));
router.post('/push-token', asyncHandler(notificationPreferencesController.registerPushToken));
router.delete('/push-token', asyncHandler(notificationPreferencesController.unregisterPushToken));
router.delete('/me', asyncHandler(notificationPreferencesController.deleteNotificationPreferences));

// Admin routes
router.get(
  '/user/:userId',
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(notificationPreferencesController.getNotificationPreferencesByUserId)
);

router.get(
  '/user/:userId/push-token',
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(notificationPreferencesController.getPushTokenByUserId)
);

export default router;
