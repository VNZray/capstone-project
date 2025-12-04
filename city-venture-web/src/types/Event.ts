/**
 * Event Management System Types
 * 
 * Core TypeScript interfaces for the Tourism Event Management System
 */

// ==================== EVENT STATUS TYPES ====================

export type EventStatus = 
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'published'
  | 'cancelled'
  | 'completed'
  | 'archived';

export type EventOrganizerType = 'user' | 'business' | 'tourism';

export type FeaturedPriority = 'high' | 'medium' | 'low';

export type FeaturedDisplayLocation = 
  | 'homepage_hero'
  | 'homepage_carousel'
  | 'category_page'
  | 'sidebar'
  | 'search_results';

export type ReviewStatus = 'pending' | 'approved' | 'flagged' | 'hidden';

// ==================== EVENT CATEGORY ====================

export type EventCategorySlug = 'cultural' | 'food' | 'adventure' | 'religious' | 'other';

export interface EventCategory {
  id: number;
  name: string;
  slug: EventCategorySlug;
  description: string | null;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  event_count?: number;
  created_at: string;
  updated_at: string;
}

export interface EventCategoryFormData {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active?: boolean;
}

// ==================== EVENT TAG ====================

export interface EventTag {
  id: number;
  name: string;
  slug: string;
  color: string | null;
  icon: string | null;
  is_active: boolean;
  created_at: string;
}

// ==================== EVENT IMAGE ====================

export interface EventImage {
  id: string;
  event_id: string;
  file_url: string;
  file_name: string | null;
  file_format: string;
  file_size: number | null;
  is_primary: boolean;
  alt_text: string | null;
  display_order: number;
  uploaded_at: string;
}

export interface EventImageFormData {
  file_url: string;
  file_name?: string;
  file_format: string;
  file_size?: number;
  is_primary?: boolean;
  alt_text?: string;
  display_order?: number;
}

export interface PendingEventImage {
  id: string;
  file: File;
  preview: string;
  is_primary: boolean;
  alt_text: string;
}

// ==================== EVENT SCHEDULE ====================

export interface EventSchedule {
  id: string;
  event_id: string;
  title: string | null;
  description: string | null;
  schedule_date: string;
  start_time: string | null;
  end_time: string | null;
  location_override: string | null;
  display_order: number;
  created_at: string;
}

export interface EventScheduleFormData {
  title?: string;
  description?: string;
  schedule_date: string;
  start_time?: string;
  end_time?: string;
  location_override?: string;
  display_order?: number;
}

// ==================== EVENT REVIEW ====================

export interface EventReview {
  id: string;
  event_id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  is_verified_attendee: boolean;
  status: ReviewStatus;
  is_featured: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  // Joined user data
  user_email?: string;
  user_first_name?: string;
  user_last_name?: string;
  photos?: EventReviewPhoto[];
}

export interface EventReviewPhoto {
  id: string;
  review_id: string;
  file_url: string;
  file_format: string;
  file_size: number | null;
  uploaded_at: string;
}

export interface EventReviewFormData {
  rating: number;
  review_text?: string;
  is_verified_attendee?: boolean;
}

export interface EventRatingStats {
  average_rating: number | null;
  total_reviews: number;
  five_star: number;
  four_star: number;
  three_star: number;
  two_star: number;
  one_star: number;
}

// ==================== FEATURED CONFIG ====================

