/**
 * User Role Routes
 * User role management endpoints
 */
import { Router } from 'express';
import * as userController from '../../controllers/user.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';

const router = Router();

/**
 * @route   GET /api/v1/user-roles
 * @desc    Get all user roles
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  asyncHandler(userController.getAllUserRoles)
);

/**
 * @route   GET /api/v1/user-roles/:id
 * @desc    Get user role by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(userController.getUserRoleById)
);

/**
 * @route   GET /api/v1/user-roles/users/:user_role_id
 * @desc    Get users by role ID
 * @access  Private/Admin
 */
router.get(
  '/users/:user_role_id',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(userController.getUsersByRoleId)
);

/**
 * @route   POST /api/v1/user-roles
 * @desc    Create user role
 * @access  Private/Admin
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(userController.insertUserRole)
);

/**
 * @route   PUT /api/v1/user-roles/:id
 * @desc    Update user role by ID
 * @access  Private/Admin
 */
router.put(
  '/:id',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(userController.updateUserRole)
);

/**
 * @route   PUT /api/v1/user-roles/role
 * @desc    Update user role by name
 * @access  Private/Admin
 */
router.put(
  '/role',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(userController.updateUserRoleByName)
);

export default router;
