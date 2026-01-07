import express from 'express';
import * as authController from '../controller/auth/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { loginRateLimiter, refreshRateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Apply rate limiting to sensitive auth endpoints
router.post('/login', loginRateLimiter, authController.login);
router.post('/refresh', refreshRateLimiter, authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

export default router;

