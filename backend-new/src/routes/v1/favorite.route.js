/**
 * Favorite Routes
 * Favorite management endpoints
 */
import { Router } from 'express';
import * as favoriteController from '../../controllers/favorite.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { favoriteValidation } from '../../validations/favorite.validation.js';

const router = Router();

// All favorite routes require authentication
router.use(authenticate);

// Only tourists can use favorites
router.use(authorizeRoles('Tourist'));

/**
 * @route   GET /api/v1/favorites
 * @desc    Get all favorites
 * @access  Private/Tourist
 */
router.get(
  '/',
  asyncHandler(favoriteController.getAllFavorites)
);

/**
 * @route   GET /api/v1/favorites/type/:type
 * @desc    Get favorites by type
 * @access  Private/Tourist
 */
router.get(
  '/type/:type',
  validateRequest(favoriteValidation.getFavoritesByType),
  asyncHandler(favoriteController.getFavoritesByType)
);

/**
 * @route   GET /api/v1/favorites/check
 * @desc    Check if item is favorited
 * @access  Private/Tourist
 */
router.get(
  '/check',
  validateRequest(favoriteValidation.checkFavorite),
  asyncHandler(favoriteController.checkFavorite)
);

/**
 * @route   GET /api/v1/favorites/count
 * @desc    Get favorite counts by type
 * @access  Private/Tourist
 */
router.get(
  '/count',
  asyncHandler(favoriteController.getFavoriteCount)
);

/**
 * @route   POST /api/v1/favorites
 * @desc    Add a favorite
 * @access  Private/Tourist
 */
router.post(
  '/',
  validateRequest(favoriteValidation.addFavorite),
  asyncHandler(favoriteController.addFavorite)
);

/**
 * @route   POST /api/v1/favorites/toggle
 * @desc    Toggle favorite status
 * @access  Private/Tourist
 */
router.post(
  '/toggle',
  validateRequest(favoriteValidation.toggleFavorite),
  asyncHandler(favoriteController.toggleFavorite)
);

/**
 * @route   DELETE /api/v1/favorites
 * @desc    Remove a favorite
 * @access  Private/Tourist
 */
router.delete(
  '/',
  validateRequest(favoriteValidation.removeFavorite),
  asyncHandler(favoriteController.removeFavorite)
);

/**
 * @route   DELETE /api/v1/favorites/clear
 * @desc    Clear all favorites
 * @access  Private/Tourist
 */
router.delete(
  '/clear',
  asyncHandler(favoriteController.clearFavorites)
);

export default router;
