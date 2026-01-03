/**
 * useRoleManagement Hook
 * 
 * Custom hook for managing business roles.
 * Provides data fetching, mutations, and state management for RBAC.
 */

import { useState, useEffect, useCallback } from 'react';
import * as roleService from '@/src/services/RoleService';
import type { Role, RoleWithPermissions, PermissionCategory } from './types';

interface UseRoleManagementOptions {
  businessId?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseAsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for fetching and managing business roles
 */
export function useBusinessRoles(businessId: string | undefined) {
  const [state, setState] = useState<UseAsyncState<Role[]>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchRoles = useCallback(async () => {
    if (!businessId) return;
    
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const roles = await roleService.getBusinessRoles(businessId);
      setState({ data: roles, isLoading: false, error: null });
    } catch (err) {
      setState({ data: null, isLoading: false, error: err as Error });
    }
  }, [businessId]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return { ...state, refetch: fetchRoles };
}

/**
 * Hook for fetching a single role with permissions
 */
export function useRole(roleId: number | undefined) {
  const [state, setState] = useState<UseAsyncState<RoleWithPermissions>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchRole = useCallback(async () => {
    if (!roleId) return;
    
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const role = await roleService.getRoleById(roleId);
      setState({ data: role, isLoading: false, error: null });
    } catch (err) {
      setState({ data: null, isLoading: false, error: err as Error });
    }
  }, [roleId]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  return { ...state, refetch: fetchRole };
}

/**
 * Hook for fetching permissions grouped by category
 */
export function usePermissionsGrouped(scope?: 'system' | 'business') {
  const [state, setState] = useState<UseAsyncState<PermissionCategory[]>>({
    data: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    const fetchPermissions = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const permissions = await roleService.getPermissionsGrouped(scope);
        setState({ data: permissions, isLoading: false, error: null });
      } catch (err) {
        setState({ data: null, isLoading: false, error: err as Error });
      }
    };

    fetchPermissions();
  }, [scope]);

  return state;
}

/**
 * Hook for fetching effective permissions of a role
 */
export function useEffectivePermissions(roleId: number | undefined) {
  const [state, setState] = useState<UseAsyncState<roleService.Permission[]>>({
    data: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!roleId) return;

    const fetchPermissions = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const permissions = await roleService.getEffectivePermissions(roleId);
        setState({ data: permissions, isLoading: false, error: null });
      } catch (err) {
        setState({ data: null, isLoading: false, error: err as Error });
      }
    };

    fetchPermissions();
  }, [roleId]);

  return state;
}

/**
 * Main hook for role management operations
 */
export function useRoleManagement(options: UseRoleManagementOptions = {}) {
  const { businessId, onSuccess, onError } = options;
  
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create custom role
  const createCustomAsync = useCallback(async (params: { 
    roleName: string; 
    roleDescription?: string; 
    permissionIds?: number[] 
  }) => {
    if (!businessId) throw new Error('Business ID is required');
    
    setIsCreating(true);
    try {
      const result = await roleService.createCustomBusinessRole({
        ...params,
        businessId,
      });
      onSuccess?.();
      return result;
    } catch (err) {
      onError?.(err as Error);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [businessId, onSuccess, onError]);

  // Update role
  const updateRoleAsync = useCallback(async (params: { 
    roleId: number; 
    data: { 
      roleName?: string; 
      roleDescription?: string; 
      permissionIds?: number[] 
    } 
  }) => {
    setIsUpdating(true);
    try {
      const result = await roleService.updateBusinessRole(params.roleId, {
        ...params.data,
        businessId,
      });
      onSuccess?.();
      return result;
    } catch (err) {
      onError?.(err as Error);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [businessId, onSuccess, onError]);

  // Delete role
  const deleteRoleAsync = useCallback(async (roleId: number) => {
    if (!businessId) throw new Error('Business ID is required');
    
    setIsDeleting(true);
    try {
      const result = await roleService.deleteBusinessRole(roleId, businessId);
      onSuccess?.();
      return result;
    } catch (err) {
      onError?.(err as Error);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [businessId, onSuccess, onError]);

  return {
    // Mutations
    createCustomAsync,
    updateRoleAsync,
    deleteRole: deleteRoleAsync,
    
    // Loading states
    isCreating,
    isUpdating,
    isDeleting,
    isLoading: isCreating || isUpdating || isDeleting,
  };
}

export default {
  useBusinessRoles,
  useRole,
  usePermissionsGrouped,
  useEffectivePermissions,
  useRoleManagement,
};
