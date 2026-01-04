/**
 * Role Service - Frontend API for Simplified RBAC
 *
 * Simple role system with 5 fixed roles:
 * - Admin, Tourism Officer, Business Owner, Tourist, Staff
 * 
 * Staff permissions are managed per-user via permissionService.
 */

import apiClient from './apiClient';

// ============================================================
// TYPES
// ============================================================

export interface Permission {
  id: number;
  name: string;
  description: string;
  scope: 'system' | 'business' | 'all';
  category_name?: string;
}

export interface PermissionCategory {
  name: string;
  sort_order: number;
  permissions: Permission[];
}

export interface Role {
  id: number;
  role_name: string;
  role_description: string | null;
  is_immutable: boolean;
  permission_count?: number;
  user_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

// ============================================================
// API CALLS
// ============================================================

/**
 * Get all system roles
 */
export async function getSystemRoles(): Promise<Role[]> {
  const response = await apiClient.get('/roles/system');
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
 * Get effective permissions for a user (includes role + user-level permissions)
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

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Get role badge color based on role name
 */
export function getRoleBadgeColor(roleName: string): 'primary' | 'success' | 'warning' | 'neutral' {
  switch (roleName) {
    case 'Admin':
      return 'primary';
    case 'Tourism Officer':
      return 'success';
    case 'Business Owner':
    case 'Staff':
      return 'warning';
    case 'Tourist':
      return 'neutral';
    default:
      return 'neutral';
  }
}

/**
 * Check if a role name represents a staff member
 */
export function isStaffRole(roleName: string): boolean {
  return roleName === 'Staff';
}

export default {
  getSystemRoles,
  getRoleById,
  getUserEffectivePermissions,
  getPermissionCategories,
  getPermissionsGrouped,
  getRoleBadgeColor,
  isStaffRole,
};
