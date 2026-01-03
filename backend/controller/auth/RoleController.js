/**
 * Role Controller - Enhanced RBAC HTTP Endpoints
 * 
 * Provides REST API endpoints for the two-tier RBAC system:
 * - System role management (admin only)
 * - Business role management (business owners and tourism admins/officers)
 * 
 * @module controller/auth/RoleController
 */

import { handleDbError } from "../../utils/errorHandler.js";
import { sanitizeString } from "../../utils/orderValidation.js";
import * as roleService from "../../services/roleService.js";
import db from "../../db.js";
import { hasBusinessAccess } from "../../utils/authHelpers.js";

// ============================================================
// INPUT VALIDATION
// ============================================================

/**
 * Validate role name
 * @param {string} name - Role name to validate
 * @returns {string|null} Error message or null if valid
 */
function validateRoleName(name) {
  if (!name || typeof name !== 'string') {
    return 'Role name is required';
  }
  
  const sanitized = sanitizeString(name);
  
  if (sanitized.length < 2) {
    return 'Role name must be at least 2 characters';
  }
  
  if (sanitized.length > 20) {
    return 'Role name must be 20 characters or less';
  }
  
  // Only allow alphanumeric, spaces, and basic punctuation
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(sanitized)) {
    return 'Role name contains invalid characters';
  }
  
  return null;
}

/**
 * Validate permission IDs array
 * @param {any} permissionIds - Permission IDs to validate
 * @returns {string|null} Error message or null if valid
 */
function validatePermissionIds(permissionIds) {
  if (!permissionIds) return null; // Optional
  
  if (!Array.isArray(permissionIds)) {
    return 'Permission IDs must be an array';
  }
  
  if (permissionIds.length > 100) {
    return 'Too many permissions (max 100)';
  }
  
  for (const id of permissionIds) {
    if (typeof id !== 'number' || !Number.isInteger(id) || id < 1) {
      return 'Invalid permission ID';
    }
  }
  
  return null;
}

// ============================================================
// ROLE TYPE RETRIEVAL
// ============================================================

/**
 * GET /api/roles/types/:type
 * Get all roles of a specific type
 */
export async function getRolesByType(req, res) {
  const { type } = req.params;
  
  try {
    const roles = await roleService.getRolesByType(type);
    return res.json(roles);
  } catch (error) {
    if (error.message.includes('Invalid role type')) {
      return res.status(400).json({ message: error.message });
    }
    return handleDbError(error, res);
  }
}

/**
 * GET /api/roles/system
 * Get all system roles
 */
