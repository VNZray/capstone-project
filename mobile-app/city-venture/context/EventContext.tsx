import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type {
  Event,
  EventCategory,
  EventImage,
  EventLocation,
} from '@/types/Event';
import {
  fetchPublishedEvents,
  fetchUpcomingEvents,
  fetchFeaturedEvents,
  fetchEventById,
  fetchEventCategories,
  fetchEventImages,
  fetchEventLocations,
} from '@/services/EventService';

interface EventContextType {
  // Event lists
  events: Event[];
  upcomingEvents: Event[];
  featuredEvents: Event[];
  categories: EventCategory[];

  // Selected event
  selectedEventId: string | null;
  selectedEvent: Event | null;
  selectedEventImages: EventImage[];
  selectedEventLocations: EventLocation[];

  // Loading states
  loading: boolean;
  loadingEvent: boolean;

  // Actions
  setEventId: (id: string) => void;
  clearEventId: () => void;
  refreshEvents: (params?: { category_id?: string; upcoming?: boolean; search?: string }) => Promise<void>;
  refreshUpcomingEvents: () => Promise<void>;
  refreshFeaturedEvents: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshSelectedEvent: () => Promise<void>;
  refreshEventImages: () => Promise<void>;
  refreshEventLocations: () => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

type ProviderProps = {
  children: ReactNode;
};

export const EventProvider = ({ children }: ProviderProps) => {
  // Event lists
  const [events, setEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);

  // Selected event
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedEventImages, setSelectedEventImages] = useState<EventImage[]>([]);
  const [selectedEventLocations, setSelectedEventLocations] = useState<EventLocation[]>([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(false);

  const setEventId = useCallback((id: string) => {
    setSelectedEventId(id);
  }, []);

  const clearEventId = useCallback(() => {
    setSelectedEventId(null);
    setSelectedEvent(null);
    setSelectedEventImages([]);
    setSelectedEventLocations([]);
  }, []);

  const refreshEvents = useCallback(async (params?: { category_id?: string; upcoming?: boolean; search?: string }) => {
    setLoading(true);
    try {
      const list = await fetchPublishedEvents(params);
      setEvents(list);
    } catch (e: any) {
      console.error('Failed to fetch events', e?.response?.status, e?.message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUpcomingEvents = useCallback(async () => {
    try {
      const list = await fetchUpcomingEvents();
      setUpcomingEvents(list);
    } catch (e: any) {
      console.error('Failed to fetch upcoming events', e?.response?.status, e?.message);
      setUpcomingEvents([]);
    }
  }, []);

  const refreshFeaturedEvents = useCallback(async () => {
    try {
      const list = await fetchFeaturedEvents();
      setFeaturedEvents(list);
    } catch (e: any) {
      console.error('Failed to fetch featured events', e?.response?.status, e?.message);
      setFeaturedEvents([]);
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      const cats = await fetchEventCategories();
      setCategories(cats);
    } catch (e: any) {
      console.error('Failed to fetch event categories', e?.response?.status, e?.message);
      setCategories([]);
    }
  }, []);

  const refreshSelectedEvent = useCallback(async () => {
    if (!selectedEventId) return;
    setLoadingEvent(true);
    try {
      const event = await fetchEventById(selectedEventId);
      setSelectedEvent(event);
      if (event?.images) {
        setSelectedEventImages(event.images);
      }
      if (event?.locations) {
        setSelectedEventLocations(event.locations);
      }
    } catch (e: any) {
      console.error('Failed to fetch event', e?.response?.status, e?.message);
      setSelectedEvent(null);
    } finally {
      setLoadingEvent(false);
    }
  }, [selectedEventId]);

  const refreshEventImages = useCallback(async () => {
    if (!selectedEventId) return;
    try {
      const images = await fetchEventImages(selectedEventId);
      setSelectedEventImages(images);
    } catch (e: any) {
      console.error('Failed to fetch event images', e?.response?.status, e?.message);
    }
  }, [selectedEventId]);

  const refreshEventLocations = useCallback(async () => {
    if (!selectedEventId) return;
    try {
      const locations = await fetchEventLocations(selectedEventId);
      setSelectedEventLocations(locations);
    } catch (e: any) {
      console.error('Failed to fetch event locations', e?.response?.status, e?.message);
    }
  }, [selectedEventId]);

  // Auto load events on mount
  useEffect(() => {
    refreshEvents();
    refreshUpcomingEvents();
    refreshFeaturedEvents();
    refreshCategories();
  }, [refreshEvents, refreshUpcomingEvents, refreshFeaturedEvents, refreshCategories]);

  // When selected id changes, pull details
  useEffect(() => {
    if (selectedEventId) {
      refreshSelectedEvent();
    }
  }, [selectedEventId, refreshSelectedEvent]);

  return (
    <EventContext.Provider
      value={{
        events,
        upcomingEvents,
        featuredEvents,
        categories,
        selectedEventId,
        selectedEvent,
        selectedEventImages,
        selectedEventLocations,
        loading,
        loadingEvent,
        setEventId,
        clearEventId,
        refreshEvents,
        refreshUpcomingEvents,
        refreshFeaturedEvents,
        refreshCategories,
        refreshSelectedEvent,
        refreshEventImages,
        refreshEventLocations,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = (): EventContextType => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
};
