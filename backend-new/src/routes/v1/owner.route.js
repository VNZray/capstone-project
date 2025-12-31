/**
 * Owner Routes
 * Owner profile management endpoints
 */
import { Router } from 'express';
import * as ownerController from '../../controllers/owner.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';

const router = Router();

/**
 * @route   POST /api/v1/owners
 * @desc    Create owner (part of user signup flow)
 * @access  Public
 */
router.post(
  '/',
  asyncHandler(ownerController.insertOwner)
);

// Protected routes
router.use(authenticate);

/**
 * @route   GET /api/v1/owners
 * @desc    Get all owners
 * @access  Private/Admin
 */
router.get(
  '/',
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(ownerController.getAllOwners)
);

/**
 * @route   GET /api/v1/owners/user/:user_id
 * @desc    Get owner by user ID
 * @access  Private
 */
router.get(
  '/user/:user_id',
  asyncHandler(ownerController.getOwnerByUserId)
);

/**
 * @route   GET /api/v1/owners/:id
 * @desc    Get owner by ID
 * @access  Private
 */
router.get(
  '/:id',
  asyncHandler(ownerController.getOwnerById)
);

/**
 * @route   PUT /api/v1/owners/:id
 * @desc    Update owner
 * @access  Private
 */
router.put(
  '/:id',
  asyncHandler(ownerController.updateOwnerById)
);

/**
 * @route   DELETE /api/v1/owners/:id
 * @desc    Delete owner
 * @access  Private/Admin
 */
router.delete(
  '/:id',
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(ownerController.deleteOwnerById)
);

export default router;
