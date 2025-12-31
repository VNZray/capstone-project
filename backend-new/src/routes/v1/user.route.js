/**
 * User Routes
 * User management - matches old backend patterns
 */
import { Router } from 'express';
import * as userController from '../../controllers/user.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';

const router = Router();

// GET all users (Admin only)
router.get(
  '/',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(userController.getAllUsers)
);

// GET all user roles
router.get(
  '/roles',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(userController.getAllRoles)
);

// GET users by role
router.get(
  '/role/:role_id',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(userController.getUsersByRole)
);

// GET user by email
router.get(
  '/email/:email',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(userController.getUserByEmail)
);

// POST create user
router.post(
  '/',
  asyncHandler(userController.insertUser)
);

// POST create staff user (for business owners adding staff)
router.post(
  '/staff',
  authenticate,
  authorizeRoles('Admin', 'Business Owner', 'Manager'),
  asyncHandler(userController.insertStaffUser)
);

// POST change password (authenticated users)
router.post(
  '/change-password',
  authenticate,
  asyncHandler(userController.changePassword)
);

// POST complete staff profile (authenticated users)
router.post(
  '/complete-profile',
  authenticate,
  asyncHandler(userController.completeStaffProfile)
);

// GET user by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(userController.getUserById)
);

// PUT update user
router.put(
  '/:id',
  authenticate,
  asyncHandler(userController.updateUser)
);

// PATCH update user (partial updates)
router.patch(
  '/:id',
  authenticate,
  asyncHandler(userController.updateUser)
);

// PATCH toggle user status
router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(userController.toggleUserStatus)
);

// DELETE user
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(userController.deleteUser)
);

export default router;
