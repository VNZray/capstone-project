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
  role_description: string | null;
  role_type?: 'system' | 'preset' | 'business';
  role_for: string | null;
  is_custom?: boolean;
  is_immutable?: boolean;
  based_on_role_id?: number | null;
  based_on_name?: string;
  permission_count?: number;
  user_count?: number;
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
 * Fetch roles by business (RBAC business roles)
 * Uses the new RBAC endpoint that returns business-specific roles
 */
export const fetchRolesByBusinessId = async (businessId: string): Promise<Role[]> => {
  const { data } = await apiClient.get<Role[]>(`/roles/business/${businessId}`);
  return data;
};

/**
 * Fetch preset roles (templates available to all businesses)
 * These are standard role templates that can be assigned to staff
 */
export const fetchPresetRoles = async (): Promise<Role[]> => {
  const { data } = await apiClient.get<Role[]>(`/roles/presets`);
  return data;
};

/**
 * Fetch both business roles and preset roles for staff assignment
 * Returns a combined list with preset roles clearly marked
 */
export const fetchAvailableRolesForStaff = async (businessId: string): Promise<Role[]> => {
  try {
    const [businessRoles, presetRoles] = await Promise.all([
      fetchRolesByBusinessId(businessId),
      fetchPresetRoles(),
    ]);
    
    // Combine: business roles first, then presets that aren't duplicated
    const businessRoleNames = new Set(businessRoles.map(r => r.role_name.toLowerCase()));
    const uniquePresets = presetRoles.filter(
      preset => !businessRoleNames.has(preset.role_name.toLowerCase())
    );
    
    return [...businessRoles, ...uniquePresets];
  } catch (error) {
    console.error("Error fetching available roles:", error);
    // Fallback to just business roles if preset fetch fails
    return fetchRolesByBusinessId(businessId);
  }
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
 * Onboard a new staff member
 * Creates user account + staff record in one transaction
 * Returns staff info with temp_password for email invitation
 */
export const onboardStaff = async (staffData: {
  first_name: string;
  last_name?: string;
  email: string;
  phone_number?: string;
  password?: string;
  business_id: string;
  role_id: number;
}): Promise<StaffMember & { temp_password: string; invitation_token: string }> => {
  const { data } = await apiClient.post(`/staff/onboard`, staffData);
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
  console.log(`Assigning ${permissionIds.length} permissions to role ${roleId}`);
  const { data } = await apiClient.post(`/permissions/role_permission`, {
    user_role_id: roleId,
    permission_ids: permissionIds,
  });
  console.log("Assign permissions response:", data);
  return data;
};

/**
 * Insert a new permission
 * @param permissionData - The data for the new permission
 */
export const insertPermission = async (permissionData: {
  name: string;
  description: string;
  can_add: boolean;
  can_view: boolean;
  can_update: boolean;
  can_delete: boolean;
  business_id: string | null | undefined;
}) => {
  console.log("Inserting permission with data:", permissionData);
  const { data } = await apiClient.post("/permissions", permissionData);
  console.log("Insert permission response:", data);
  return data;
};

