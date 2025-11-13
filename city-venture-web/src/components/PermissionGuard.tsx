import type { ReactNode } from 'react';
import { usePermission, useRole, useRoleOrPermission } from '@/src/hooks/usePermissions';

interface PermissionGuardProps {
  children: ReactNode;
  /** Required permission(s) - can be single or array */
  permission?: string | string[];
  /** If true, requires ALL permissions (AND logic). Default false (OR logic) */
  requireAll?: boolean;
  /** Fallback content to render if permission check fails */
  fallback?: ReactNode;
}

/**
 * Component to conditionally render content based on user permissions
 * 
 * @example
 * <PermissionGuard permission="view_dashboard">
 *   <DashboardWidget />
 * </PermissionGuard>
 * 
 * @example
 * <PermissionGuard permission={["edit_room", "delete_room"]} requireAll>
 *   <AdminButton />
 * </PermissionGuard>
 */
export function PermissionGuard({ 
  children, 
  permission, 
  requireAll = false, 
  fallback = null 
}: PermissionGuardProps) {
  const hasPermission = usePermission(permission || '', requireAll);

  if (!permission) {
    console.warn('[PermissionGuard] No permission specified, rendering children by default');
    return <>{children}</>;
  }

  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

interface RoleGuardProps {
  children: ReactNode;
  /** Required role(s) - can be single or array */
  role: string | string[];
  /** Fallback content to render if role check fails */
  fallback?: ReactNode;
}

/**
 * Component to conditionally render content based on user role
 * 
 * @example
 * <RoleGuard role="Business Owner">
 *   <OwnerDashboard />
 * </RoleGuard>
 * 
 * @example
 * <RoleGuard role={["Admin", "Tourism Officer"]}>
 *   <AdminPanel />
 * </RoleGuard>
 */
export function RoleGuard({ children, role, fallback = null }: RoleGuardProps) {
  const hasRole = useRole(role);

  return hasRole ? <>{children}</> : <>{fallback}</>;
}

interface RoleOrPermissionGuardProps {
  children: ReactNode;
  /** Allowed roles */
  roles?: string[];
  /** Allowed permissions (OR logic) */
  permissions?: string[];
  /** Fallback content to render if check fails */
  fallback?: ReactNode;
}

/**
 * Component to conditionally render content based on role OR permission
 * Useful for flexible RBAC with fallback to permission-based access
 * 
 * @example
 * <RoleOrPermissionGuard 
 *   roles={["Business Owner", "Manager"]} 
 *   permissions={["view_bookings"]}
 * >
 *   <BookingsTable />
 * </RoleOrPermissionGuard>
 */
export function RoleOrPermissionGuard({ 
  children, 
  roles = [], 
  permissions = [], 
  fallback = null 
}: RoleOrPermissionGuardProps) {
  const hasAccess = useRoleOrPermission(roles, permissions);

  if (roles.length === 0 && permissions.length === 0) {
    console.warn('[RoleOrPermissionGuard] No roles or permissions specified, rendering children by default');
    return <>{children}</>;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
