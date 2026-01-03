/**
 * Role Management Types
 * Shared types for the role management feature
 */

export type RoleType = 'system' | 'business';

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

export interface PermissionOverride {
  override_id: number;
  is_granted: boolean;
  permission_id: number;
  permission_name: string;
  permission_description: string;
}

export interface CreateCustomRoleParams {
  roleName: string;
  roleDescription?: string;
  permissionIds: number[];
}

export interface UpdateRoleParams {
  roleName?: string;
  roleDescription?: string;
  permissionIds?: number[];
}
