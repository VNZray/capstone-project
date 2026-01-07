import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchEventCategories,
  fetchEventCategoryById,
  fetchPublishedEvents,
  fetchUpcomingEvents,
  fetchFeaturedEvents,
  fetchAllEvents,
  fetchEventById,
  fetchEventImages,
  fetchEventCategoriesForEvent,
  fetchEventLocations,
  createEvent,
  updateEvent,
  deleteEvent,
  addEventImage,
  deleteEventImage,
  setPrimaryEventImage,
} from '@/services/EventService';
import type { Event, EventCategory, EventFormData } from '@/types/Event';

// ===== QUERY KEYS =====
export const eventQueryKeys = {
  all: ['events'] as const,
  published: ['events', 'published'] as const,
  upcoming: ['events', 'upcoming'] as const,
  featured: ['events', 'featured'] as const,
  detail: (id: string) => ['events', 'detail', id] as const,
  images: (id: string) => ['events', 'images', id] as const,
  categories: ['events', 'categories'] as const,
  eventCategories: (id: string) => ['events', 'eventCategories', id] as const,
  locations: (id: string) => ['events', 'locations', id] as const,
};

// ===== EVENT CATEGORIES QUERIES =====

/**
 * Fetch all event categories
 */
export const useEventCategories = () => {
  return useQuery({
    queryKey: eventQueryKeys.categories,
    queryFn: fetchEventCategories,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Fetch event category by ID
 */
export const useEventCategory = (id: string) => {
  return useQuery({
    queryKey: [...eventQueryKeys.categories, id],
    queryFn: () => fetchEventCategoryById(id),
    enabled: !!id,
  });
};

// ===== EVENTS QUERIES =====

/**
 * Fetch all published events for public/tourist view
 * Supports optional filters: category_id, upcoming, search
 */
export const usePublishedEvents = (params?: {
  category_id?: string;
  upcoming?: boolean;
  search?: string;
}) => {
  return useQuery({
    queryKey: [...eventQueryKeys.published, params],
    queryFn: () => fetchPublishedEvents(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Fetch upcoming events (next 30 days)
 */
export const useUpcomingEvents = () => {
  return useQuery({
    queryKey: eventQueryKeys.upcoming,
    queryFn: fetchUpcomingEvents,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Fetch featured events
 */
export const useFeaturedEvents = () => {
  return useQuery({
    queryKey: eventQueryKeys.featured,
    queryFn: fetchFeaturedEvents,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Fetch all events (admin/staff view)
 */
export const useAllEvents = () => {
  return useQuery({
    queryKey: eventQueryKeys.all,
    queryFn: fetchAllEvents,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Fetch single event by ID with full details
 */
export const useEvent = (id: string) => {
  return useQuery({
    queryKey: eventQueryKeys.detail(id),
    queryFn: () => fetchEventById(id),
    enabled: !!id,
  });
};

/**
 * Fetch event images
 */
export const useEventImages = (eventId: string) => {
  return useQuery({
    queryKey: eventQueryKeys.images(eventId),
    queryFn: () => fetchEventImages(eventId),
    enabled: !!eventId,
  });
};

/**
 * Fetch categories for a specific event
 */
export const useEventCategoriesForEvent = (eventId: string) => {
  return useQuery({
    queryKey: eventQueryKeys.eventCategories(eventId),
    queryFn: () => fetchEventCategoriesForEvent(eventId),
    enabled: !!eventId,
  });
};

/**
 * Fetch locations for a specific event
 */
export const useEventLocations = (eventId: string) => {
  return useQuery({
    queryKey: eventQueryKeys.locations(eventId),
    queryFn: () => fetchEventLocations(eventId),
    enabled: !!eventId,
  });
};

// ===== MUTATIONS =====

/**
 * Create a new event
 */
export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventData: EventFormData) => createEvent(eventData),
    onSuccess: () => {
      // Invalidate all events queries
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.published });
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.upcoming });
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.featured });
    },
  });
};

/**
 * Update an existing event
 */
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EventFormData> }) =>
      updateEvent(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific event and lists
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.published });
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.upcoming });
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.featured });
    },
  });
};

/**
 * Delete an event
 */
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.published });
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.upcoming });
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.featured });
    },
  });
};

/**
 * Add an image to an event
 */
export const useAddEventImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      imageData,
    }: {
      eventId: string;
      imageData: {
        file_url: string;
        file_format?: string;
        file_size?: number;
        is_primary?: boolean;
        alt_text?: string;
        display_order?: number;
      };
    }) => addEventImage(eventId, imageData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.images(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.detail(variables.eventId) });
    },
  });
};

/**
 * Delete an event image
 */
export const useDeleteEventImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, imageId }: { eventId: string; imageId: string }) =>
      deleteEventImage(eventId, imageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.images(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.detail(variables.eventId) });
    },
  });
};

/**
 * Set primary event image
 */
export const useSetPrimaryEventImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, imageId }: { eventId: string; imageId: string }) =>
      setPrimaryEventImage(eventId, imageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.images(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.detail(variables.eventId) });
    },
  });
};
