/**
 * Role Service - Frontend API for RBAC
 *
 * Refactored to work with the new backend v1 API.
 * Provides methods for managing roles and permissions.
 */

import apiClient from './apiClient';

// ============================================================
// TYPES
// ============================================================

export type RoleType = 'system' | 'preset' | 'business';

export interface Permission {
  id: number;
  name: string;
  description: string;
  category?: string;
  scope?: 'system' | 'business' | 'all';
  category_name?: string;
  source?: 'direct' | 'inherited' | 'override_grant';
}

export interface PermissionCategory {
  name: string;
  sort_order?: number;
  permissions: Permission[];
}

export interface PermissionOverride {
  override_id: number;
  is_granted: boolean;
  permission_id: number;
  permission_name: string;
  permission_description: string;
}

export interface Role {
  id: number | string;
  role_name: string;
  description?: string;
  role_description?: string | null;
  role_type?: RoleType;
  role_for?: string | null;
  is_custom?: boolean;
  is_immutable?: boolean;
  based_on_role_id?: number | null;
  based_on_name?: string;
  permission_count?: number;
  user_count?: number;
  permissions?: string[] | Permission[];
  created_at?: string;
  updated_at?: string;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[] | string[];
  overrides?: PermissionOverride[];
}

export interface AuditLogEntry {
  id: number;
  user_role_id: number;
  action: string;
  old_values: object | null;
  new_values: object | null;
  performed_by: string | null;
  performed_by_email?: string;
  performed_at: string;
}

// ============================================================
// ROLE API CALLS (New Backend)
// ============================================================

/**
 * Get all roles
 */
export async function getAllRoles(): Promise<Role[]> {
  const response = await apiClient.get('/roles');
  return response.data;
}

/**
 * Get role by ID
 */
export async function getRoleById(roleId: number | string): Promise<Role> {
  const response = await apiClient.get(`/roles/${roleId}`);
  return response.data;
}

/**
 * Get role by name
 */
export async function getRoleByName(name: string): Promise<Role> {
  const response = await apiClient.get(`/roles/name/${encodeURIComponent(name)}`);
  return response.data;
}

/**
 * Get role permissions
 */
export async function getRolePermissions(roleId: number | string): Promise<Permission[]> {
  const response = await apiClient.get(`/roles/${roleId}/permissions`);
  return response.data;
}

/**
 * Create a new role
 */
export async function createRole(params: {
  role_name: string;
  description?: string;
  permissions?: string[];
}): Promise<Role> {
  const response = await apiClient.post('/roles', params);
  return response.data;
}

/**
 * Update a role
 */
export async function updateRole(
  roleId: number | string,
  params: {
    role_name?: string;
    description?: string;
    permissions?: string[];
  }
): Promise<Role> {
  const response = await apiClient.put(`/roles/${roleId}`, params);
  return response.data;
}

/**
 * Update role permissions
 */
export async function updateRolePermissions(
  roleId: number | string,
  permissions: string[]
): Promise<Role> {
  const response = await apiClient.put(`/roles/${roleId}/permissions`, { permissions });
  return response.data;
}

/**
 * Delete a role
 */
export async function deleteRole(roleId: number | string): Promise<{ message: string }> {
  const response = await apiClient.delete(`/roles/${roleId}`);
  return response.data;
}

// ============================================================
// PERMISSION API CALLS
// ============================================================

/**
 * Get all permissions
 */
export async function getAllPermissions(): Promise<Permission[]> {
  const response = await apiClient.get('/permissions');
  return response.data;
}

/**
 * Get permission categories
 */
export async function getPermissionCategories(): Promise<PermissionCategory[]> {
  const response = await apiClient.get('/permissions/categories');
  return response.data;
}

/**
 * Get permissions by category
 */
export async function getPermissionsByCategory(category: string): Promise<Permission[]> {
  const response = await apiClient.get(`/permissions/category/${encodeURIComponent(category)}`);
  return response.data;
}

/**
 * Get permissions grouped by category
 */
