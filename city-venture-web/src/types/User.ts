export type UserRoles = {
  id: number | null;
  role_name: string;
  // Some APIs may return `role_description`; keep both for compatibility
  description?: string;
  role_description?: string;
  created_at?: string;
};

export type User = {
  id?: string | "";
  email: string;
  phone_number?: string | "";
  password?: string | "";
  user_profile?: string | "";
  otp?: number | null;
  is_active?: boolean;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  last_login?: string | "";
  user_role_id: number;
  barangay_id?: number | undefined | null;
};

export type UserDetails = {
  id?: string | "";
  first_name?: string;
  middle_name?: string | "";
  last_name?: string;
  role_name?: string;
  description?: string;
  email: string;
  password: string | "";
  phone_number?: string | "";
  gender?: string | "";
  birthdate?: string | "";
  nationality?: string | "";
  ethnicity?: string | "";
  category?: string | "";
  user_profile?: string | "";
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string | "";
  user_role_id: number;
  barangay_id?: number | "";
  address?: string | "";
  user_id?: string | "";
  province_name?: string | "";
  municipality_name?: string | "";
  barangay_name?: string | "";
};

export type TokenPayload = {
  id: string;
  user_role_id: number;
  exp?: number;
  iat?: number;
};