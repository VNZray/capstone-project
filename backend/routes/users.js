import express from "express";
import * as userController from "../controller/auth/UserController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeAny, authorizeRole, authorize } from "../middleware/authorizeRole.js";

const router = express.Router();

// ============================================================
// SELF-SERVICE ROUTES (Any authenticated user for their own data)
// ============================================================

// Get current user's own profile - no special permissions required
router.get(
  "/me",
  authenticate,
  userController.getCurrentUser
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

// ============================================================
// ADMIN USER MANAGEMENT (Platform scope + manage_users permission)
// ============================================================

// User CRUD - protected routes requiring manage_users permission
router.get(
  "/",
  authenticate,
  userController.getAllUsers
);
router.get(
  "/:id",
  authenticate,
  userController.getUserById
);
router.post(
  "/",
  authenticate,
  userController.insertUser
);
router.put(
  "/:id",
  authenticate,
  userController.updateUser
);
router.patch(
  "/:id",
  authenticate,
  userController.updateUser
);
router.delete(
  "/:id",
  authenticate,
  userController.deleteUser
);

// Staff user creation - requires add_staff permission (Business Owner, Manager, or Admin)
router.post(
  "/staff",
  authenticate,
  userController.insertStaffUser
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