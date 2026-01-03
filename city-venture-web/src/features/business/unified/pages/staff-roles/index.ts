/**
 * Staff Roles Feature - Barrel Export
 * 
 * Re-exports all components, hooks, and types for the staff roles feature.
 */

// Components
export { RoleList } from './RoleList';
export { PermissionSelector } from './PermissionSelector';
export { CreateRoleModal } from './CreateRoleModal';
export { EditRoleModal } from './EditRoleModal';
export { StaffRolesPage } from './StaffRolesPage';

// Hooks
export {
  useBusinessRoles,
  useRole,
  usePermissionsGrouped,
  useEffectivePermissions,
  useRoleManagement,
} from './useRoleManagement';

// Types
export type {
  Role,
  RoleType,
  RoleWithPermissions,
  Permission,
  PermissionCategory,
  PermissionOverride,
  CreateCustomRoleParams,
  UpdateRoleParams,
} from './types';
