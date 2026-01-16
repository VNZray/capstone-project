import db from '../../db.js';
import { handleDbError } from "../../utils/errorHandler.js";

// ===== EVENT CATEGORIES =====

// Get all event categories
export const getAllEventCategories = async (request, response) => {
  try {
    const [rows] = await db.query("CALL GetAllEventCategories()");
    response.json({ success: true, data: rows[0] || [], message: "Event categories retrieved successfully" });
  } catch (error) {
    console.error("Error fetching event categories:", error);
    return handleDbError(error, response);
  }
};

// Get event category by ID
export const getEventCategoryById = async (request, response) => {
  try {
    const { id } = request.params;
    const [rows] = await db.query("CALL GetEventCategoryById(?)", [id]);
    if (!rows[0]?.length) {
      return response.status(404).json({ success: false, message: "Event category not found" });
    }
    response.json({ success: true, data: rows[0][0], message: "Event category retrieved successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Create event category
export const createEventCategory = async (request, response) => {
  try {
    const { name, description, icon } = request.body;
    if (!name) {
      return response.status(400).json({ success: false, message: "Category name is required" });
    }

    const [rows] = await db.query(
      "CALL CreateEventCategory(?, ?, ?)",
      [name, description || null, icon || null]
    );

    response.status(201).json({
      success: true,
      data: rows[0]?.[0],
      message: "Event category created successfully"
    });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Update event category
export const updateEventCategory = async (request, response) => {
  try {
    const { id } = request.params;
    const { name, description, icon, is_active } = request.body;

    const [rows] = await db.query(
      "CALL UpdateEventCategory(?, ?, ?, ?, ?)",
      [id, name || null, description || null, icon || null, is_active !== undefined ? (is_active ? 1 : 0) : null]
    );

    response.json({ success: true, data: rows[0]?.[0], message: "Event category updated successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Delete event category
export const deleteEventCategory = async (request, response) => {
  try {
    const { id } = request.params;
    await db.query("CALL DeleteEventCategory(?)", [id]);
    response.json({ success: true, message: "Event category deleted successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// ===== EVENTS =====

// Get all events
export const getAllEvents = async (request, response) => {
  try {
    const [rows] = await db.query("CALL GetAllEvents()");
    const events = rows[0] || [];

    // Fetch images for each event
    const eventsWithImages = await Promise.all(events.map(async (event) => {
      try {
        const [imageRows] = await db.query("CALL GetEventImages(?)", [event.id]);
        const images = imageRows[0] || [];
        return { ...event, images };
      } catch (imgError) {
        console.warn(`Could not fetch images for event ${event.id}:`, imgError.message);
        return { ...event, images: [] };
      }
    }));

    response.json({ success: true, data: eventsWithImages, message: "Events retrieved successfully" });
  } catch (error) {
    console.error("Error fetching events:", error);
    return handleDbError(error, response);
  }
};

// Get event by ID
export const getEventById = async (request, response) => {
  try {
    const { id } = request.params;
    const [rows] = await db.query("CALL GetEventById(?)", [id]);

    if (!rows[0]?.length) {
      return response.status(404).json({ success: false, message: "Event not found" });
    }

    // Get event images
    const [imageRows] = await db.query("CALL GetEventImages(?)", [id]);
    const images = imageRows[0] || [];

    // Get event categories (with error handling for table not existing)
    let categories = [];
    try {
      const [categoryRows] = await db.query("CALL GetEventCategoryMapping(?)", [id]);
      categories = categoryRows[0] || [];
    } catch (catError) {
      console.warn("Could not fetch event categories:", catError.message);
    }

    // Get event locations (with error handling for table not existing)
    let locations = [];
    try {
      const [locationRows] = await db.query("CALL GetEventLocations(?)", [id]);
      locations = locationRows[0] || [];
    } catch (locError) {
      console.warn("Could not fetch event locations:", locError.message);
    }

    const event = {
      ...rows[0][0],
      images,
      categories: categories.length > 0 ? categories : undefined,
      locations: locations.length > 0 ? locations : undefined,
    };
    response.json({ success: true, data: event, message: "Event retrieved successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Create event
export const createEvent = async (request, response) => {
  try {
    const {
      name,
      description,
      category_id,
      venue_name,
      venue_address,
      barangay_id,
      latitude,
      longitude,
      start_date,
      end_date,
      start_time,
      end_time,
      is_all_day,
      is_recurring,
      recurrence_pattern,
      ticket_price,
      is_free,
      max_capacity,
      contact_phone,
      contact_email,
      website,
      registration_url,
      cover_image_url,
      organizer_name,
      organizer_type,
    } = request.body;

    if (!name || !start_date) {
      return response.status(400).json({
        success: false,
        message: "Event name and start date are required"
      });
    }

    // Determine status based on user role
    const userRole = (request.user?.role || '').toLowerCase();
    const isAdmin = userRole === 'admin';
    const status = isAdmin ? 'published' : 'pending';
    const submittedBy = request.user?.id || null;

    const [rows] = await db.query(
      "CALL CreateEvent(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        name,
        description || null,
        category_id || null,
        venue_name || null,
        venue_address || null,
        barangay_id || null,
        latitude || null,
        longitude || null,
        start_date,
        end_date || null,
        start_time || null,
        end_time || null,
        is_all_day ? 1 : 0,
        is_recurring ? 1 : 0,
        recurrence_pattern || null,
        ticket_price || null,
        is_free !== false ? 1 : 0,
        max_capacity || null,
        contact_phone || null,
        contact_email || null,
        website || null,
        registration_url || null,
        cover_image_url || null,
        organizer_name || null,
        organizer_type || null,
        status,
        submittedBy
      ]
    );

    const result = rows[0]?.[0];

    const message = isAdmin
      ? "Event created and published successfully"
      : "Event submitted for approval";

    response.status(201).json({
      success: true,
      message,
      data: { id: result?.id, status: result?.status || status }
    });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Update event
export const updateEvent = async (request, response) => {
  try {
    const { id } = request.params;
    const {
      name,
      description,
      category_id,
      venue_name,
      venue_address,
      barangay_id,
      latitude,
      longitude,
      start_date,
      end_date,
      start_time,
      end_time,
      is_all_day,
      is_recurring,
      recurrence_pattern,
      ticket_price,
      is_free,
      max_capacity,
      contact_phone,
      contact_email,
      website,
      registration_url,
      cover_image_url,
      organizer_name,
      organizer_type,
      status
    } = request.body;

    const [rows] = await db.query(
      "CALL UpdateEvent(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        name || null,
        description || null,
        category_id || null,
        venue_name || null,
        venue_address || null,
        barangay_id || null,
        latitude || null,
        longitude || null,
        start_date || null,
        end_date || null,
        start_time || null,
        end_time || null,
        is_all_day !== undefined ? (is_all_day ? 1 : 0) : null,
        is_recurring !== undefined ? (is_recurring ? 1 : 0) : null,
        recurrence_pattern || null,
        ticket_price || null,
        is_free !== undefined ? (is_free ? 1 : 0) : null,
        max_capacity || null,
        contact_phone || null,
        contact_email || null,
        website || null,
        registration_url || null,
        cover_image_url || null,
        organizer_name || null,
        organizer_type || null,
        status || null
      ]
    );

    response.json({ success: true, data: rows[0]?.[0], message: "Event updated successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Delete event
export const deleteEvent = async (request, response) => {
  try {
    const { id } = request.params;
    await db.query("CALL DeleteEvent(?)", [id]);
    response.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// ===== FEATURED EVENTS =====

// Get featured events
export const getFeaturedEvents = async (request, response) => {
  try {
    const [rows] = await db.query("CALL GetFeaturedEvents()");
    const events = rows[0] || [];

    // Fetch images for each event
    const eventsWithImages = await Promise.all(events.map(async (event) => {
      try {
        const [imageRows] = await db.query("CALL GetEventImages(?)", [event.id]);
        const images = imageRows[0] || [];
        return { ...event, images };
      } catch (imgError) {
        console.warn(`Could not fetch images for event ${event.id}:`, imgError.message);
        return { ...event, images: [] };
      }
    }));

    response.json({ success: true, data: eventsWithImages, message: "Featured events retrieved successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Get non-featured published events
export const getNonFeaturedEvents = async (request, response) => {
  try {
    const [rows] = await db.query("CALL GetNonFeaturedEvents()");
    response.json({ success: true, data: rows[0] || [], message: "Non-featured events retrieved successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Feature an event
export const featureEvent = async (request, response) => {
  try {
    const { id } = request.params;
    const { featured_order } = request.body;

    await db.query("CALL FeatureEvent(?, ?)", [id, featured_order || 0]);
    response.json({ success: true, message: "Event featured successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Unfeature an event
export const unfeatureEvent = async (request, response) => {
  try {
    const { id } = request.params;
    await db.query("CALL UnfeatureEvent(?)", [id]);
    response.json({ success: true, message: "Event unfeatured successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Update featured order for multiple events
export const updateFeaturedOrder = async (request, response) => {
  let conn;
  try {
    const { events: eventOrder } = request.body;

    if (!Array.isArray(eventOrder)) {
      return response.status(400).json({ success: false, message: "Events array is required" });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    for (const item of eventOrder) {
      await conn.query("CALL UpdateEventFeaturedOrder(?, ?)", [item.id, item.featured_order]);
    }

    await conn.commit();
    response.json({ success: true, message: "Featured order updated successfully" });
  } catch (error) {
    if (conn) await conn.rollback();
    return handleDbError(error, response);
  } finally {
    if (conn) conn.release();
  }
};

// ===== EVENT IMAGES =====

// Get event images
export const getEventImages = async (request, response) => {
  try {
    const { event_id } = request.params;
    const [rows] = await db.query("CALL GetEventImages(?)", [event_id]);
    response.json({ success: true, data: rows[0] || [], message: "Event images retrieved successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Add event image
export const addEventImage = async (request, response) => {
  try {
    const { event_id } = request.params;
    const { file_url, file_format, file_size, is_primary, alt_text, display_order } = request.body;

    if (!file_url) {
      return response.status(400).json({ success: false, message: "File URL is required" });
    }

    const [rows] = await db.query(
      "CALL AddEventImage(?, ?, ?, ?, ?, ?, ?)",
      [event_id, file_url, file_format || null, file_size || null, is_primary ? 1 : 0, alt_text || null, display_order || 0]
    );

    response.status(201).json({ success: true, data: rows[0]?.[0], message: "Event image added successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Delete event image
export const deleteEventImage = async (request, response) => {
  try {
    const { event_id, image_id } = request.params;
    await db.query("CALL DeleteEventImage(?, ?)", [image_id, event_id]);
    response.json({ success: true, message: "Event image deleted successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Set primary event image
export const setPrimaryEventImage = async (request, response) => {
  try {
    const { event_id, image_id } = request.params;
    await db.query("CALL SetPrimaryEventImage(?, ?)", [image_id, event_id]);
    response.json({ success: true, message: "Primary image set successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// ===== PUBLIC EVENTS (for tourists) =====

// Get published events for public view
export const getPublishedEvents = async (request, response) => {
  try {
    const { category_id, upcoming, search } = request.query;

    const [rows] = await db.query(
      "CALL GetPublishedEvents(?, ?, ?)",
      [category_id || null, upcoming === 'true' ? 1 : 0, search || null]
    );

    const events = rows[0] || [];

    // Fetch images for each event
    const eventsWithImages = await Promise.all(events.map(async (event) => {
      try {
        const [imageRows] = await db.query("CALL GetEventImages(?)", [event.id]);
        const images = imageRows[0] || [];
        return { ...event, images };
      } catch (imgError) {
        console.warn(`Could not fetch images for event ${event.id}:`, imgError.message);
        return { ...event, images: [] };
      }
    }));

    response.json({ success: true, data: eventsWithImages, message: "Published events retrieved successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Get upcoming events (next 30 days)
export const getUpcomingEvents = async (request, response) => {
  try {
    const [rows] = await db.query("CALL GetUpcomingEvents()");
    const events = rows[0] || [];

    // Fetch images for each event
    const eventsWithImages = await Promise.all(events.map(async (event) => {
      try {
        const [imageRows] = await db.query("CALL GetEventImages(?)", [event.id]);
        const images = imageRows[0] || [];
        return { ...event, images };
      } catch (imgError) {
        console.warn(`Could not fetch images for event ${event.id}:`, imgError.message);
        return { ...event, images: [] };
      }
    }));

    response.json({ success: true, data: eventsWithImages, message: "Upcoming events retrieved successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// ===== EVENT STATUS MANAGEMENT =====

// Update event status (for approval workflow)
export const updateEventStatus = async (request, response) => {
  try {
    const { id } = request.params;
    const { status, rejection_reason } = request.body;

    const validStatuses = ['draft', 'pending', 'approved', 'rejected', 'published', 'cancelled', 'completed', 'archived'];
    if (!validStatuses.includes(status)) {
      return response.status(400).json({ success: false, message: "Invalid status" });
    }

    const approvedBy = ['approved', 'published'].includes(status) ? request.user?.id : null;

    const [rows] = await db.query(
      "CALL UpdateEventStatus(?, ?, ?, ?)",
      [id, status, rejection_reason || null, approvedBy]
    );

    response.json({ success: true, data: rows[0]?.[0], message: `Event status updated to ${status}` });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// ===== EVENT CATEGORY MAPPINGS (Multiple Categories) =====

// Get categories for an event
export const getEventCategories = async (request, response) => {
  try {
    const { event_id } = request.params;
    const [rows] = await db.query("CALL GetEventCategoryMapping(?)", [event_id]);
    response.json({ success: true, data: rows[0] || [], message: "Event categories retrieved successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Set categories for an event (replaces all existing)
export const setEventCategories = async (request, response) => {
  let conn;
  try {
    const { event_id } = request.params;
    const { category_ids } = request.body;

    if (!Array.isArray(category_ids)) {
      return response.status(400).json({ success: false, message: "category_ids must be an array" });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    // Delete existing mappings
    await conn.query("CALL ClearEventCategoryMappings(?)", [event_id]);

    // Insert new mappings
    for (const catId of category_ids) {
      await conn.query("CALL AddEventCategoryMapping(?, ?)", [event_id, catId]);
    }

    // Update the primary category_id in events table (first one for backward compatibility)
    const primaryCategoryId = category_ids.length > 0 ? category_ids[0] : null;
    await conn.query("CALL UpdateEventPrimaryCategory(?, ?)", [event_id, primaryCategoryId]);

    await conn.commit();
    response.json({ success: true, message: "Event categories updated successfully" });
  } catch (error) {
    if (conn) await conn.rollback();
    return handleDbError(error, response);
  } finally {
    if (conn) conn.release();
  }
};

// Add a category to an event
export const addEventCategoryMapping = async (request, response) => {
  try {
    const { event_id } = request.params;
    const { category_id } = request.body;

    if (!category_id) {
      return response.status(400).json({ success: false, message: "category_id is required" });
    }

    await db.query("CALL AddEventCategoryMapping(?, ?)", [event_id, category_id]);
    response.status(201).json({ success: true, message: "Category added to event" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Remove a category from an event
export const removeEventCategoryMapping = async (request, response) => {
  try {
    const { event_id, category_id } = request.params;
    await db.query("CALL RemoveEventCategoryMapping(?, ?)", [event_id, category_id]);
    response.json({ success: true, message: "Category removed from event" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// ===== EVENT LOCATIONS (Multiple Locations) =====

// Get locations for an event
export const getEventLocations = async (request, response) => {
  try {
    const { event_id } = request.params;
    const [rows] = await db.query("CALL GetEventLocations(?)", [event_id]);
    response.json({ success: true, data: rows[0] || [], message: "Event locations retrieved successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Add a location to an event
export const addEventLocation = async (request, response) => {
  try {
    const { event_id } = request.params;
    const { venue_name, venue_address, barangay_id, latitude, longitude, is_primary, display_order } = request.body;

    if (!venue_name) {
      return response.status(400).json({ success: false, message: "venue_name is required" });
    }

    const [rows] = await db.query(
      "CALL AddEventLocation(?, ?, ?, ?, ?, ?, ?, ?)",
      [event_id, venue_name, venue_address || null, barangay_id || null, latitude || null, longitude || null, is_primary ? 1 : 0, display_order || 0]
    );

    response.status(201).json({ success: true, data: rows[0]?.[0], message: "Location added successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Update an event location
export const updateEventLocation = async (request, response) => {
  try {
    const { event_id, location_id } = request.params;
    const { venue_name, venue_address, barangay_id, latitude, longitude, is_primary, display_order } = request.body;

    await db.query(
      "CALL UpdateEventLocation(?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        location_id,
        event_id,
        venue_name || null,
        venue_address || null,
        barangay_id || null,
        latitude || null,
        longitude || null,
        is_primary !== undefined ? (is_primary ? 1 : 0) : null,
        display_order || null
      ]
    );

    response.json({ success: true, message: "Location updated successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Delete an event location
export const deleteEventLocation = async (request, response) => {
  try {
    const { event_id, location_id } = request.params;
    await db.query("CALL DeleteEventLocation(?, ?)", [location_id, event_id]);
    response.json({ success: true, message: "Location deleted successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Set primary location
export const setPrimaryEventLocation = async (request, response) => {
  try {
    const { event_id, location_id } = request.params;
    await db.query("CALL SetPrimaryEventLocation(?, ?)", [location_id, event_id]);
    response.json({ success: true, message: "Primary location set successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};