export async function getSystemRoles(req, res) {
  try {
    const roles = await roleService.getRolesByType(roleService.ROLE_TYPES.SYSTEM);
    return res.json(roles);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// ============================================================
// BUSINESS ROLE MANAGEMENT
// ============================================================

/**
 * GET /api/roles/business/:businessId
 * Get all roles for a specific business
 */
export async function getBusinessRoles(req, res) {
  const { businessId } = req.params;
  
  if (!businessId) {
    return res.status(400).json({ message: 'Business ID is required' });
  }
  
  // Authorization: user must be admin, tourism officer, or have business access
  const userRole = req.user?.role;
  
  if (!['Admin', 'Tourism Officer'].includes(userRole)) {
    // Check if user has access to this business (owner or staff)
    const hasAccess = await hasBusinessAccess(businessId, req.user, userRole);
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized to view this business\'s roles' });
    }
  }
  
  try {
    const roles = await roleService.getBusinessRoles(businessId);
    return res.json(roles);
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * GET /api/roles/:id
 * Get a single role with permissions
 */
export async function getRoleById(req, res) {
  const { id } = req.params;
  
  try {
    const role = await roleService.getRoleWithPermissions(parseInt(id, 10));
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Authorization check for business roles
    if (role.role_type === roleService.ROLE_TYPES.BUSINESS) {
      const userRole = req.user?.role;
      
      if (!['Admin', 'Tourism Officer'].includes(userRole)) {
        const hasAccess = await hasBusinessAccess(role.role_for, req.user, userRole);
        
        if (!hasAccess) {
          return res.status(403).json({ message: 'Not authorized to view this role' });
        }
      }
    }
    
    return res.json(role);
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * POST /api/roles/business/custom
 * Create a fully custom business role
 */
export async function createCustomBusinessRole(req, res) {
  const { businessId, roleName, roleDescription, permissionIds } = req.body;
  
  // Validation
  if (!businessId) {
    return res.status(400).json({ message: 'Business ID is required' });
  }
  
  const nameError = validateRoleName(roleName);
  if (nameError) {
    return res.status(400).json({ message: nameError });
  }
  
  const permError = validatePermissionIds(permissionIds);
  if (permError) {
    return res.status(400).json({ message: permError });
  }
  
  // Authorization: user must be the business owner or admin
  const userId = req.user?.id;
  const userRole = req.user?.role;
  
  if (!['Admin'].includes(userRole)) {
    const hasAccess = await hasBusinessAccess(businessId, req.user, userRole);
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized to create roles for this business' });
    }
  }
  
  // Check for duplicate name
  const isAvailable = await roleService.isRoleNameAvailable(
    sanitizeString(roleName),
    businessId
  );
  
  if (!isAvailable) {
    return res.status(409).json({ message: 'A role with this name already exists for this business' });
  }
  
  try {
    const role = await roleService.createCustomBusinessRole({
      businessId,
      roleName: sanitizeString(roleName),
      roleDescription: roleDescription ? sanitizeString(roleDescription) : null,
      permissionIds: permissionIds || [],
      createdBy: userId
    });
    
    return res.status(201).json(role);
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * PUT /api/roles/business/:id
 * Update a business role
 */
export async function updateBusinessRole(req, res) {
  const { id } = req.params;
  const { businessId, roleName, roleDescription, permissionIds } = req.body;
  
  const roleId = parseInt(id, 10);
  
  // Validation
  if (roleName) {
    const nameError = validateRoleName(roleName);
    if (nameError) {
      return res.status(400).json({ message: nameError });
    }
  }
  
  if (permissionIds !== undefined) {
    const permError = validatePermissionIds(permissionIds);
    if (permError) {
      return res.status(400).json({ message: permError });
    }
  }
  
  // Get the role first to verify business ownership
  const existingRole = await roleService.getRoleById(roleId);
  
  if (!existingRole) {
    return res.status(404).json({ message: 'Role not found' });
  }
  
  if (existingRole.role_type !== roleService.ROLE_TYPES.BUSINESS) {
    return res.status(400).json({ message: 'Can only update business-specific roles' });
  }
  
  if (existingRole.is_immutable) {
    return res.status(400).json({ message: 'Cannot modify immutable role' });
  }
  
  const actualBusinessId = businessId || existingRole.role_for;
  
  // Authorization: user must be the business owner or admin
  const userId = req.user?.id;
  const userRole = req.user?.role;
  
  if (!['Admin'].includes(userRole)) {
    const hasAccess = await hasBusinessAccess(actualBusinessId, req.user, userRole);
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized to update this role' });
    }
  }
  
  // Check for duplicate name if changing
  if (roleName) {
    const isAvailable = await roleService.isRoleNameAvailable(
      sanitizeString(roleName),
      actualBusinessId,
      roleId
    );
    
    if (!isAvailable) {
      return res.status(409).json({ message: 'A role with this name already exists for this business' });
    }
  }
  
  try {
    // Update role metadata
    const role = await roleService.updateBusinessRole({
      roleId,
      businessId: actualBusinessId,
      roleName: roleName ? sanitizeString(roleName) : null,
      roleDescription: roleDescription !== undefined ? sanitizeString(roleDescription) : null,
      updatedBy: userId
    });
    
    // Update permissions if provided
    if (permissionIds !== undefined) {
      await roleService.setRolePermissions(roleId, permissionIds, userId);
    }
    
    // Return updated role with permissions
    const updatedRole = await roleService.getRoleWithPermissions(roleId);
    
    return res.json(updatedRole);
  } catch (error) {
    if (error.message.includes('immutable') || error.message.includes('belong to')) {
      return res.status(400).json({ message: error.message });
    }
    return handleDbError(error, res);
  }
}

/**
 * DELETE /api/roles/business/:id
 * Delete a business role
 */
export async function deleteBusinessRole(req, res) {
  const { id } = req.params;
  const { businessId } = req.body;
  
  const roleId = parseInt(id, 10);
  
  // Get the role first to verify business ownership
  const existingRole = await roleService.getRoleById(roleId);
  
  if (!existingRole) {
    return res.status(404).json({ message: 'Role not found' });
  }
  
  const actualBusinessId = businessId || existingRole.role_for;
  
  // Authorization: user must be the business owner or admin
  const userId = req.user?.id;
  const userRole = req.user?.role;
  
  if (!['Admin'].includes(userRole)) {
    const hasAccess = await hasBusinessAccess(actualBusinessId, req.user, userRole);
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized to delete this role' });
    }
  }
  
  try {
    const deleted = await roleService.deleteBusinessRole({
      roleId,
      businessId: actualBusinessId,
      deletedBy: userId
    });
    
    if (deleted) {
      return res.json({ message: 'Role deleted successfully' });
    } else {
      return res.status(500).json({ message: 'Failed to delete role' });
    }
  } catch (error) {
    if (error.message.includes('assigned users') || error.message.includes('only delete')) {
      return res.status(400).json({ message: error.message });
    }
    return handleDbError(error, res);
  }
}

// ============================================================
// PERMISSION MANAGEMENT FOR ROLES
// ============================================================

/**
 * POST /api/roles/:id/permissions
 * Add permissions to a role
 */
export async function addRolePermissions(req, res) {
  const { id } = req.params;
  const { permissionIds, businessId } = req.body;
  
  const roleId = parseInt(id, 10);
  
  // Validation
  const permError = validatePermissionIds(permissionIds);
  if (permError || !permissionIds || permissionIds.length === 0) {
    return res.status(400).json({ message: permError || 'Permission IDs are required' });
  }
  
  // Get role and verify ownership
  const existingRole = await roleService.getRoleById(roleId);
  
  if (!existingRole) {
    return res.status(404).json({ message: 'Role not found' });
  }
  
  if (existingRole.role_type !== roleService.ROLE_TYPES.BUSINESS) {
    return res.status(400).json({ message: 'Can only modify business-specific roles' });
  }
  
  const actualBusinessId = businessId || existingRole.role_for;
  
  // Authorization
  const userId = req.user?.id;
  const userRole = req.user?.role;
  
  if (!['Admin'].includes(userRole)) {
    const canManage = await roleService.canBusinessManageRole(roleId, actualBusinessId);
    
    if (!canManage) {
      return res.status(403).json({ message: 'Not authorized to modify this role' });
    }
    
    const hasAccess = await hasBusinessAccess(actualBusinessId, req.user, userRole);
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized to modify this role' });
    }
  }
  
  try {
    await roleService.assignPermissionsToRole(roleId, permissionIds);
    
    // Log the action
    await roleService.logRoleAction(
      roleId,
      'permission_added',
      null,
      { added_permissions: permissionIds },
      userId
    );
    
    const updatedRole = await roleService.getRoleWithPermissions(roleId);
    return res.json(updatedRole);
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * DELETE /api/roles/:id/permissions
 * Remove permissions from a role
 */
export async function removeRolePermissions(req, res) {
  const { id } = req.params;
  const { permissionIds, businessId } = req.body;
  
  const roleId = parseInt(id, 10);
  
  // Validation
  const permError = validatePermissionIds(permissionIds);
  if (permError || !permissionIds || permissionIds.length === 0) {
    return res.status(400).json({ message: permError || 'Permission IDs are required' });
  }
  
  // Get role and verify ownership
  const existingRole = await roleService.getRoleById(roleId);
  
  if (!existingRole) {
    return res.status(404).json({ message: 'Role not found' });
  }
  
  if (existingRole.role_type !== roleService.ROLE_TYPES.BUSINESS) {
    return res.status(400).json({ message: 'Can only modify business-specific roles' });
  }
  
  const actualBusinessId = businessId || existingRole.role_for;
  
  // Authorization
  const userId = req.user?.id;
  const userRole = req.user?.role;
  
  if (!['Admin'].includes(userRole)) {
    const hasAccess = await hasBusinessAccess(actualBusinessId, req.user, userRole);
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized to modify this role' });
    }
  }
  
  try {
    await roleService.removePermissionsFromRole(roleId, permissionIds);
    
    // Log the action
    await roleService.logRoleAction(
      roleId,
      'permission_removed',
      null,
      { removed_permissions: permissionIds },
      userId
    );
    
    const updatedRole = await roleService.getRoleWithPermissions(roleId);
    return res.json(updatedRole);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// ============================================================
// PERMISSION OVERRIDES
// ============================================================

/**
 * POST /api/roles/:id/overrides
 * Add a permission override to a preset-based role
 */
export async function addPermissionOverride(req, res) {
  const { id } = req.params;
  const { permissionId, isGranted, businessId } = req.body;
  
  const roleId = parseInt(id, 10);
  
  if (typeof permissionId !== 'number' || typeof isGranted !== 'boolean') {
    return res.status(400).json({ message: 'Permission ID and isGranted boolean are required' });
  }
  
  // Get role and verify
  const existingRole = await roleService.getRoleById(roleId);
  
  if (!existingRole) {
    return res.status(404).json({ message: 'Role not found' });
  }
  
  if (existingRole.role_type !== roleService.ROLE_TYPES.BUSINESS) {
    return res.status(400).json({ message: 'Overrides only apply to business roles' });
  }
  
  if (!existingRole.based_on_role_id) {
    return res.status(400).json({ message: 'Overrides only apply to preset-based roles' });
  }
  
  const actualBusinessId = businessId || existingRole.role_for;
  
  // Authorization
  const userId = req.user?.id;
  const userRole = req.user?.role;
  
  if (!['Admin'].includes(userRole)) {
    const hasAccess = await hasBusinessAccess(actualBusinessId, req.user, userRole);
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized to modify this role' });
    }
  }
  
  try {
    const override = await roleService.addPermissionOverride({
      roleId,
      permissionId,
      isGranted,
      createdBy: userId
    });
    
    return res.status(201).json(override);
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * DELETE /api/roles/:id/overrides/:permissionId
 * Remove a permission override
 */
export async function removePermissionOverride(req, res) {
  const { id, permissionId } = req.params;
  
  const roleId = parseInt(id, 10);
  const permId = parseInt(permissionId, 10);
  
  // Get role and verify
  const existingRole = await roleService.getRoleById(roleId);
  
  if (!existingRole) {
    return res.status(404).json({ message: 'Role not found' });
  }
  
  // Authorization
  const userId = req.user?.id;
  const userRole = req.user?.role;
  
  if (!['Admin'].includes(userRole)) {
    const hasAccess = await hasBusinessAccess(existingRole.role_for, req.user, userRole);
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized to modify this role' });
    }
  }
  
  try {
    const deleted = await roleService.removePermissionOverride(roleId, permId);
    
    if (deleted) {
      return res.json({ message: 'Override removed successfully' });
    } else {
      return res.status(404).json({ message: 'Override not found' });
    }
  } catch (error) {
    return handleDbError(error, res);
  }
}

// ============================================================
// EFFECTIVE PERMISSIONS
// ============================================================

/**
 * GET /api/roles/:id/permissions/effective
 * Get effective permissions for a role (including inheritance)
 */
export async function getEffectivePermissions(req, res) {
  const { id } = req.params;
  
  try {
    const permissions = await roleService.getEffectivePermissions(parseInt(id, 10));
    return res.json(permissions);
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * GET /api/roles/user/:userId/permissions
 * Get effective permissions for a user
 */
export async function getUserEffectivePermissions(req, res) {
  const { userId } = req.params;
  
  // Authorization: can only view own permissions unless admin
  const currentUserId = req.user?.id;
  const userRole = req.user?.role;
  
  if (userId !== currentUserId && !['Admin', 'Tourism Officer'].includes(userRole)) {
    return res.status(403).json({ message: 'Not authorized to view this user\'s permissions' });
  }
  
  try {
    const permissions = await roleService.getUserEffectivePermissions(userId);
    return res.json(Array.from(permissions));
  } catch (error) {
    return handleDbError(error, res);
  }
}

// ============================================================
// PERMISSION CATEGORIES
// ============================================================

/**
 * GET /api/roles/permission-categories
 * Get all permission categories
 */
export async function getPermissionCategories(req, res) {
  try {
    const categories = await roleService.getPermissionCategories();
    return res.json(categories);
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * GET /api/roles/permissions/grouped
 * Get permissions grouped by category
 */
export async function getPermissionsGrouped(req, res) {
  const { scope } = req.query;
  
  try {
    const permissions = await roleService.getPermissionsGroupedByCategory(scope || null);
    
    // Group into categories for easier frontend consumption
    const grouped = {};
    for (const perm of permissions) {
      const category = perm.category_name || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = {
          name: category,
          sort_order: perm.category_sort || 999,
          permissions: []
        };
      }
      grouped[category].permissions.push({
        id: perm.id,
        name: perm.name,
        description: perm.description,
        scope: perm.scope
      });
    }
    
    // Convert to sorted array
    const result = Object.values(grouped).sort((a, b) => a.sort_order - b.sort_order);
    
    return res.json(result);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// ============================================================
// AUDIT LOG
// ============================================================

/**
 * GET /api/roles/:id/audit
 * Get audit log for a role
 */
export async function getRoleAuditLog(req, res) {
  const { id } = req.params;
  const { limit } = req.query;
  
  const roleId = parseInt(id, 10);
  
  // Get role to verify access
  const existingRole = await roleService.getRoleById(roleId);
  
  if (!existingRole) {
    return res.status(404).json({ message: 'Role not found' });
  }
  
  // Authorization for business roles
  if (existingRole.role_type === roleService.ROLE_TYPES.BUSINESS) {
    const userRole = req.user?.role;
    
    if (!['Admin', 'Tourism Officer'].includes(userRole)) {
      const hasAccess = await hasBusinessAccess(existingRole.role_for, req.user, userRole);
      
      if (!hasAccess) {
        return res.status(403).json({ message: 'Not authorized to view this role\'s audit log' });
      }
    }
  }
  
  try {
    const auditLog = await roleService.getRoleAuditLog(
      roleId,
      limit ? parseInt(limit, 10) : 50
    );
    return res.json(auditLog);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// ============================================================
// ADMIN-ONLY ENDPOINTS
// ============================================================

/**
 * POST /api/roles/system
 * Create a new system role (admin only)
 */
export async function createSystemRole(req, res) {
  const { roleName, roleDescription, isImmutable } = req.body;
  
  const nameError = validateRoleName(roleName);
  if (nameError) {
    return res.status(400).json({ message: nameError });
  }
  
  const userId = req.user?.id;
  
  try {
    const role = await roleService.createSystemRole({
      roleName: sanitizeString(roleName),
      roleDescription: roleDescription ? sanitizeString(roleDescription) : null,
      isImmutable: isImmutable !== false, // Default to true
      createdBy: userId
    });
    
    return res.status(201).json(role);
  } catch (error) {
    return handleDbError(error, res);
  }
}

export default {
  getRolesByType,
  getSystemRoles,
  getBusinessRoles,
  getRoleById,
  createCustomBusinessRole,
  updateBusinessRole,
  deleteBusinessRole,
  addRolePermissions,
  removeRolePermissions,
  addPermissionOverride,
  removePermissionOverride,
  getEffectivePermissions,
  getUserEffectivePermissions,
  getPermissionCategories,
  getPermissionsGrouped,
  getRoleAuditLog,
  createSystemRole
};
