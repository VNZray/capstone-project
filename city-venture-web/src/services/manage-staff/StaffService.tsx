import { apiService } from "@/src/utils/api";
import apiClient from "../apiClient";
import api from "../api";

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
  role?: string;
}

export interface Permission {
  id: number;
  name: string;
  description: string;
  can_add: boolean;
  can_view: boolean;
  can_update: boolean;
  can_delete: boolean;
  permission_for: string;
}

export interface Role {
  id: number;
  role_name: string;
  description: string;
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

/**
 * Fetch all roles
 */
export const fetchAllRoles = async () => {
  const { data } = await apiClient.get(`/user-roles`);
  return data;
};

/**
 * Fetch roles by role_for (Business or Tourism roles)
 */
export const fetchRolesByRoleFor = async (roleFor: string = 'Business'): Promise<Role[]> => {
  const { data } = await apiClient.get<Role[]>(`/user-roles/role-for/${roleFor}`);
  return data;
};

/**
 * Fetch roles by business (custom roles created by business owner)
 */
export const fetchRolesByBusinessId = async (businessId: string): Promise<Role[]> => {
  const { data } = await apiClient.get<Role[]>(`/user-roles/business/${businessId}`);
  return data;
};

/**
 * Fetch all permissions
 */
export const fetchAllPermissions = async (): Promise<Permission[]> => {
  const { data } = await apiClient.get<Permission[]>(`/permissions`);
  return data;
};

/**
 * Fetch permissions for a role
 */
export const fetchRolePermissions = async (roleId: number): Promise<Permission[]> => {
  const { data } = await apiClient.get<Permission[]>(`/permissions/role/${roleId}`);
  return data;
};

/**
 * Create a new permission
 */
export const createPermission = async (permissionData: {
  name: string;
  description: string;
  can_add: boolean;
  can_view: boolean;
  can_update: boolean;
  can_delete: boolean;
  permission_for: string;
}) => {
  const { data } = await apiClient.post(`/permissions`, permissionData);
  return data;
};

/**
 * Create a new role
 */
export const createRole = async (roleData: {
  role_name: string;
  description: string;
  role_for?: string | undefined | null;
}): Promise<Role> => {
  const { data } = await apiClient.post(`/user-roles`, roleData);
  return data;
};

/**
 * Assign permissions to a role
 */
export const assignRolePermissions = async (
  roleId: number,
  permissionIds: number[]
) => {
  const { data } = await apiClient.post(`/permissions/assign`, {
    user_role_id: roleId,
    permission_ids: permissionIds,
  });
  return data;
};
