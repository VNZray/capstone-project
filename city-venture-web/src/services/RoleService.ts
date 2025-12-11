/**
 * Role Service - Frontend API for Enhanced RBAC
 * 
 * Provides methods for managing roles in the three-tier RBAC system:
 * - System roles (view only for non-admins)
 * - Preset roles (templates for cloning)
 * - Business roles (business-specific instances)
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
  scope: 'system' | 'business' | 'all';
  category_name?: string;
  source?: 'direct' | 'inherited' | 'override_grant';
}

export interface PermissionCategory {
  name: string;
  sort_order: number;
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
  id: number;
  role_name: string;
  role_description: string | null;
  role_type: RoleType;
  role_for: string | null;
  is_custom: boolean;
  is_immutable: boolean;
  based_on_role_id: number | null;
  based_on_name?: string;
  permission_count?: number;
  user_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
  overrides: PermissionOverride[];
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
// API CALLS
// ============================================================

/**
 * Get all preset roles (templates)
 */
export async function getPresetRoles(): Promise<Role[]> {
  const response = await apiClient.get('/roles/presets');
  return response.data;
}

/**
 * Get all system roles
 */
export async function getSystemRoles(): Promise<Role[]> {
  const response = await apiClient.get('/roles/system');
  return response.data;
}

/**
 * Get roles by type
 */
export async function getRolesByType(type: RoleType): Promise<Role[]> {
  const response = await apiClient.get(`/roles/types/${type}`);
  return response.data;
}

/**
 * Get all roles for a specific business
 */
export async function getBusinessRoles(businessId: string): Promise<Role[]> {
  const response = await apiClient.get(`/roles/business/${businessId}`);
  return response.data;
}

/**
 * Get a single role with full permission details
 */
export async function getRoleById(roleId: number): Promise<RoleWithPermissions> {
  const response = await apiClient.get(`/roles/${roleId}`);
  return response.data;
}

/**
 * Clone a preset role for a business
 */
export async function clonePresetRole(params: {
  presetRoleId: number;
  businessId: string;
  customName?: string;
}): Promise<Role> {
  const response = await apiClient.post('/roles/business/clone', params);
  return response.data;
}

/**
 * Create a fully custom business role
 */
export async function createCustomBusinessRole(params: {
  businessId: string;
  roleName: string;
  roleDescription?: string;
  permissionIds?: number[];
}): Promise<Role> {
  const response = await apiClient.post('/roles/business/custom', params);
  return response.data;
}

/**
 * Update a business role
 */
export async function updateBusinessRole(
  roleId: number,
  params: {
    businessId?: string;
    roleName?: string;
    roleDescription?: string;
    permissionIds?: number[];
  }
): Promise<RoleWithPermissions> {
  const response = await apiClient.put(`/roles/business/${roleId}`, params);
  return response.data;
}

/**
 * Delete a business role
 */
export async function deleteBusinessRole(
  roleId: number,
  businessId: string
): Promise<{ message: string }> {
  const response = await apiClient.delete(`/roles/business/${roleId}`, {
    data: { businessId }
  });
  return response.data;
}

/**
 * Add permissions to a role
 */
export async function addRolePermissions(
  roleId: number,
  permissionIds: number[],
  businessId?: string
): Promise<RoleWithPermissions> {
  const response = await apiClient.post(`/roles/${roleId}/permissions`, {
    permissionIds,
    businessId
  });
  return response.data;
}

/**
 * Remove permissions from a role
 */
export async function removeRolePermissions(
  roleId: number,
  permissionIds: number[],
  businessId?: string
): Promise<RoleWithPermissions> {
  const response = await apiClient.delete(`/roles/${roleId}/permissions`, {
    data: { permissionIds, businessId }
  });
  return response.data;
}

/**
 * Get effective permissions for a role (includes inheritance)
 */
export async function getEffectivePermissions(roleId: number): Promise<Permission[]> {
  const response = await apiClient.get(`/roles/${roleId}/permissions/effective`);
  return response.data;
}

/**
 * Add a permission override to a preset-based role
 */
export async function addPermissionOverride(
  roleId: number,
  permissionId: number,
  isGranted: boolean,
  businessId?: string
): Promise<PermissionOverride> {
  const response = await apiClient.post(`/roles/${roleId}/overrides`, {
    permissionId,
    isGranted,
    businessId
  });
  return response.data;
}

/**
 * Remove a permission override
 */
export async function removePermissionOverride(
  roleId: number,
  permissionId: number
): Promise<{ message: string }> {
  const response = await apiClient.delete(`/roles/${roleId}/overrides/${permissionId}`);
  return response.data;
}

/**
 * Get effective permissions for a user
 */
export async function getUserEffectivePermissions(userId: string): Promise<string[]> {
  const response = await apiClient.get(`/roles/user/${userId}/permissions`);
  return response.data;
}

/**
 * Get all permission categories
 */
export async function getPermissionCategories(): Promise<PermissionCategory[]> {
  const response = await apiClient.get('/roles/permission-categories');
  return response.data;
}

/**
 * Get permissions grouped by category
 */
export async function getPermissionsGrouped(scope?: 'system' | 'business'): Promise<PermissionCategory[]> {
  const params = scope ? { scope } : {};
  const response = await apiClient.get('/roles/permissions/grouped', { params });
  return response.data;
}

/**
 * Get audit log for a role
 */
export async function getRoleAuditLog(roleId: number, limit?: number): Promise<AuditLogEntry[]> {
  const params = limit ? { limit } : {};
  const response = await apiClient.get(`/roles/${roleId}/audit`, { params });
  return response.data;
}

// ============================================================
// ADMIN-ONLY API CALLS
// ============================================================

/**
 * Create a new system role (admin only)
 */
export async function createSystemRole(params: {
  roleName: string;
  roleDescription?: string;
  isImmutable?: boolean;
}): Promise<Role> {
  const response = await apiClient.post('/roles/system', params);
  return response.data;
}

/**
 * Create a new preset role template (admin only)
 */
export async function createPresetRole(params: {
  roleName: string;
  roleDescription?: string;
  permissionIds?: number[];
}): Promise<RoleWithPermissions> {
  const response = await apiClient.post('/roles/preset', params);
  return response.data;
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Check if a role can be edited
 */
export function canEditRole(role: Role): boolean {
  return role.role_type === 'business' && !role.is_immutable;
}

/**
 * Check if a role can be deleted
 */
export function canDeleteRole(role: Role): boolean {
  return role.role_type === 'business' && !role.is_immutable && (role.user_count ?? 0) === 0;
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
export function getRoleTypeColor(type: RoleType): 'primary' | 'success' | 'warning' | 'neutral' {
  switch (type) {
    case 'system':
      return 'primary';
    case 'preset':
      return 'success';
    case 'business':
      return 'warning';
    default:
      return 'neutral';
  }
}

export default {
  getPresetRoles,
  getSystemRoles,
  getRolesByType,
  getBusinessRoles,
  getRoleById,
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
  getPermissionCategories,
  getPermissionsGrouped,
  getRoleAuditLog,
  createSystemRole,
  createPresetRole,
  canEditRole,
  canDeleteRole,
  getRoleTypeLabel,
  getRoleTypeColor,
};
