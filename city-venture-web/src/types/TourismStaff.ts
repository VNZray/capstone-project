export type TourismStaff = {
  tourism_id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  position?: string | null;

  user_id: string;
  email: string;
  phone_number?: string | null;
  is_verified?: boolean;
  is_active?: boolean;
  created_at?: string;
  last_login?: string | null;

  role_id?: number | null;
  role_name?: string | null;
};

export type CreateTourismStaffRequest = {
  email: string;
  phone_number: string;
  password?: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  position?: string | null;
  user_role_id?: number;
  role_name?: string;
  is_verified?: boolean;
  is_active?: boolean;
  barangay_id?: number | null;
};

export type UpdateTourismStaffRequest = Partial<CreateTourismStaffRequest>;
