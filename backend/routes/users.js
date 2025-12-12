import express from "express";
import * as userController from "../controller/auth/UserController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

// User CRUD
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/", userController.insertUser);
router.put("/:id", userController.updateUser);
router.patch("/:id", userController.updateUser); // Support PATCH for partial updates
router.delete("/:id", userController.deleteUser);

// Staff user creation (for business owners adding staff)
router.post(
  "/staff",
  authenticate,
  authorizeRole("Admin", "Business Owner", "Manager"),
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