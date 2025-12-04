/**
 * Event Category Constants
 * 
 * Defines the available event categories for the system
 */

export const EVENT_CATEGORIES = [
  { 
    slug: 'cultural' as const, 
    name: 'Cultural', 
    description: 'Cultural celebrations, festivals, and heritage events',
    icon: 'landmark',
    color: '#9333EA'
  },
  { 
    slug: 'food' as const, 
    name: 'Food', 
    description: 'Food festivals, culinary events, and food fairs',
    icon: 'utensils',
    color: '#F97316'
  },
  { 
    slug: 'adventure' as const, 
    name: 'Adventure', 
    description: 'Outdoor activities, sports, and adventure events',
    icon: 'mountain',
    color: '#10B981'
  },
  { 
    slug: 'religious' as const, 
    name: 'Religious', 
    description: 'Religious festivals, celebrations, and spiritual events',
    icon: 'church',
    color: '#8B5CF6'
  },
  { 
    slug: 'other' as const, 
    name: 'Other', 
    description: 'Other types of events',
    icon: 'calendar',
    color: '#64748B'
  },
] as const;

export type EventCategorySlug = typeof EVENT_CATEGORIES[number]['slug'];

/**
 * Get category by slug
 */
export const getEventCategoryBySlug = (slug: EventCategorySlug) => {
  return EVENT_CATEGORIES.find(c => c.slug === slug);
};

/**
 * Get category color by slug
 */
export const getEventCategoryColor = (slug: EventCategorySlug): string => {
  return getEventCategoryBySlug(slug)?.color || '#64748B';
};

/**
 * Get category icon by slug
 */
export const getEventCategoryIcon = (slug: EventCategorySlug): string => {
  return getEventCategoryBySlug(slug)?.icon || 'calendar';
};
