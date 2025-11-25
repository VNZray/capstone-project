import { useMemo } from 'react';
import { useAuth } from '@/src/context/AuthContext';

/**
 * Hook to check if user has specific permission(s)
 * @param permission - Single permission or array of permissions
 * @param requireAll - If true, requires ALL permissions (AND logic). If false, requires ANY (OR logic)
 * @returns boolean indicating if user has required permission(s)
 */
export function usePermission(
  permission: string | string[],
  requireAll: boolean = false
): boolean {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user || !user.permissions) return false;

    const userPermissions = new Set(user.permissions);
    const permissionsToCheck = Array.isArray(permission) ? permission : [permission];

    if (requireAll) {
      // AND logic: must have ALL permissions
      return permissionsToCheck.every((p) => userPermissions.has(p));
    } else {
      // OR logic: must have AT LEAST ONE permission
      return permissionsToCheck.some((p) => userPermissions.has(p));
    }
  }, [user, permission, requireAll]);
}

/**
 * Hook to check if user has specific role(s)
 * @param role - Single role or array of roles
 * @returns boolean indicating if user has one of the required roles
 */
export function useRole(role: string | string[]): boolean {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user || !user.role_name) return false;

    const rolesToCheck = Array.isArray(role) ? role : [role];
    return rolesToCheck.includes(user.role_name);
  }, [user, role]);
}

/**
 * Hook to get all user permissions
 * @returns Array of permission names
 */
export function usePermissions(): string[] {
  const { user } = useAuth();
  return user?.permissions || [];
}

/**
 * Hook to check if user has ANY of the specified roles OR permissions
 * Useful for flexible RBAC with fallback
 * @param roles - Array of allowed role names
 * @param permissions - Array of allowed permission names
 * @returns boolean indicating if user has required role or permission
 */
export function useRoleOrPermission(
  roles: string[] = [],
  permissions: string[] = []
): boolean {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) return false;

    // Check role first
    if (roles.length > 0 && roles.includes(user.role_name || '')) {
      return true;
    }

    // Check permissions
    if (permissions.length > 0 && user.permissions) {
      const userPermissions = new Set(user.permissions);
      return permissions.some((p) => userPermissions.has(p));
    }

    return false;
  }, [user, roles, permissions]);
}

/**
 * Hook for permission-based UI rendering
 * Returns object with permission check utilities
 */
export function usePermissionGuard() {
  const { user } = useAuth();

  return useMemo(() => {
    const userPermissions = new Set(user?.permissions || []);

    return {
      /**
       * Check if user has permission
       */
      can: (permission: string) => userPermissions.has(permission),

      /**
       * Check if user has ALL permissions
       */
      canAll: (...permissions: string[]) =>
        permissions.every((p) => userPermissions.has(p)),

      /**
       * Check if user has ANY permission
       */
      canAny: (...permissions: string[]) =>
        permissions.some((p) => userPermissions.has(p)),

      /**
       * Check if user has role
       */
      hasRole: (role: string) => user?.role_name === role,

      /**
       * Check if user has ANY of the roles
       */
      hasAnyRole: (...roles: string[]) => roles.includes(user?.role_name || ''),

      /**
       * Get all user permissions
       */
      permissions: Array.from(userPermissions),

      /**
       * Get user role
       */
      role: user?.role_name || null,
    };
  }, [user]);
}
