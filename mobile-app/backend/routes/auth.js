import express from 'express';
import * as authController from '../controller/auth/authController.js';
import * as userStatusController from '../controller/auth/userStatusController.js';
import { authenticate } from '../middleware/authenticate.js';
import { loginRateLimiter, refreshRateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Apply rate limiting to sensitive auth endpoints
router.post('/login', loginRateLimiter, authController.login);
router.post('/refresh', refreshRateLimiter, authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

// User status endpoints
router.put('/status/online', userStatusController.updateOnlineStatus);
router.post('/status/heartbeat', authenticate, userStatusController.heartbeat);
router.post('/status/activity', authenticate, userStatusController.updateActivity);
router.get('/status/online-users', authenticate, userStatusController.getOnlineUsers);
router.get('/status/:userId', authenticate, userStatusController.getUserStatus);
router.post('/status/cleanup', authenticate, userStatusController.cleanupInactiveUsers);

export default router;

