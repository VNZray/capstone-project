import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { handleDbError } from "../utils/errorHandler.js";

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate URL-friendly slug from event name
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    + '-' + Date.now().toString(36);
}

/**
 * Merge event data with related images, tags, and schedules
 */
function mergeEventData(events, images = [], tags = [], schedules = []) {
  const imgMap = new Map();
  const tagMap = new Map();
  const schedMap = new Map();

  for (const img of images) {
    if (!imgMap.has(img.event_id)) imgMap.set(img.event_id, []);
    imgMap.get(img.event_id).push(img);
  }

  for (const tag of tags) {
    if (!tagMap.has(tag.event_id)) tagMap.set(tag.event_id, []);
    tagMap.get(tag.event_id).push(tag);
  }

  for (const sched of schedules) {
    if (!schedMap.has(sched.event_id)) schedMap.set(sched.event_id, []);
    schedMap.get(sched.event_id).push(sched);
  }

  return events.map(event => ({
    ...event,
    images: imgMap.get(event.id) || [],
    tags: tagMap.get(event.id) || [],
    schedules: schedMap.get(event.id) || [],
  }));
}

// ==================== EVENT CRUD ====================

/**
 * Get all events with optional status filter
 */
export async function getAllEvents(req, res) {
  try {
    const { status, limit, offset } = req.query;
    const [data] = await db.query('CALL GetAllEvents(?, ?, ?)', [
      status || null,
      limit ? parseInt(limit) : null,
      offset ? parseInt(offset) : null
    ]);
    
    res.json({
      success: true,
      data: data[0] || [],
      message: 'Events retrieved successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Get event by ID with full details (images, tags, schedules)
 */
export async function getEventById(req, res) {
  try {
    const { id } = req.params;
    const [data] = await db.query('CALL GetEventById(?)', [id]);
    
    const events = data[0] || [];
    if (!events.length) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const event = {
      ...events[0],
      images: data[1] || [],
      tags: data[2] || [],
      schedules: data[3] || []
    };

    // Increment view count
    await db.query('CALL IncrementEventViews(?)', [id]);

    res.json({
      success: true,
      data: event,
      message: 'Event retrieved successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Get event by slug (for public URLs)
 */
export async function getEventBySlug(req, res) {
  try {
    const { slug } = req.params;
    const [data] = await db.query('CALL GetEventBySlug(?)', [slug]);
    
    const events = data[0] || [];
    if (!events.length) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Also get images, tags, schedules
    const eventId = events[0].id;
    const [detailData] = await db.query('CALL GetEventById(?)', [eventId]);

    const event = {
      ...events[0],
      images: detailData[1] || [],
      tags: detailData[2] || [],
      schedules: detailData[3] || []
    };

    // Increment view count
    await db.query('CALL IncrementEventViews(?)', [eventId]);

    res.json({
      success: true,
      data: event,
      message: 'Event retrieved successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Create new event
 */
export async function createEvent(req, res) {
  try {
    const id = uuidv4();
    const userId = req.user?.id || null;
    
    const {
      name,
      description,
      short_description,
      start_date,
      end_date,
      timezone,
      is_all_day,
      barangay_id,
      venue_name,
      address,
      latitude,
      longitude,
      event_category_id,
      is_free,
      entry_fee,
      early_bird_price,
      early_bird_deadline,
      max_attendees,
      registration_required,
      registration_url,
      organizer_id,
      organizer_type,
      organizer_name,
      organizer_email,
      organizer_phone,
      contact_phone,
      contact_email,
      website,
      facebook_url,
      instagram_url,
      status,
      meta_title,
      meta_description,
      tag_ids // Array of tag IDs
    } = req.body;

    // Validation
    if (!name || !description || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, start_date, and end_date are required'
      });
    }

    // Generate slug
    const slug = generateSlug(name);

    const params = [
      id,
      name,
      description,
      short_description || null,
      start_date,
      end_date,
      timezone || 'Asia/Manila',
      is_all_day ? 1 : 0,
      barangay_id || null,
      venue_name || null,
      address || null,
      latitude || null,
      longitude || null,
      event_category_id || null,
      is_free !== undefined ? (is_free ? 1 : 0) : 1,
      entry_fee || null,
      early_bird_price || null,
      early_bird_deadline || null,
      max_attendees || null,
      registration_required ? 1 : 0,
      registration_url || null,
      organizer_id || userId,
      organizer_type || 'tourism',
      organizer_name || null,
      organizer_email || null,
      organizer_phone || null,
      contact_phone || null,
      contact_email || null,
      website || null,
      facebook_url || null,
      instagram_url || null,
      status || 'draft',
      slug,
      meta_title || null,
      meta_description || null,
      userId
    ];

    const placeholders = params.map(() => '?').join(',');
    const [result] = await db.query(`CALL InsertEvent(${placeholders})`, params);

    // Sync tags if provided
    if (Array.isArray(tag_ids) && tag_ids.length > 0) {
      await db.query('CALL SyncEventTags(?, ?)', [id, tag_ids.join(',')]);
    }

    res.status(201).json({
      success: true,
      data: result[0][0],
      message: 'Event created successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Update existing event
 */
export async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;

    const {
      name,
      description,
      short_description,
      start_date,
      end_date,
      timezone,
      is_all_day,
      barangay_id,
      venue_name,
      address,
      latitude,
      longitude,
      event_category_id,
      is_free,
      entry_fee,
      early_bird_price,
      early_bird_deadline,
      max_attendees,
      registration_required,
      registration_url,
      organizer_id,
      organizer_type,
      organizer_name,
      organizer_email,
      organizer_phone,
      contact_phone,
      contact_email,
      website,
      facebook_url,
      instagram_url,
      status,
      slug,
      meta_title,
      meta_description,
      tag_ids
    } = req.body;

    const params = [
      id,
      name || null,
      description || null,
      short_description || null,
      start_date || null,
      end_date || null,
      timezone || null,
      is_all_day !== undefined ? (is_all_day ? 1 : 0) : null,
      barangay_id || null,
      venue_name || null,
      address || null,
      latitude || null,
      longitude || null,
      event_category_id || null,
      is_free !== undefined ? (is_free ? 1 : 0) : null,
      entry_fee || null,
      early_bird_price || null,
      early_bird_deadline || null,
      max_attendees || null,
      registration_required !== undefined ? (registration_required ? 1 : 0) : null,
      registration_url || null,
      organizer_id || null,
      organizer_type || null,
      organizer_name || null,
      organizer_email || null,
      organizer_phone || null,
      contact_phone || null,
      contact_email || null,
      website || null,
      facebook_url || null,
      instagram_url || null,
      status || null,
      slug || null,
      meta_title || null,
      meta_description || null,
      userId
    ];

    const placeholders = params.map(() => '?').join(',');
    const [result] = await db.query(`CALL UpdateEvent(${placeholders})`, params);

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Sync tags if provided
    if (Array.isArray(tag_ids)) {
      await db.query('CALL SyncEventTags(?, ?)', [id, tag_ids.join(',')]);
    }

    res.json({
      success: true,
      data: result[0][0],
      message: 'Event updated successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Delete event
 */
export async function deleteEvent(req, res) {
  try {
    const { id } = req.params;
    const [result] = await db.query('CALL DeleteEvent(?)', [id]);

    if (result[0][0].affected_rows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// ==================== EVENT CATEGORIES ====================

/**
 * Get all event categories
 */
export async function getAllEventCategories(req, res) {
  try {
    const [data] = await db.query('CALL GetAllEventCategories()');
    res.json({
      success: true,
      data: data[0] || [],
      message: 'Event categories retrieved successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Get event category by ID
 */
export async function getEventCategoryById(req, res) {
  try {
    const { id } = req.params;
    const [data] = await db.query('CALL GetEventCategoryById(?)', [id]);
    
    if (!data[0] || data[0].length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: data[0][0],
      message: 'Category retrieved successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Create event category
 */
export async function createEventCategory(req, res) {
  try {
    const { name, slug, description, icon, color } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const categorySlug = slug || name.toLowerCase().replace(/\s+/g, '-');
    const [result] = await db.query('CALL InsertEventCategory(?, ?, ?, ?, ?)', [
      name, categorySlug, description || null, icon || null, color || null
    ]);

    res.status(201).json({
      success: true,
      data: result[0][0],
      message: 'Category created successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Update event category
 */
export async function updateEventCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, slug, description, icon, color, is_active } = req.body;

    const [result] = await db.query('CALL UpdateEventCategory(?, ?, ?, ?, ?, ?, ?)', [
      id, name || null, slug || null, description || null, 
      icon || null, color || null, is_active !== undefined ? is_active : null
    ]);

    res.json({
      success: true,
      data: result[0][0],
      message: 'Category updated successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Delete event category (soft delete)
 */
export async function deleteEventCategory(req, res) {
  try {
    const { id } = req.params;
    const [result] = await db.query('CALL DeleteEventCategory(?)', [id]);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// ==================== EVENT TAGS ====================

/**
 * Get all event tags
 */
export async function getAllEventTags(req, res) {
  try {
    const [data] = await db.query('CALL GetAllEventTags()');
    res.json({
      success: true,
      data: data[0] || [],
      message: 'Event tags retrieved successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Get tags for a specific event
 */
export async function getEventTags(req, res) {
  try {
    const { id } = req.params;
    const [data] = await db.query('CALL GetEventTagsByEventId(?)', [id]);
    
    res.json({
      success: true,
      data: data[0] || [],
      message: 'Event tags retrieved successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Sync event tags (replace all tags)
 */
export async function syncEventTags(req, res) {
  try {
    const { id } = req.params;
    const { tag_ids } = req.body;

    const tagIdsStr = Array.isArray(tag_ids) ? tag_ids.join(',') : '';
    const [data] = await db.query('CALL SyncEventTags(?, ?)', [id, tagIdsStr]);

    res.json({
      success: true,
      data: data[0] || [],
      message: 'Event tags synced successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// ==================== EVENT IMAGES ====================

/**
 * Get all images for an event
 */
export async function getEventImages(req, res) {
  try {
    const { id } = req.params;
    const [data] = await db.query('CALL GetEventImages(?)', [id]);
    
    res.json({
      success: true,
      data: data[0] || [],
      message: 'Event images retrieved successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Add image to event
 */
export async function addEventImage(req, res) {
  try {
    const { id } = req.params;
    const imageId = uuidv4();
    const {
      file_url,
      file_name,
      file_format,
      file_size,
      is_primary,
      alt_text,
      display_order
    } = req.body;

    if (!file_url || !file_format) {
      return res.status(400).json({
        success: false,
        message: 'file_url and file_format are required'
      });
    }

    const [result] = await db.query('CALL InsertEventImage(?, ?, ?, ?, ?, ?, ?, ?, ?)', [
      imageId, id, file_url, file_name || null, file_format,
      file_size || null, is_primary ? 1 : 0, alt_text || null, display_order || 0
    ]);

    res.status(201).json({
      success: true,
      data: result[0][0],
      message: 'Image added successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Update event image
 */
export async function updateEventImage(req, res) {
  try {
    const { imageId } = req.params;
    const { is_primary, alt_text, display_order } = req.body;

    const [result] = await db.query('CALL UpdateEventImage(?, ?, ?, ?)', [
      imageId,
      is_primary !== undefined ? (is_primary ? 1 : 0) : null,
      alt_text || null,
      display_order !== undefined ? display_order : null
    ]);

    res.json({
      success: true,
      data: result[0][0],
      message: 'Image updated successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Delete event image
 */
export async function deleteEventImage(req, res) {
  try {
    const { imageId } = req.params;
    const [result] = await db.query('CALL DeleteEventImage(?)', [imageId]);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Set primary image for event
 */
export async function setPrimaryEventImage(req, res) {
  try {
    const { imageId } = req.params;
    const [data] = await db.query('CALL SetPrimaryEventImage(?)', [imageId]);

    res.json({
      success: true,
      data: data[0] || [],
      message: 'Primary image set successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// ==================== EVENT SCHEDULES ====================

/**
 * Get schedules for an event
 */
export async function getEventSchedules(req, res) {
  try {
    const { id } = req.params;
    const [data] = await db.query('CALL GetEventSchedules(?)', [id]);
    
    res.json({
      success: true,
      data: data[0] || [],
      message: 'Event schedules retrieved successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Add schedule to event
 */
export async function addEventSchedule(req, res) {
  try {
    const { id } = req.params;
    const scheduleId = uuidv4();
    const {
      title,
      description,
      schedule_date,
      start_time,
      end_time,
      location_override,
      display_order
    } = req.body;

    if (!schedule_date) {
      return res.status(400).json({
        success: false,
        message: 'schedule_date is required'
      });
    }

    const [result] = await db.query('CALL InsertEventSchedule(?, ?, ?, ?, ?, ?, ?, ?, ?)', [
      scheduleId, id, title || null, description || null, schedule_date,
      start_time || null, end_time || null, location_override || null, display_order || 0
    ]);

    res.status(201).json({
      success: true,
      data: result[0][0],
      message: 'Schedule added successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Update event schedule
 */
export async function updateEventSchedule(req, res) {
  try {
    const { scheduleId } = req.params;
    const {
      title,
      description,
      schedule_date,
      start_time,
      end_time,
      location_override,
      display_order
    } = req.body;

    const [result] = await db.query('CALL UpdateEventSchedule(?, ?, ?, ?, ?, ?, ?, ?)', [
      scheduleId, title || null, description || null, schedule_date || null,
      start_time || null, end_time || null, location_override || null,
      display_order !== undefined ? display_order : null
    ]);

    res.json({
      success: true,
      data: result[0][0],
      message: 'Schedule updated successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Delete event schedule
 */
export async function deleteEventSchedule(req, res) {
  try {
    const { scheduleId } = req.params;
    const [result] = await db.query('CALL DeleteEventSchedule(?)', [scheduleId]);

    res.json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// ==================== SEARCH & FILTER ====================

/**
 * Search events with filters
 */
export async function searchEvents(req, res) {
  try {
    const {
      keyword,
      category_id,
      start_date,
      end_date,
      is_free,
      barangay_id,
      municipality_id,
      province_id,
      status,
      sort_by,
      sort_order,
      limit,
      offset
    } = req.query;

    const [data] = await db.query('CALL SearchEvents(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
      keyword || null,
      category_id ? parseInt(category_id) : null,
      start_date || null,
      end_date || null,
      is_free !== undefined ? (is_free === 'true' ? 1 : 0) : null,
      barangay_id ? parseInt(barangay_id) : null,
      municipality_id ? parseInt(municipality_id) : null,
      province_id ? parseInt(province_id) : null,
      status || null,
      sort_by || 'start_date',
      sort_order || 'ASC',
      limit ? parseInt(limit) : 20,
      offset ? parseInt(offset) : 0
    ]);

    res.json({
      success: true,
      data: data[0] || [],
      message: 'Events retrieved successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Get events by category
 */
export async function getEventsByCategory(req, res) {
  try {
    const { categoryId } = req.params;
    const { limit } = req.query;
    const [data] = await db.query('CALL GetEventsByCategory(?, ?)', [
      parseInt(categoryId),
      limit ? parseInt(limit) : 10
    ]);

    res.json({
      success: true,
      data: data[0] || [],
      message: 'Events retrieved successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Get events by date range
 */
export async function getEventsByDateRange(req, res) {
  try {
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: 'start and end dates are required'
      });
    }

    const [data] = await db.query('CALL GetEventsByDateRange(?, ?)', [start, end]);

    res.json({
      success: true,
      data: data[0] || [],
      message: 'Events retrieved successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Get nearby events based on coordinates
 */
export async function getNearbyEvents(req, res) {
  try {
    const { latitude, longitude, radius, limit } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'latitude and longitude are required'
      });
    }

    const [data] = await db.query('CALL GetNearbyEvents(?, ?, ?, ?)', [
      parseFloat(latitude),
      parseFloat(longitude),
      radius ? parseFloat(radius) : 10,
      limit ? parseInt(limit) : 20
    ]);

    res.json({
      success: true,
      data: data[0] || [],
      message: 'Nearby events retrieved successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// ==================== APPROVAL WORKFLOW ====================

/**
 * Get pending events for approval
 */
export async function getPendingEvents(req, res) {
  try {
    const [data] = await db.query('CALL GetPendingEvents()');
    const events = data[0] || [];
    const images = data[1] || [];
    const tags = data[2] || [];

    const merged = mergeEventData(events, images, tags);

    res.json({
      success: true,
      data: merged,
      message: 'Pending events retrieved successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Approve event
 */
export async function approveEvent(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;

    const [result] = await db.query('CALL ApproveEvent(?, ?)', [id, userId]);

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or not in pending status'
      });
    }

    res.json({
      success: true,
      data: result[0][0],
      message: 'Event approved successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Reject event
 */
export async function rejectEvent(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id || null;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const [result] = await db.query('CALL RejectEvent(?, ?, ?)', [id, userId, reason]);

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or not in pending status'
      });
    }

    res.json({
      success: true,
      data: result[0][0],
      message: 'Event rejected successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Submit event for approval
 */
export async function submitEventForApproval(req, res) {
  try {
    const { id } = req.params;
    const [result] = await db.query('CALL SubmitEventForApproval(?)', [id]);

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: result[0][0],
      message: 'Event submitted for approval'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// ==================== FEATURED EVENTS ====================

/**
 * Get featured events
 */
export async function getFeaturedEvents(req, res) {
  try {
    const { limit } = req.query;
    const [data] = await db.query('CALL GetFeaturedEvents(?)', [
      limit ? parseInt(limit) : 10
    ]);

    res.json({
      success: true,
      data: data[0] || [],
      message: 'Featured events retrieved successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Set event as featured
 */
export async function setEventFeatured(req, res) {
  try {
    const { id } = req.params;
    const { is_featured, priority, start_date, end_date } = req.body;

    const [result] = await db.query('CALL SetEventFeatured(?, ?, ?, ?, ?)', [
      id,
      is_featured ? 1 : 0,
      priority || 'medium',
      start_date || null,
      end_date || null
    ]);

    res.json({
      success: true,
      data: result[0][0],
      message: 'Event featured status updated successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Feature an event (simple add to featured list)
 */
export async function featureEvent(req, res) {
  try {
    const { id } = req.params;
    const { display_order } = req.body;

    // Simple feature - just sets is_featured to true
    const [result] = await db.query('CALL SetEventFeatured(?, ?, ?, ?, ?)', [
      id,
      1, // is_featured = true
      'medium',
      null,
      null
    ]);

    // If display_order provided, update it
    if (display_order !== undefined) {
      await db.query(
        `UPDATE event SET featured_order = ? WHERE id = ?`,
        [display_order, id]
      );
    }

    res.json({
      success: true,
      data: result[0][0],
      message: 'Event featured successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Remove event from featured
 */
export async function unfeatureEvent(req, res) {
  try {
    const { id } = req.params;

    const [result] = await db.query('CALL SetEventFeatured(?, ?, ?, ?, ?)', [
      id,
      0, // is_featured = false
      null,
      null,
      null
    ]);

    res.json({
      success: true,
      data: result[0][0],
      message: 'Event removed from featured'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Update featured events order
 */
export async function updateFeaturedOrder(req, res) {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required'
      });
    }

    // Update each event's featured_order
    const updates = items.map(item => 
      db.query(
        `UPDATE event SET featured_order = ? WHERE id = ?`,
        [item.display_order, item.event_id]
      )
    );

    await Promise.all(updates);

    res.json({
      success: true,
      message: 'Featured order updated successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Get featured events by display location
 */
export async function getFeaturedEventsByLocation(req, res) {
  try {
    const { location } = req.params;
    const [data] = await db.query('CALL GetFeaturedEventsForLocation(?)', [location]);

    res.json({
      success: true,
      data: data[0] || [],
      message: 'Featured events retrieved successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// ==================== REVIEWS ====================

/**
 * Get reviews for an event
 */
export async function getEventReviews(req, res) {
  try {
    const { id } = req.params;
    const { status, limit, offset } = req.query;

    const [data] = await db.query('CALL GetEventReviews(?, ?, ?, ?)', [
      id,
      status || 'approved',
      limit ? parseInt(limit) : 20,
      offset ? parseInt(offset) : 0
    ]);

    const reviews = data[0] || [];
    const photos = data[1] || [];

    // Map photos to reviews
    const photoMap = new Map();
    for (const photo of photos) {
      if (!photoMap.has(photo.review_id)) photoMap.set(photo.review_id, []);
      photoMap.get(photo.review_id).push(photo);
    }

    const reviewsWithPhotos = reviews.map(review => ({
      ...review,
      photos: photoMap.get(review.id) || []
    }));

    res.json({
      success: true,
      data: reviewsWithPhotos,
      message: 'Reviews retrieved successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Add review to event
 */
export async function addEventReview(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const reviewId = uuidv4();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { rating, review_text, is_verified_attendee } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating is required (1-5)'
      });
    }

    const [result] = await db.query('CALL InsertEventReview(?, ?, ?, ?, ?, ?)', [
      reviewId, id, userId, rating, review_text || null, is_verified_attendee ? 1 : 0
    ]);

    res.status(201).json({
      success: true,
      data: result[0][0],
      message: 'Review added successfully'
    });
  } catch (error) {
    // Handle duplicate review error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this event'
      });
    }
    return handleDbError(error, res);
  }
}

/**
 * Update review
 */
export async function updateEventReview(req, res) {
  try {
    const { reviewId } = req.params;
    const { rating, review_text, status } = req.body;

    const [result] = await db.query('CALL UpdateEventReview(?, ?, ?, ?)', [
      reviewId,
      rating || null,
      review_text || null,
      status || null
    ]);

    res.json({
      success: true,
      data: result[0][0],
      message: 'Review updated successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Delete review
 */
export async function deleteEventReview(req, res) {
  try {
    const { reviewId } = req.params;
    const [result] = await db.query('CALL DeleteEventReview(?)', [reviewId]);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Get average rating for event
 */
export async function getEventAverageRating(req, res) {
  try {
    const { id } = req.params;
    const [data] = await db.query('CALL GetEventAverageRating(?)', [id]);

    res.json({
      success: true,
      data: data[0][0] || { average_rating: null, total_reviews: 0 },
      message: 'Rating retrieved successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// ==================== BOOKMARKS ====================

/**
 * Add bookmark
 */
export async function addEventBookmark(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const [result] = await db.query('CALL AddEventBookmark(?, ?)', [id, userId]);

    res.json({
      success: true,
      message: 'Event bookmarked successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Remove bookmark
 */
export async function removeEventBookmark(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const [result] = await db.query('CALL RemoveEventBookmark(?, ?)', [id, userId]);

    res.json({
      success: true,
      message: 'Bookmark removed successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Get user's bookmarked events
 */
export async function getUserBookmarkedEvents(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const [data] = await db.query('CALL GetUserBookmarkedEvents(?)', [userId]);

    res.json({
      success: true,
      data: data[0] || [],
      message: 'Bookmarked events retrieved successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Check if event is bookmarked
 */
export async function isEventBookmarked(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.json({
        success: true,
        data: { is_bookmarked: false },
        message: 'Not authenticated'
      });
    }

    const [data] = await db.query('CALL IsEventBookmarked(?, ?)', [id, userId]);

    res.json({
      success: true,
      data: { is_bookmarked: data[0][0]?.is_bookmarked === 1 },
      message: 'Bookmark status retrieved successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// ==================== CALENDAR ====================

/**
 * Get events for calendar view
 */
export async function getEventsForCalendar(req, res) {
  try {
    const { year, month } = req.query;
    const now = new Date();

    const [data] = await db.query('CALL GetEventsForCalendar(?, ?)', [
      year ? parseInt(year) : now.getFullYear(),
      month ? parseInt(month) : now.getMonth() + 1
    ]);

    res.json({
      success: true,
      data: data[0] || [],
      message: 'Calendar events retrieved successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Get event density by month (for calendar dots)
 */
export async function getEventDensityByMonth(req, res) {
  try {
    const { year, month } = req.query;
    const now = new Date();

    const [data] = await db.query('CALL GetEventDensityByMonth(?, ?)', [
      year ? parseInt(year) : now.getFullYear(),
      month ? parseInt(month) : now.getMonth() + 1
    ]);

    res.json({
      success: true,
      data: data[0] || [],
      message: 'Event density retrieved successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// ==================== STATS & ANALYTICS ====================

/**
 * Get event stats
 */
export async function getEventStats(req, res) {
  try {
    const { id } = req.params;
    const [data] = await db.query('CALL GetEventStats(?)', [id]);

    res.json({
      success: true,
      data: data[0][0] || {},
      message: 'Event stats retrieved successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Get popular events
 */
export async function getPopularEvents(req, res) {
  try {
    const { limit } = req.query;
    const [data] = await db.query('CALL GetPopularEvents(?)', [
      limit ? parseInt(limit) : 10
    ]);

    res.json({
      success: true,
      data: data[0] || [],
      message: 'Popular events retrieved successfully'
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}
