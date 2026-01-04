/**
 * Role Routes - Enhanced RBAC API Endpoints
 * 
 * Provides routes for the two-tier RBAC system:
 * - System roles (Platform admin only)
 * - Business roles (Business owners with add_staff permission)
 * 
 * @module routes/roles
 */

import express from "express";
import * as roleController from "../controller/auth/RoleController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeScope, authorize, authorizeAny } from "../middleware/authorizeRole.js";

const router = express.Router();

// ============================================================
// PUBLIC / READ-ONLY ENDPOINTS
// ============================================================

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

// Create a custom business role (requires add_staff permission)
router.post(
  "/business/custom",
  authenticate,
  authorize('add_staff'),
  roleController.createCustomBusinessRole
);

// Update a business role
router.put(
  "/business/:id",
  authenticate,
  authorize('add_staff'),
  roleController.updateBusinessRole
);

// Delete a business role
router.delete(
  "/business/:id",
  authenticate,
  authorize('add_staff'),
  roleController.deleteBusinessRole
);

// ============================================================
// ROLE PERMISSION MANAGEMENT
// ============================================================

// Add permissions to a role
router.post(
  "/:id/permissions",
  authenticate,
  authorize('add_staff'),
  roleController.addRolePermissions
);

// Remove permissions from a role
router.delete(
  "/:id/permissions",
  authenticate,
  authorize('add_staff'),
  roleController.removeRolePermissions
);

// Get effective permissions for a role (includes inheritance)
router.get(
  "/:id/permissions/effective",
  authenticate,
  roleController.getEffectivePermissions
);

// ============================================================
// PERMISSION OVERRIDES (for fine-grained control on business roles)
// ============================================================

// Add a permission override
router.post(
  "/:id/overrides",
  authenticate,
  authorize('add_staff'),
  roleController.addPermissionOverride
);

// Remove a permission override
router.delete(
  "/:id/overrides/:permissionId",
  authenticate,
  authorize('add_staff'),
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

// Create a new system role (platform admin only)
router.post(
  "/system",
  authenticate,
  authorizeScope('platform'),
  authorize('manage_users'),
  roleController.createSystemRole
);

// ============================================================
// SINGLE ROLE ACCESS (must be after specific routes)
// ============================================================

// Get a single role with permissions
router.get("/:id", authenticate, roleController.getRoleById);

export default router;
