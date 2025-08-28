export interface TouristSpotFormData {
  name: string;
  description: string;
  province_id: string;
  municipality_id: string;
  barangay_id: string;
  latitude: string;
  longitude: string;
  contact_phone: string;
  contact_email: string;
  website: string;
  entry_fee: string;
  category_id: string;
  type_id: string;
  spot_status: "" | "pending" | "active" | "inactive";
}

export interface Option {
  id: number;
  label: string;
}

export interface DaySchedule {
  dayIndex: number;
  is_closed: boolean;
  open_time: string;
  close_time: string;
}
