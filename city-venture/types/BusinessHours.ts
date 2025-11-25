
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface BusinessHours {
  id?: string;
  business_id: string;
  day_of_week: DayOfWeek;
  opening_time: string; // HH:MM format
  closing_time: string; // HH:MM format
  is_closed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BusinessHoursDisplay {
  day: string;
  open: string;
  close: string;
  is_closed: boolean;
}

export interface BusinessOperatingStatus {
  is_open: boolean;
  current_day: DayOfWeek;
  today_hours?: BusinessHours;
  next_open_time?: string;
}
