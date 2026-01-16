/**
 * Tourism Staff Service - RBAC Management
 *
 * Handles permission management for tourism staff (Admin and Tourism Officer roles).
 * Similar to business staff management but for system-scoped permissions.
 */

import apiClient from "./apiClient";

export interface TourismPermission {
    id: number;
    name: string;
    description: string;
}

export interface Permission {
    id: number;
    name: string;
    description: string;
    scope?: string;
    category_name?: string;
}

export interface PermissionCategory {
    category_id: number;
    category_name: string;
    sort_order: number;
    permissions: Permission[];
}

/**
 * Get permissions for a specific tourism staff member
 */
export const fetchTourismStaffPermissions = async (
    userId: string
): Promise<TourismPermission[]> => {
    try {
        // Fetch permissions using user_id
        const { data } = await apiClient.get<TourismPermission[]>(
            `/tourism-staff/staff/${userId}/permissions`
        );
        return data || [];
    } catch (error) {
        console.error("Error fetching tourism staff permissions:", error);
        return [];
    }
};

/**
 * Update permissions for a tourism staff member
 * NOTE: Permissions are updated via the main update endpoint, not a separate endpoint
 * This function is kept for compatibility but delegates to the main update
 */
export const updateTourismStaffPermissions = async (
    tourismId: string,
    permissionIds: number[]
): Promise<void> => {
    // Permissions are updated as part of the main staff update
    // This is handled in the updateTourismStaff controller
    console.warn('updateTourismStaffPermissions should be called via the main update endpoint');
};

/**
 * Get available system-scope permissions for tourism staff assignment
 * Returns permissions grouped by category, filtered for system scope
 */
export const fetchAvailableTourismPermissions = async (): Promise<
    PermissionCategory[]
> => {
    try {
        const { data } = await apiClient.get<PermissionCategory[]>(
            `/tourism-staff/permissions/available`
        );
        return data || [];
    } catch (error) {
        console.error("Error fetching available tourism permissions:", error);
        // Fallback: fetch all system permissions and group them
        try {
            const { data: allPermissions } = await apiClient.get<Permission[]>(
                `/permissions?scope=system`
            );

            // Group by category
            const categoryMap = new Map<number, PermissionCategory>();

            allPermissions.forEach((perm) => {
                const categoryId = 10; // System Admin category
                const categoryName = perm.category_name || "System Administration";

                if (!categoryMap.has(categoryId)) {
                    categoryMap.set(categoryId, {
                        category_id: categoryId,
                        category_name: categoryName,
                        sort_order: categoryId,
                        permissions: [],
                    });
                }

                categoryMap.get(categoryId)!.permissions.push(perm);
            });

            return Array.from(categoryMap.values());
        } catch (fallbackError) {
            console.error("Error in fallback permission fetch:", fallbackError);
            return [];
        }
    }
};