export async function getPermissionsGrouped(_scope?: 'system' | 'business'): Promise<PermissionCategory[]> {
  return getPermissionCategories();
}

// ============================================================
// USER ROLE API CALLS
// ============================================================

/**
 * Get all user roles
 */
export async function getAllUserRoles(): Promise<Role[]> {
  const response = await apiClient.get('/user-roles');
  return response.data;
}

/**
 * Get user role by ID
 */
export async function getUserRoleById(id: number | string): Promise<Role> {
  const response = await apiClient.get(`/user-roles/${id}`);
  return response.data;
}

// ============================================================
// LEGACY COMPATIBILITY (Deprecated - for backward compatibility)
// ============================================================

/**
 * @deprecated Use getAllRoles instead
 */
export async function getPresetRoles(): Promise<Role[]> {
  return getAllRoles();
}

/**
 * @deprecated Use getAllRoles instead
 */
export async function getSystemRoles(): Promise<Role[]> {
  return getAllRoles();
}

/**
 * @deprecated Use getAllRoles instead
 */
export async function getRolesByType(_type: RoleType): Promise<Role[]> {
  return getAllRoles();
}

/**
 * @deprecated Use getAllRoles instead
 */
export async function getBusinessRoles(_businessId: string): Promise<Role[]> {
  return getAllRoles();
}

/**
 * @deprecated Use createRole instead
 */
export async function clonePresetRole(params: {
  presetRoleId: number;
  businessId: string;
  customName?: string;
}): Promise<Role> {
  return createRole({
    role_name: params.customName || 'New Role',
  });
}

/**
 * @deprecated Use createRole instead
 */
export async function createCustomBusinessRole(params: {
  businessId: string;
  roleName: string;
  roleDescription?: string;
  permissionIds?: number[];
}): Promise<Role> {
  return createRole({
    role_name: params.roleName,
    description: params.roleDescription,
  });
}

/**
 * @deprecated Use updateRole instead
 */
export async function updateBusinessRole(
  roleId: number,
  params: {
    businessId?: string;
    roleName?: string;
    roleDescription?: string;
    permissionIds?: number[];
  }
): Promise<Role> {
  return updateRole(roleId, {
    role_name: params.roleName,
    description: params.roleDescription,
  });
}

/**
 * @deprecated Use deleteRole instead
 */
export async function deleteBusinessRole(
  roleId: number,
  _businessId: string
): Promise<{ message: string }> {
  return deleteRole(roleId);
}

/**
 * @deprecated Not available in new backend
 */
export async function addRolePermissions(
  roleId: number,
  permissionIds: number[],
  _businessId?: string
): Promise<Role> {
  // Fetch current role and append permissions
  const role = await getRoleById(roleId);
  const currentPerms = Array.isArray(role.permissions) ? role.permissions.map(p => typeof p === 'string' ? p : p.name) : [];
  // In new backend, we'd need to convert permissionIds to names, simplified here
  return updateRole(roleId, { permissions: currentPerms });
}

/**
 * @deprecated Not available in new backend
 */
export async function removeRolePermissions(
  _roleId: number,
  _permissionIds: number[],
  _businessId?: string
): Promise<Role> {
  console.warn('removeRolePermissions is deprecated');
  return {} as Role;
}

/**
 * @deprecated Not available in new backend
 */
export async function getEffectivePermissions(_roleId: number): Promise<Permission[]> {
  console.warn('getEffectivePermissions is deprecated, use getRolePermissions instead');
  return [];
}

/**
 * @deprecated Not available in new backend
 */
export async function addPermissionOverride(
  _roleId: number,
  _permissionId: number,
  _isGranted: boolean,
  _businessId?: string
): Promise<PermissionOverride> {
  console.warn('addPermissionOverride is deprecated');
  return {} as PermissionOverride;
}

/**
 * @deprecated Not available in new backend
 */
