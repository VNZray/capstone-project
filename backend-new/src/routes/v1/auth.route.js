/**
 * Auth Routes
 * Authentication and authorization endpoints
 */
import { Router } from 'express';
import * as authController from '../../controllers/auth.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { authRateLimiter } from '../../middlewares/rate-limiter.js';
import { authValidation } from '../../validations/auth.validation.js';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  authRateLimiter,
  validateRequest(authValidation.register),
  asyncHandler(authController.register)
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  authRateLimiter,
  validateRequest(authValidation.login),
  asyncHandler(authController.login)
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh',
  asyncHandler(authController.refreshToken)
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  asyncHandler(authController.logout)
);

/**
 * @route   POST /api/v1/auth/verify-otp
 * @desc    Verify OTP for account activation
 * @access  Public
 */
router.post(
  '/verify-otp',
  authRateLimiter,
  validateRequest(authValidation.verifyOtp),
  asyncHandler(authController.verifyOtp)
);

/**
 * @route   POST /api/v1/auth/resend-otp
 * @desc    Resend OTP
 * @access  Public
 */
router.post(
  '/resend-otp',
  authRateLimiter,
  validateRequest(authValidation.resendOtp),
  asyncHandler(authController.resendOtp)
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(authController.getMe)
);

export default router;
