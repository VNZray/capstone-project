/**
 * Role Routes - Enhanced RBAC API Endpoints
 * 
 * Provides routes for the three-tier RBAC system:
 * - System roles (Admin only)
 * - Preset roles (Admin only for create, all authenticated for read)
 * - Business roles (Business owners)
 * 
 * @module routes/roles
 */

import express from "express";
import * as roleController from "../controller/auth/RoleController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

// ============================================================
// PUBLIC / READ-ONLY ENDPOINTS
// ============================================================

// Get all preset roles (templates) - accessible to authenticated users
router.get("/presets", authenticate, roleController.getPresetRoles);

// Get all system roles - accessible to authenticated users
router.get("/system", authenticate, roleController.getSystemRoles);

// Get roles by type - accessible to authenticated users
router.get("/types/:type", authenticate, roleController.getRolesByType);

// Get permission categories - for UI building
router.get("/permission-categories", authenticate, roleController.getPermissionCategories);

// Get permissions grouped by category - for role builder UI
router.get("/permissions/grouped", authenticate, roleController.getPermissionsGrouped);

// ============================================================
// BUSINESS ROLE MANAGEMENT
// ============================================================

// Get all roles for a specific business
router.get(
  "/business/:businessId",
  authenticate,
  roleController.getBusinessRoles
);

// Clone a preset role for a business
router.post(
  "/business/clone",
  authenticate,
  authorizeRole("Admin", "Business Owner"),
  roleController.clonePresetRole
);

// Create a fully custom business role
router.post(
  "/business/custom",
  authenticate,
  authorizeRole("Admin", "Business Owner"),
  roleController.createCustomBusinessRole
);

// Update a business role
router.put(
  "/business/:id",
  authenticate,
  authorizeRole("Admin", "Business Owner"),
  roleController.updateBusinessRole
);

// Delete a business role
router.delete(
  "/business/:id",
  authenticate,
  authorizeRole("Admin", "Business Owner"),
  roleController.deleteBusinessRole
);

// ============================================================
// ROLE PERMISSION MANAGEMENT
// ============================================================

// Add permissions to a role
router.post(
  "/:id/permissions",
  authenticate,
  authorizeRole("Admin", "Business Owner"),
  roleController.addRolePermissions
);

// Remove permissions from a role
router.delete(
  "/:id/permissions",
  authenticate,
  authorizeRole("Admin", "Business Owner"),
  roleController.removeRolePermissions
);

// Get effective permissions for a role (includes inheritance)
router.get(
  "/:id/permissions/effective",
  authenticate,
  roleController.getEffectivePermissions
);

// ============================================================
// PERMISSION OVERRIDES (for preset-based roles)
// ============================================================

// Add a permission override
router.post(
  "/:id/overrides",
  authenticate,
  authorizeRole("Admin", "Business Owner"),
  roleController.addPermissionOverride
);

// Remove a permission override
router.delete(
  "/:id/overrides/:permissionId",
  authenticate,
  authorizeRole("Admin", "Business Owner"),
  roleController.removePermissionOverride
);

// ============================================================
// USER PERMISSIONS
// ============================================================

// Get effective permissions for a user
router.get(
  "/user/:userId/permissions",
  authenticate,
  roleController.getUserEffectivePermissions
);

// ============================================================
// AUDIT LOG
// ============================================================

// Get audit log for a role
router.get(
  "/:id/audit",
  authenticate,
  roleController.getRoleAuditLog
);

// ============================================================
// ADMIN-ONLY ENDPOINTS
// ============================================================

// Create a new system role
router.post(
  "/system",
  authenticate,
  authorizeRole("Admin"),
  roleController.createSystemRole
);

// Create a new preset role (template)
router.post(
  "/preset",
  authenticate,
  authorizeRole("Admin"),
  roleController.createPresetRole
);

// ============================================================
// SINGLE ROLE ACCESS (must be after specific routes)
// ============================================================

// Get a single role with permissions
router.get("/:id", authenticate, roleController.getRoleById);

export default router;
