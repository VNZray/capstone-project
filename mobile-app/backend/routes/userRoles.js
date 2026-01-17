/**
 * User Roles Routes (Mobile Backend)
 * Provides user role lookup for authentication flow
 */

import express from "express";
import * as userController from "../controller/auth/UserController.js";

const router = express.Router();

// Get all user roles
router.get("/", userController.getAllUserRoles);

// Get user role by ID (needed for login flow)
router.get("/:id", userController.getUserRoleById);

export default router;
