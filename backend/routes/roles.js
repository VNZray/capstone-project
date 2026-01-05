/**
 * Role Routes - Simplified RBAC API Endpoints
 * 
 * After RBAC simplification, this router only handles:
 * - System role listing (read-only)
 * - Permission category listing (for UI building)
 * 
 * Staff permission management is in /api/staff routes.
 * 
 * @module routes/roles
 */

import express from "express";
import * as roleController from "../controller/auth/RoleController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// ============================================================
// SYSTEM ROLES (read-only)
// ============================================================

// Get all system roles - accessible to authenticated users
router.get("/system", authenticate, roleController.getSystemRoles);

// Get roles by type - accessible to authenticated users
router.get("/types/:type", authenticate, roleController.getRolesByType);

// ============================================================
// PERMISSION CATEGORIES (for UI building)
// ============================================================

// Get permission categories - for permission assignment UI
router.get("/permission-categories", authenticate, roleController.getPermissionCategories);

// Get permissions grouped by category - for staff permission UI
router.get("/permissions/grouped", authenticate, roleController.getPermissionsGrouped);

// ============================================================
// SINGLE ROLE ACCESS
// ============================================================

// Get a single role with permissions
router.get("/:id", authenticate, roleController.getRoleById);

export default router;