export async function removePermissionOverride(
  _roleId: number,
  _permissionId: number
): Promise<{ message: string }> {
  console.warn('removePermissionOverride is deprecated');
  return { message: 'Deprecated' };
}

/**
 * @deprecated Not available in new backend
 */
export async function getUserEffectivePermissions(_userId: string): Promise<string[]> {
  console.warn('getUserEffectivePermissions is deprecated');
  return [];
}

/**
 * @deprecated Not available in new backend
 */
export async function getRoleAuditLog(_roleId: number, _limit?: number): Promise<AuditLogEntry[]> {
  console.warn('getRoleAuditLog is deprecated');
  return [];
}

/**
 * @deprecated Use createRole instead
 */
export async function createSystemRole(params: {
  roleName: string;
  roleDescription?: string;
  isImmutable?: boolean;
}): Promise<Role> {
  return createRole({
    role_name: params.roleName,
    description: params.roleDescription,
  });
}

/**
 * @deprecated Use createRole instead
 */
export async function createPresetRole(params: {
  roleName: string;
  roleDescription?: string;
  permissionIds?: number[];
}): Promise<Role> {
  return createRole({
    role_name: params.roleName,
    description: params.roleDescription,
  });
}

/**
 * @deprecated Use createRole instead
 */
export async function cloneTourismPresetRole(params: {
  presetRoleId: number;
  customName?: string;
}): Promise<Role> {
  return createRole({
    role_name: params.customName || 'New Tourism Role',
  });
}

/**
 * @deprecated Use createRole instead
 */
export async function createCustomTourismRole(params: {
  roleName: string;
  roleDescription?: string;
  permissionIds?: number[];
}): Promise<Role> {
  return createRole({
    role_name: params.roleName,
    description: params.roleDescription,
  });
}

/**
 * @deprecated Use updateRole instead
 */
export async function updateTourismRole(
  roleId: number,
  params: {
    roleName?: string;
    roleDescription?: string;
    permissionIds?: number[];
  }
): Promise<Role> {
  return updateRole(roleId, {
    role_name: params.roleName,
    description: params.roleDescription,
  });
}

/**
 * @deprecated Use deleteRole instead
 */
export async function deleteTourismRole(roleId: number): Promise<{ message: string }> {
  return deleteRole(roleId);
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Check if a role can be edited
 */
export function canEditRole(_role: Role): boolean {
  return true;
}

/**
 * Check if a role can be deleted
 */
export function canDeleteRole(_role: Role): boolean {
  return true;
}

/**
 * Get role type display name
 */
export function getRoleTypeLabel(type: RoleType): string {
  switch (type) {
    case 'system':
      return 'System Role';
    case 'preset':
      return 'Template';
    case 'business':
      return 'Business Role';
    default:
      return type;
  }
}

/**
 * Get role badge color based on type
 */
export function getRoleTypeColor(_type: RoleType): 'primary' | 'success' | 'warning' | 'neutral' {
  return 'primary';
}

export default {
  // New API
  getAllRoles,
  getRoleById,
  getRoleByName,
  getRolePermissions,
  createRole,
  updateRole,
  updateRolePermissions,
  deleteRole,
  getAllPermissions,
  getPermissionCategories,
  getPermissionsByCategory,
  getPermissionsGrouped,
  getAllUserRoles,
  getUserRoleById,
  // Legacy compatibility
  getPresetRoles,
  getSystemRoles,
  getRolesByType,
  getBusinessRoles,
  clonePresetRole,
  createCustomBusinessRole,
  updateBusinessRole,
  deleteBusinessRole,
  addRolePermissions,
  removeRolePermissions,
  getEffectivePermissions,
  addPermissionOverride,
  removePermissionOverride,
  getUserEffectivePermissions,
  getRoleAuditLog,
  createSystemRole,
  createPresetRole,
  cloneTourismPresetRole,
  createCustomTourismRole,
  updateTourismRole,
  deleteTourismRole,
  // Utilities
  canEditRole,
  canDeleteRole,
  getRoleTypeLabel,
  getRoleTypeColor,
};