export interface EventFeaturedConfig {
  id: string;
  event_id: string;
  display_location: FeaturedDisplayLocation;
  display_order: number;
  priority: FeaturedPriority;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeaturedConfigFormData {
  display_location: FeaturedDisplayLocation;
  display_order?: number;
  priority?: FeaturedPriority;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

// Simple Featured Event (for list display)
export interface EventFeatured {
  id: string;
  event_id: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  event?: Event;
}

// ==================== MAIN EVENT INTERFACE ====================

export interface Event {
  id: string;
  name: string;
  description: string;
  short_description: string | null;
  
  // Date and Time
  start_date: string;
  end_date: string;
  timezone: string;
  is_all_day: boolean;
  
  // Location
  barangay_id: number | null;
  venue_name: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  barangay?: string;
  municipality?: string;
  province?: string;
  
  // Category
  event_category_id: number | null;
  category_name?: string;
  category_slug?: string;
  category_color?: string;
  category_icon?: string;
  
  // Pricing
  is_free: boolean;
  entry_fee: number | null;
  early_bird_price: number | null;
  early_bird_deadline: string | null;
  
  // Capacity
  max_attendees: number | null;
  current_attendees: number;
  registration_required: boolean;
  registration_url: string | null;
  
  // Organizer
  organizer_id: string | null;
  organizer_type: EventOrganizerType;
  organizer_name: string | null;
  organizer_email: string | null;
  organizer_phone: string | null;
  
  // Contact & Links
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  
  // Status & Workflow
  status: EventStatus;
  rejection_reason: string | null;
  approved_by: string | null;
  approved_at: string | null;
  
  // Featured
  is_featured: boolean;
  featured_priority: FeaturedPriority | null;
  featured_start_date: string | null;
  featured_end_date: string | null;
  
  // Recurring Events
  is_recurring: boolean;
  recurrence_pattern: RecurrencePattern | null;
  parent_event_id: string | null;
  
  // SEO & Meta
  slug: string | null;
  meta_title: string | null;
  meta_description: string | null;
  
  // Analytics
  view_count: number;
  share_count: number;
  bookmark_count: number;
  
  // Computed/Joined
  primary_image?: string;
  average_rating?: number | null;
  review_count?: number;
  
  // Related data
  images?: EventImage[];
  tags?: EventTag[];
  schedules?: EventSchedule[];
  
  // Audit
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  days?: number[]; // For weekly: [1, 3, 5] = Mon, Wed, Fri
  until?: string;
  count?: number;
}

// ==================== FORM DATA ====================

export interface EventFormData {
  name: string;
  description: string;
  short_description?: string;
  
  // Date and Time
  start_date: string;
  end_date: string;
  timezone?: string;
  is_all_day?: boolean;
  
  // Location
  barangay_id?: string;
  venue_name?: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  
  // Category - supports multiple categories
  event_category_id?: string;
  event_category_ids?: string[];
  
  // Pricing
  is_free?: boolean;
  entry_fee?: string;
  early_bird_price?: string;
  early_bird_deadline?: string;
  
  // Capacity
  max_attendees?: string;
  registration_required?: boolean;
  registration_url?: string;
  
  // Organizer
  organizer_type?: EventOrganizerType;
  organizer_name?: string;
  organizer_email?: string;
  organizer_phone?: string;
  
  // Contact & Links
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  facebook_url?: string;
  instagram_url?: string;
  
  // Status
  status?: EventStatus;
  
  // SEO
  meta_title?: string;
  meta_description?: string;
  
  // Tags
  tag_ids?: number[];
}

// ==================== SEARCH & FILTER ====================

export interface EventSearchParams {
  keyword?: string;
  category_id?: number;
  start_date?: string;
  end_date?: string;
  is_free?: boolean;
  barangay_id?: number;
  municipality_id?: number;
  province_id?: number;
  status?: EventStatus;
  sort_by?: 'name' | 'start_date' | 'end_date' | 'created_at' | 'view_count';
  sort_order?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}

export interface NearbySearchParams {
  latitude: number;
  longitude: number;
  radius?: number; // in km
  limit?: number;
}

// ==================== CALENDAR ====================

export interface CalendarEvent {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_all_day: boolean;
  venue_name: string | null;
  is_free: boolean;
  entry_fee: number | null;
  category_name: string | null;
  category_color: string | null;
  category_icon: string | null;
  primary_image: string | null;
}

export interface EventDensity {
  event_date: string;
  event_count: number;
}

// ==================== API RESPONSE TYPES ====================

export interface EventApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface EventListResponse {
  success: boolean;
  data: Event[];
  message: string;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// ==================== EVENT STATS ====================

export interface EventStats {
  view_count: number;
  share_count: number;
  bookmark_count: number;
  current_attendees: number;
  max_attendees: number | null;
  review_count: number;
  average_rating: number | null;
}

// ==================== BOOKMARK ====================

export interface EventBookmark {
  event_id: string;
  user_id: string;
  bookmarked_at: string;
  event?: Event;
}

// ==================== APPROVAL ====================

export interface PendingEvent extends Event {
  created_by_email?: string;
}

export interface EventApprovalAction {
  eventId: string;
  action: 'approve' | 'reject';
  reason?: string;
}

// ==================== FEATURED MANAGEMENT ====================

export interface FeaturedEventFormData {
  is_featured: boolean;
  priority?: FeaturedPriority;
  start_date?: string;
  end_date?: string;
}

// Helper type for featured event with display info
export interface FeaturedEvent extends Event {
  display_order?: number;
  display_location?: FeaturedDisplayLocation;
}
