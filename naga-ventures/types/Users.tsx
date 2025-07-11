export type Tourist = {
  tourist_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  profile_picture?: string;
  ethnicity?: string;
  age?: number;
  gender?: string;
  nationality?: string;
  category?: string;
  contact_number?: string;
  email?: string;
  created_at?: string; // ISO timestamp
};

export type Owner = {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  business_type?: string;
  phone_number?: string;
  email?: string;
  user_id?: string;
};


export type Admin = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  role: 'super_admin' | 'admin';
};