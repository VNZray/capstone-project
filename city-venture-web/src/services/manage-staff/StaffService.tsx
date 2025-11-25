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
  id: string,
  is_active: boolean
): Promise<StaffMember> => {
  return updateStaffById(id, { is_active: !is_active });
};
