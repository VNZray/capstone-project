import tourismApiClient from '@/services/api/tourismApiClient';
import type {
  Event,
  EventCategory,
  EventImage,
  EventLocation,
  EventFormData,
} from '@/types/Event';

// ===== EVENT CATEGORIES =====

// Fetch all event categories
export const fetchEventCategories = async (): Promise<EventCategory[]> => {
  const { data } = await tourismApiClient.get('/events/categories');
  return data?.data || [];
};

// Fetch event category by ID
export const fetchEventCategoryById = async (id: string): Promise<EventCategory | null> => {
  const { data } = await tourismApiClient.get(`/events/categories/${id}`);
  return data?.data || null;
};

// ===== EVENTS (Public/Tourist) =====

// Fetch all published events (for tourists/public)
export const fetchPublishedEvents = async (params?: {
  category_id?: string;
  upcoming?: boolean;
  search?: string;
}): Promise<Event[]> => {
  const queryParams = new URLSearchParams();

  if (params?.category_id) {
    queryParams.append('category_id', params.category_id);
  }
  if (params?.upcoming) {
    queryParams.append('upcoming', 'true');
  }
  if (params?.search) {
    queryParams.append('search', params.search);
  }

  const queryString = queryParams.toString();
  const url = `/events/public${queryString ? `?${queryString}` : ''}`;

  const { data } = await tourismApiClient.get(url);
  return data?.data || [];
};

// Fetch upcoming events (next 30 days)
export const fetchUpcomingEvents = async (): Promise<Event[]> => {
  const { data } = await tourismApiClient.get('/events/upcoming');
  return data?.data || [];
};

// Fetch featured events
export const fetchFeaturedEvents = async (): Promise<Event[]> => {
  const { data } = await tourismApiClient.get('/events/featured/list');
  return data?.data || [];
};

// Fetch all events (admin/staff view)
export const fetchAllEvents = async (): Promise<Event[]> => {
  const { data } = await tourismApiClient.get('/events');
  return data?.data || [];
};

// Fetch single event by ID
export const fetchEventById = async (id: string): Promise<Event | null> => {
  const { data } = await tourismApiClient.get(`/events/${id}`);
  return data?.data || null;
};

// ===== EVENT IMAGES =====

// Fetch event images
export const fetchEventImages = async (eventId: string): Promise<EventImage[]> => {
  const { data } = await tourismApiClient.get(`/events/${eventId}/images`);
  return data?.data || [];
};

// ===== EVENT CATEGORIES (for an event) =====

// Fetch categories for a specific event
export const fetchEventCategoriesForEvent = async (eventId: string): Promise<EventCategory[]> => {
  const { data } = await tourismApiClient.get(`/events/${eventId}/categories`);
  return data?.data || [];
};

// ===== EVENT LOCATIONS (for an event) =====

// Fetch locations for a specific event
export const fetchEventLocations = async (eventId: string): Promise<EventLocation[]> => {
  const { data } = await tourismApiClient.get(`/events/${eventId}/locations`);
  return data?.data || [];
};

// ===== CREATE/UPDATE EVENTS (for authenticated users) =====

// Create a new event
export const createEvent = async (eventData: EventFormData): Promise<{ id: string; status: string }> => {
  const { data } = await tourismApiClient.post('/events', eventData);
  return data?.data;
};

// Update an event
export const updateEvent = async (id: string, eventData: Partial<EventFormData>): Promise<Event> => {
  const { data } = await tourismApiClient.put(`/events/${id}`, eventData);
  return data?.data;
};

// Delete an event
export const deleteEvent = async (id: string): Promise<void> => {
  await tourismApiClient.delete(`/events/${id}`);
};

// ===== EVENT IMAGE MANAGEMENT =====

// Add event image
export const addEventImage = async (
  eventId: string,
  imageData: {
    file_url: string;
    file_format?: string;
    file_size?: number;
    is_primary?: boolean;
    alt_text?: string;
    display_order?: number;
  }
): Promise<void> => {
  await tourismApiClient.post(`/events/${eventId}/images`, imageData);
};

// Delete event image
export const deleteEventImage = async (eventId: string, imageId: string): Promise<void> => {
  await tourismApiClient.delete(`/events/${eventId}/images/${imageId}`);
};

// Set primary event image
export const setPrimaryEventImage = async (eventId: string, imageId: string): Promise<void> => {
  await tourismApiClient.put(`/events/${eventId}/images/${imageId}/set-primary`);
};
