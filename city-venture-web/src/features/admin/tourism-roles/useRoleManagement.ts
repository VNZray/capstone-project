/**
 * useTourismRoleManagement Hook
 *
 * Custom hook for managing tourism staff roles.
 * Provides data fetching, mutations, and state management for RBAC.
 *
 * This is adapted from the business role management to work with tourism system roles.
 */

import { useState, useEffect, useCallback } from 'react';
import * as roleService from '@/src/services/RoleService';
import type { Role, RoleWithPermissions, PermissionCategory } from './types';

interface UseRoleManagementOptions {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

interface UseAsyncState<T> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
}

/**
 * Hook for fetching tourism roles (system roles)
 */
export function useTourismRoles() {
    const [state, setState] = useState<UseAsyncState<Role[]>>({
        data: null,
        isLoading: false,
        error: null,
    });

    const fetchRoles = useCallback(async () => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            // Fetch system roles for tourism
            const roles = await roleService.getSystemRoles();
            setState({ data: roles, isLoading: false, error: null });
        } catch (err) {
            setState({ data: null, isLoading: false, error: err as Error });
        }
    }, []);

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
 * Main hook for tourism role management operations
 */
export function useRoleManagement(options: UseRoleManagementOptions = {}) {
    const { onSuccess, onError } = options;

    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Create custom tourism role
    const createCustomAsync = useCallback(async (params: {
        roleName: string;
        roleDescription?: string;
        permissionIds?: number[]
    }) => {
        setIsCreating(true);
        try {
            const result = await roleService.createCustomTourismRole(params);
            onSuccess?.();
            return result;
        } catch (err) {
            onError?.(err as Error);
            throw err;
        } finally {
            setIsCreating(false);
        }
    }, [onSuccess, onError]);

    // Update tourism role
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
            const result = await roleService.updateTourismRole(params.roleId, params.data);
            onSuccess?.();
            return result;
        } catch (err) {
            onError?.(err as Error);
            throw err;
        } finally {
            setIsUpdating(false);
        }
    }, [onSuccess, onError]);

    // Delete tourism role
    const deleteRoleAsync = useCallback(async (roleId: number) => {
        setIsDeleting(true);
        try {
            const result = await roleService.deleteTourismRole(roleId);
            onSuccess?.();
            return result;
        } catch (err) {
            onError?.(err as Error);
            throw err;
        } finally {
            setIsDeleting(false);
        }
    }, [onSuccess, onError]);

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
    useTourismRoles,
    useRole,
    usePermissionsGrouped,
    useEffectivePermissions,
    useRoleManagement,
};
