/**
 * Staff Service - Simplified RBAC
 * 
 * After RBAC simplification:
 * - All staff get the single "Staff" role automatically
 * - Permissions are assigned per-user via /staff/:id/permissions endpoints
 */

import apiClient from "../apiClient";

export interface StaffMember {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name?: string;
  user_id: string;
  business_id: string;
  email: string;
  phone_number?: string;
  password?: string;
  user_profile?: string;
  is_active: boolean;
  title?: string;  // Staff title/position (e.g., "Manager", "Receptionist")
  permissions?: StaffPermission[];
}

export interface StaffPermission {
  id: number;
  name: string;
  description?: string;
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
 * Fetch all staff members for a specific business
 */
export const fetchStaffByBusinessId = async (
  business_id: string
): Promise<StaffMember[]> => {
  if (!business_id) return [];

  try {
    const { data } = await apiClient.get<StaffMember[]>(
      `/staff/business/${business_id}`
    );
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching staff:", error);
    return [];
  }
};

/**
 * Fetch all staff members with their permissions
 */
export const fetchStaffWithPermissions = async (
  business_id: string
): Promise<StaffMember[]> => {
  if (!business_id) return [];

  try {
    const { data } = await apiClient.get<StaffMember[]>(
      `/staff/business/${business_id}/with-permissions`
    );
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching staff with permissions:", error);
    return [];
  }
};

/**
 * Add new staff member
 */
export const insertStaff = async (staffData: {
  first_name: string;
  middle_name?: string;
  last_name?: string;
  user_id: string;
  business_id: string;
}) => {
  const { data } = await apiClient.post(`/staff`, staffData);
  return data;
};

/**
 * Update staff member by ID
 */
export const updateStaffById = async (
  id: string,
  staffData: Partial<StaffMember>
) => {
  const { data } = await apiClient.put(`/staff/${id}`, staffData);
  return data;
};

/**
 * Update staff title
 */
export const updateStaffTitle = async (
  id: string,
  title: string
): Promise<void> => {
  await apiClient.put(`/staff/${id}/title`, { title });
};

/**
 * Delete staff member by ID
 */
export const deleteStaffById = async (id: string) => {
  const { data } = await apiClient.delete(`/staff/${id}`);
  return data;
};

/**
 * Toggle staff active status
 */
export const toggleStaffActive = async (
  user_id: string,
  is_active: boolean
): Promise<void> => {
  // Update the user table where is_active is stored
  await apiClient.put(`/users/${user_id}`, { is_active: !is_active });
};

// Staff role ID constant (matches backend/services/roleService.js)
const STAFF_ROLE_ID = 6;

/**
 * Onboard a new staff member
 * Creates user account + staff record in one transaction
 * Staff automatically gets the "Staff" role; permissions are assigned separately
 */
export const onboardStaff = async (staffData: {
  first_name: string;
  last_name?: string;
  email: string;
  phone_number?: string;
  password?: string;
  business_id: string;
  title?: string;
  permission_ids?: number[];
}): Promise<StaffMember & { temp_password: string; invitation_token: string }> => {
  // Always assign the Staff role (role_id: 6)
  const payload = {
    ...staffData,
    role_id: STAFF_ROLE_ID,
  };
  const { data } = await apiClient.post(`/staff/onboard`, payload);
  return data;
};

// ============================================================
// STAFF PERMISSION MANAGEMENT
// ============================================================

/**
 * Get permissions for a specific staff member
 */
export const fetchStaffPermissions = async (
  staffId: string
): Promise<StaffPermission[]> => {
  const { data } = await apiClient.get<{ staff_id: string; user_id: string; permissions: StaffPermission[] }>(
    `/staff/${staffId}/permissions`
  );
  return data.permissions || [];
};

/**
 * Update permissions for a staff member
 * Replaces all existing permissions with the new set
 */
export const updateStaffPermissions = async (
  staffId: string,
  permissionIds: number[]
): Promise<void> => {
  await apiClient.put(`/staff/${staffId}/permissions`, { permission_ids: permissionIds });
};

/**
 * Get available permissions for staff assignment
 * Returns permissions grouped by category, filtered for business scope
 */
export const fetchAvailableStaffPermissions = async (
  _businessId: string
): Promise<PermissionCategory[]> => {
  const { data } = await apiClient.get<PermissionCategory[]>(
    `/staff/permissions/available`
  );
  return data;
};

// ============================================================
// PERMISSION UTILITIES (for backward compatibility)
// ============================================================

/**
 * Fetch all permissions
 */
export const fetchAllPermissions = async (): Promise<Permission[]> => {
  const { data } = await apiClient.get<Permission[]>(`/permissions`);
  return data;
};

/**
 * Fetch all roles (legacy - still useful for system roles display)
 */
export const fetchAllRoles = async () => {
  const { data } = await apiClient.get(`/user-roles`);
  return data;
};

