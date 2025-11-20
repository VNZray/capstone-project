import express from 'express';
import * as authController from '../controller/auth/authController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

export default router;

