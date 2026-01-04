import express from "express";
import * as userController from "../controller/auth/UserController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeAny, authorizeScope, authorize } from "../middleware/authorizeRole.js";

const router = express.Router();

// User CRUD - protected routes requiring manage_users permission
router.get(
  "/",
  authenticate,
  authorizeScope('platform'),
  authorize('manage_users'),
  userController.getAllUsers
);
router.get(
  "/:id",
  authenticate,
  authorizeScope('platform'),
  authorize('manage_users'),
  userController.getUserById
);
router.post(
  "/",
  authenticate,
  authorizeScope('platform'),
  authorize('manage_users'),
  userController.insertUser
);
router.put(
  "/:id",
  authenticate,
  authorizeScope('platform'),
  authorize('manage_users'),
  userController.updateUser
);
router.patch(
  "/:id",
  authenticate,
  authorizeScope('platform'),
  authorize('manage_users'),
  userController.updateUser
);
router.delete(
  "/:id",
  authenticate,
  authorizeScope('platform'),
  authorize('manage_users'),
  userController.deleteUser
);

// Staff user creation - requires add_staff permission (Business Owner, Manager, or Admin)
router.post(
  "/staff",
  authenticate,
  authorizeAny("add_staff", "manage_users"),
  userController.insertStaffUser
);

// Password change (authenticated users)
router.post(
  "/change-password",
  authenticate,
  userController.changePassword
);

// Complete staff profile (authenticated users)
router.post(
  "/complete-profile",
  authenticate,
  userController.completeStaffProfile
);

// User role management
router.get("/", userController.getAllUserRoles);
router.get("/:user_role_id", userController.getUsersByRoleId);
router.post("/", userController.insertUserRole);
router.put("/:id", userController.updateUserRole);
router.put("/role", userController.updateUserRoleByName);

// Login removed - use /api/auth/login
// router.post("/login", userController.loginUser);

export default router;