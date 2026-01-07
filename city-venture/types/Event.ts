// Event status types
export type EventStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'published'
  | 'cancelled'
  | 'completed'
  | 'archived';

// Event category interface
export interface EventCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

// Event image interface
export interface EventImage {
  id: string;
  event_id: string;
  file_url: string;
  file_format?: string;
  file_size?: number;
  is_primary: boolean;
  alt_text?: string;
  display_order: number;
  uploaded_at: string;
  updated_at?: string;
}

// Event location interface (for multiple locations)
export interface EventLocation {
  id: string;
  event_id: string;
  venue_name: string;
  venue_address?: string;
  barangay_id?: number;
  barangay_name?: string;
  municipality_name?: string;
  province_name?: string;
  latitude?: number;
  longitude?: number;
  is_primary: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

// Main Event interface
export interface Event {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  category_name?: string;
  category_icon?: string;

  // Multiple categories support
  categories?: EventCategory[];

  // Venue/Location (legacy single location)
  venue_name?: string;
  venue_address?: string;
  barangay_id?: number;
  barangay_name?: string;
  municipality_name?: string;
  province_name?: string;
  latitude?: number;
  longitude?: number;

  // Multiple locations support
  locations?: EventLocation[];

  // Event timing
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  is_all_day: boolean;
  is_recurring: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';

  // Pricing & capacity
  ticket_price?: number;
  is_free: boolean;
  max_capacity?: number;
  current_attendees?: number;

  // Contact
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  registration_url?: string;

  // Media
  cover_image_url?: string;
  gallery_images?: string[];
  images?: EventImage[];

  // Status and visibility
  status: EventStatus;
  is_featured: boolean;
  featured_order?: number;

  // Organizer
  organizer_id?: string;
  organizer_name?: string;
  organizer_type?: 'tourism_office' | 'business' | 'community';

  // Audit
  submitted_by?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;

  // Timestamps
  created_at: string;
  updated_at?: string;
}

// Event form data for creating/updating events
export interface EventFormData {
  name: string;
  description?: string;
  category_id?: string;
  venue_name?: string;
  venue_address?: string;
  barangay_id?: number;
  latitude?: number;
  longitude?: number;
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  is_all_day?: boolean;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  ticket_price?: number;
  is_free?: boolean;
  max_capacity?: number;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  registration_url?: string;
  cover_image_url?: string;
  organizer_name?: string;
  organizer_type?: 'tourism_office' | 'business' | 'community';
}

// API response wrapper
export interface EventApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
