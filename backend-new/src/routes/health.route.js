/**
 * Health Routes
 * API health check endpoints
 */
import { Router } from 'express';
import * as healthController from '../controllers/health.controller.js';
import { asyncHandler } from '../middlewares/error-handler.js';

const router = Router();

/**
 * @route   GET /health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', asyncHandler(healthController.getHealth));

/**
 * @route   GET /health/detailed
 * @desc    Detailed health check with database status
 * @access  Public
 */
router.get('/detailed', asyncHandler(healthController.getHealthDetailed));

export default router;
