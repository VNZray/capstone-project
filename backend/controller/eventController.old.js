import db from '../../db.js';
import { handleDbError } from "../../utils/errorHandler.js";

// ===== EVENT CATEGORIES =====

// Get all event categories
export const getAllEventCategories = async (request, response) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, description, icon, is_active, created_at, updated_at FROM event_categories WHERE is_active = 1 ORDER BY name"
    );
    response.json({ success: true, data: rows, message: "Event categories retrieved successfully" });
  } catch (error) {
    console.error("Error fetching event categories:", error);
    return handleDbError(error, response);
  }
};

// Get event category by ID
export const getEventCategoryById = async (request, response) => {
  try {
    const { id } = request.params;
    const [rows] = await db.query(
      "SELECT id, name, description, icon, is_active, created_at, updated_at FROM event_categories WHERE id = ?",
      [id]
    );
    if (!rows.length) {
      return response.status(404).json({ success: false, message: "Event category not found" });
    }
    response.json({ success: true, data: rows[0], message: "Event category retrieved successfully" });
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

    const [result] = await db.query(
      "INSERT INTO event_categories (name, description, icon) VALUES (?, ?, ?)",
      [name, description || null, icon || null]
    );

    // Get the inserted category
    const [rows] = await db.query("SELECT * FROM event_categories WHERE id = LAST_INSERT_ID()");
    
    response.status(201).json({ 
      success: true, 
      data: rows[0], 
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

    const updates = [];
    const values = [];

    if (name !== undefined) { updates.push("name = ?"); values.push(name); }
    if (description !== undefined) { updates.push("description = ?"); values.push(description); }
    if (icon !== undefined) { updates.push("icon = ?"); values.push(icon); }
    if (is_active !== undefined) { updates.push("is_active = ?"); values.push(is_active ? 1 : 0); }

    if (updates.length === 0) {
      return response.status(400).json({ success: false, message: "No fields to update" });
    }

    values.push(id);
    await db.query(`UPDATE event_categories SET ${updates.join(", ")} WHERE id = ?`, values);

    const [rows] = await db.query("SELECT * FROM event_categories WHERE id = ?", [id]);
    response.json({ success: true, data: rows[0], message: "Event category updated successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Delete event category
export const deleteEventCategory = async (request, response) => {
  try {
    const { id } = request.params;
    await db.query("DELETE FROM event_categories WHERE id = ?", [id]);
    response.json({ success: true, message: "Event category deleted successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// ===== EVENTS =====

// Get all events
export const getAllEvents = async (request, response) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        e.*,
        ec.name as category_name,
        ec.icon as category_icon,
        b.barangay as barangay_name,
        m.municipality as municipality_name,
        p.province as province_name
      FROM events e
      LEFT JOIN event_categories ec ON e.category_id = ec.id
      LEFT JOIN barangay b ON e.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      ORDER BY e.start_date DESC, e.created_at DESC
    `);
    response.json({ success: true, data: rows, message: "Events retrieved successfully" });
  } catch (error) {
    console.error("Error fetching events:", error);
    return handleDbError(error, response);
  }
};

// Get event by ID
export const getEventById = async (request, response) => {
  try {
    const { id } = request.params;
    const [rows] = await db.query(`
      SELECT 
        e.*,
        ec.name as category_name,
        ec.icon as category_icon,
        b.barangay as barangay_name,
        m.municipality as municipality_name,
        p.province as province_name
      FROM events e
      LEFT JOIN event_categories ec ON e.category_id = ec.id
      LEFT JOIN barangay b ON e.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      WHERE e.id = ?
    `, [id]);

    if (!rows.length) {
      return response.status(404).json({ success: false, message: "Event not found" });
    }

    // Get event images
    const [images] = await db.query(
      "SELECT * FROM event_images WHERE event_id = ? ORDER BY display_order",
      [id]
    );

    // Get event categories (with error handling for table not existing)
    let categories = [];
    try {
      const [categoryRows] = await db.query(`
        SELECT ec.id, ec.name, ec.icon, ecm.is_primary
        FROM event_category_mapping ecm
        JOIN event_categories ec ON ecm.category_id = ec.id
        WHERE ecm.event_id = ?
        ORDER BY ecm.is_primary DESC
      `, [id]);
      categories = categoryRows;
    } catch (catError) {
      console.warn("Could not fetch event categories:", catError.message);
    }

    // Get event locations (with error handling for table not existing)
    let locations = [];
    try {
      const [locationRows] = await db.query(`
        SELECT 
          el.*,
          b.barangay as barangay_name,
          m.municipality as municipality_name,
          p.province as province_name
        FROM event_locations el
        LEFT JOIN barangay b ON el.barangay_id = b.id
        LEFT JOIN municipality m ON b.municipality_id = m.id
        LEFT JOIN province p ON m.province_id = p.id
        WHERE el.event_id = ?
        ORDER BY el.is_primary DESC, el.display_order
      `, [id]);
      locations = locationRows;
    } catch (locError) {
      console.warn("Could not fetch event locations:", locError.message);
    }

    const event = { 
      ...rows[0], 
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
  let conn;
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

    conn = await db.getConnection();
    await conn.beginTransaction();

    const [result] = await conn.query(`
      INSERT INTO events (
        name, description, category_id, venue_name, venue_address, barangay_id,
        latitude, longitude, start_date, end_date, start_time, end_time,
        is_all_day, is_recurring, recurrence_pattern, ticket_price, is_free,
        max_capacity, contact_phone, contact_email, website, registration_url,
        cover_image_url, organizer_name, organizer_type, status, submitted_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
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
    ]);

    // Get the created event ID
    const [idResult] = await conn.query("SELECT LAST_INSERT_ID() as id");
    const eventId = idResult[0]?.id;

    // For UUID-based IDs, we need to fetch differently
    const [newEvent] = await conn.query("SELECT id FROM events WHERE name = ? AND start_date = ? ORDER BY created_at DESC LIMIT 1", [name, start_date]);
    const finalEventId = newEvent[0]?.id || eventId;

    await conn.commit();

    const message = isAdmin
      ? "Event created and published successfully"
      : "Event submitted for approval";

    response.status(201).json({
      success: true,
      message,
      data: { id: finalEventId, status }
    });
  } catch (error) {
    if (conn) await conn.rollback();
    return handleDbError(error, response);
  } finally {
    if (conn) conn.release();
  }
};

// Update event
export const updateEvent = async (request, response) => {
  try {
    const { id } = request.params;
    const updates = request.body;

    // Build dynamic update query
    const allowedFields = [
      'name', 'description', 'category_id', 'venue_name', 'venue_address',
      'barangay_id', 'latitude', 'longitude', 'start_date', 'end_date',
      'start_time', 'end_time', 'is_all_day', 'is_recurring', 'recurrence_pattern',
      'ticket_price', 'is_free', 'max_capacity', 'contact_phone', 'contact_email',
      'website', 'registration_url', 'cover_image_url', 'organizer_name',
      'organizer_type', 'status'
    ];

    const setClauses = [];
    const values = [];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        setClauses.push(`${field} = ?`);
        // Handle boolean fields
        if (['is_all_day', 'is_recurring', 'is_free'].includes(field)) {
          values.push(updates[field] ? 1 : 0);
        } else {
          values.push(updates[field]);
        }
      }
    }

    if (setClauses.length === 0) {
      return response.status(400).json({ success: false, message: "No fields to update" });
    }

    values.push(id);
    await db.query(`UPDATE events SET ${setClauses.join(", ")} WHERE id = ?`, values);

    // Return updated event
    const [rows] = await db.query(`
      SELECT 
        e.*,
        ec.name as category_name,
        ec.icon as category_icon
      FROM events e
      LEFT JOIN event_categories ec ON e.category_id = ec.id
      WHERE e.id = ?
    `, [id]);

    response.json({ success: true, data: rows[0], message: "Event updated successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Delete event
export const deleteEvent = async (request, response) => {
  try {
    const { id } = request.params;
    
    // Delete associated images first (cascade should handle this, but being explicit)
    await db.query("DELETE FROM event_images WHERE event_id = ?", [id]);
    await db.query("DELETE FROM events WHERE id = ?", [id]);
    
    response.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// ===== FEATURED EVENTS =====

// Get featured events
export const getFeaturedEvents = async (request, response) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        e.*,
        ec.name as category_name,
        ec.icon as category_icon
      FROM events e
      LEFT JOIN event_categories ec ON e.category_id = ec.id
      WHERE e.is_featured = 1 AND e.status = 'published'
      ORDER BY e.featured_order ASC, e.start_date ASC
    `);
    response.json({ success: true, data: rows, message: "Featured events retrieved successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Get non-featured published events
export const getNonFeaturedEvents = async (request, response) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        e.*,
        ec.name as category_name,
        ec.icon as category_icon
      FROM events e
      LEFT JOIN event_categories ec ON e.category_id = ec.id
      WHERE e.is_featured = 0 AND e.status = 'published'
      ORDER BY e.start_date ASC
    `);
    response.json({ success: true, data: rows, message: "Non-featured events retrieved successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Feature an event
export const featureEvent = async (request, response) => {
  try {
    const { id } = request.params;
    const { featured_order } = request.body;

    await db.query(
      "UPDATE events SET is_featured = 1, featured_order = ? WHERE id = ?",
      [featured_order || 0, id]
    );
    
    response.json({ success: true, message: "Event featured successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Unfeature an event
export const unfeatureEvent = async (request, response) => {
  try {
    const { id } = request.params;
    
    await db.query(
      "UPDATE events SET is_featured = 0, featured_order = NULL WHERE id = ?",
      [id]
    );
    
    response.json({ success: true, message: "Event unfeatured successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Update featured order for multiple events
export const updateFeaturedOrder = async (request, response) => {
  let conn;
  try {
    const { events: eventOrder } = request.body; // Array of { id, featured_order }

    if (!Array.isArray(eventOrder)) {
      return response.status(400).json({ success: false, message: "Events array is required" });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    for (const item of eventOrder) {
      await conn.query(
        "UPDATE events SET featured_order = ? WHERE id = ?",
        [item.featured_order, item.id]
      );
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
    const [rows] = await db.query(
      "SELECT * FROM event_images WHERE event_id = ? ORDER BY display_order",
      [event_id]
    );
    response.json({ success: true, data: rows, message: "Event images retrieved successfully" });
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

    // If setting as primary, unset other primary images
    if (is_primary) {
      await db.query("UPDATE event_images SET is_primary = 0 WHERE event_id = ?", [event_id]);
    }

    await db.query(`
      INSERT INTO event_images (event_id, file_url, file_format, file_size, is_primary, alt_text, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [event_id, file_url, file_format || null, file_size || null, is_primary ? 1 : 0, alt_text || null, display_order || 0]);

    response.status(201).json({ success: true, message: "Event image added successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Delete event image
export const deleteEventImage = async (request, response) => {
  try {
    const { event_id, image_id } = request.params;
    await db.query("DELETE FROM event_images WHERE id = ? AND event_id = ?", [image_id, event_id]);
    response.json({ success: true, message: "Event image deleted successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Set primary event image
export const setPrimaryEventImage = async (request, response) => {
  try {
    const { event_id, image_id } = request.params;
    
    // Unset all primary
    await db.query("UPDATE event_images SET is_primary = 0 WHERE event_id = ?", [event_id]);
    // Set new primary
    await db.query("UPDATE event_images SET is_primary = 1 WHERE id = ? AND event_id = ?", [image_id, event_id]);
    
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
    
    let query = `
      SELECT 
        e.*,
        ec.name as category_name,
        ec.icon as category_icon,
        b.barangay as barangay_name,
        m.municipality as municipality_name
      FROM events e
      LEFT JOIN event_categories ec ON e.category_id = ec.id
      LEFT JOIN barangay b ON e.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      WHERE e.status = 'published'
    `;
    const params = [];

    if (category_id) {
      query += " AND e.category_id = ?";
      params.push(category_id);
    }

    if (upcoming === 'true') {
      query += " AND e.start_date >= CURDATE()";
    }

    if (search) {
      query += " AND (e.name LIKE ? OR e.description LIKE ? OR e.venue_name LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += " ORDER BY e.start_date ASC";

    const [rows] = await db.query(query, params);
    response.json({ success: true, data: rows, message: "Published events retrieved successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Get upcoming events (next 30 days)
export const getUpcomingEvents = async (request, response) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        e.*,
        ec.name as category_name,
        ec.icon as category_icon
      FROM events e
      LEFT JOIN event_categories ec ON e.category_id = ec.id
      WHERE e.status = 'published' 
        AND e.start_date >= CURDATE() 
        AND e.start_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      ORDER BY e.start_date ASC
      LIMIT 10
    `);
    response.json({ success: true, data: rows, message: "Upcoming events retrieved successfully" });
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

    const updates = { status };
    if (status === 'approved' || status === 'published') {
      updates.approved_by = request.user?.id;
      updates.approved_at = new Date();
    }
    if (status === 'rejected' && rejection_reason) {
      updates.rejection_reason = rejection_reason;
    }

    const setClauses = Object.keys(updates).map(k => `${k} = ?`);
    const values = [...Object.values(updates), id];

    await db.query(`UPDATE events SET ${setClauses.join(", ")} WHERE id = ?`, values);

    response.json({ success: true, message: `Event status updated to ${status}` });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// ===== EVENT CATEGORY MAPPINGS (Multiple Categories) =====

// Get categories for an event
export const getEventCategories = async (request, response) => {
  try {
    const { event_id } = request.params;
    const [rows] = await db.query(`
      SELECT ec.* 
      FROM event_categories ec
      INNER JOIN event_category_mapping ecm ON ec.id = ecm.category_id
      WHERE ecm.event_id = ?
      ORDER BY ec.name
    `, [event_id]);
    response.json({ success: true, data: rows, message: "Event categories retrieved successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Set categories for an event (replaces all existing)
export const setEventCategories = async (request, response) => {
  let conn;
  try {
    const { event_id } = request.params;
    const { category_ids } = request.body; // Array of category IDs

    if (!Array.isArray(category_ids)) {
      return response.status(400).json({ success: false, message: "category_ids must be an array" });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    // Delete existing mappings
    await conn.query("DELETE FROM event_category_mapping WHERE event_id = ?", [event_id]);

    // Insert new mappings
    if (category_ids.length > 0) {
      const values = category_ids.map(catId => [event_id, catId]);
      await conn.query(
        "INSERT INTO event_category_mapping (event_id, category_id) VALUES ?",
        [values]
      );
    }

    // Also update the primary category_id in events table (first one for backward compatibility)
    const primaryCategoryId = category_ids.length > 0 ? category_ids[0] : null;
    await conn.query("UPDATE events SET category_id = ? WHERE id = ?", [primaryCategoryId, event_id]);

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

    await db.query(
      "INSERT IGNORE INTO event_category_mapping (event_id, category_id) VALUES (?, ?)",
      [event_id, category_id]
    );

    response.status(201).json({ success: true, message: "Category added to event" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Remove a category from an event
export const removeEventCategoryMapping = async (request, response) => {
  try {
    const { event_id, category_id } = request.params;
    await db.query(
      "DELETE FROM event_category_mapping WHERE event_id = ? AND category_id = ?",
      [event_id, category_id]
    );
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
    const [rows] = await db.query(`
      SELECT 
        el.*,
        b.barangay as barangay_name,
        m.municipality as municipality_name,
        p.province as province_name
      FROM event_locations el
      LEFT JOIN barangay b ON el.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      WHERE el.event_id = ?
      ORDER BY el.display_order, el.is_primary DESC
    `, [event_id]);
    response.json({ success: true, data: rows, message: "Event locations retrieved successfully" });
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

    // If setting as primary, unset other primary locations
    if (is_primary) {
      await db.query("UPDATE event_locations SET is_primary = 0 WHERE event_id = ?", [event_id]);
    }

    const [result] = await db.query(`
      INSERT INTO event_locations (event_id, venue_name, venue_address, barangay_id, latitude, longitude, is_primary, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [event_id, venue_name, venue_address || null, barangay_id || null, latitude || null, longitude || null, is_primary ? 1 : 0, display_order || 0]);

    // Get the inserted location
    const [rows] = await db.query(`
      SELECT 
        el.*,
        b.barangay as barangay_name,
        m.municipality as municipality_name,
        p.province as province_name
      FROM event_locations el
      LEFT JOIN barangay b ON el.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      WHERE el.event_id = ?
      ORDER BY el.created_at DESC
      LIMIT 1
    `, [event_id]);

    response.status(201).json({ success: true, data: rows[0], message: "Location added successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Update an event location
export const updateEventLocation = async (request, response) => {
  try {
    const { event_id, location_id } = request.params;
    const { venue_name, venue_address, barangay_id, latitude, longitude, is_primary, display_order } = request.body;

    // If setting as primary, unset other primary locations
    if (is_primary) {
      await db.query("UPDATE event_locations SET is_primary = 0 WHERE event_id = ?", [event_id]);
    }

    const updates = [];
    const values = [];

    if (venue_name !== undefined) { updates.push("venue_name = ?"); values.push(venue_name); }
    if (venue_address !== undefined) { updates.push("venue_address = ?"); values.push(venue_address); }
    if (barangay_id !== undefined) { updates.push("barangay_id = ?"); values.push(barangay_id); }
    if (latitude !== undefined) { updates.push("latitude = ?"); values.push(latitude); }
    if (longitude !== undefined) { updates.push("longitude = ?"); values.push(longitude); }
    if (is_primary !== undefined) { updates.push("is_primary = ?"); values.push(is_primary ? 1 : 0); }
    if (display_order !== undefined) { updates.push("display_order = ?"); values.push(display_order); }

    if (updates.length === 0) {
      return response.status(400).json({ success: false, message: "No fields to update" });
    }

    values.push(location_id, event_id);
    await db.query(`UPDATE event_locations SET ${updates.join(", ")} WHERE id = ? AND event_id = ?`, values);

    response.json({ success: true, message: "Location updated successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Delete an event location
export const deleteEventLocation = async (request, response) => {
  try {
    const { event_id, location_id } = request.params;
    await db.query("DELETE FROM event_locations WHERE id = ? AND event_id = ?", [location_id, event_id]);
    response.json({ success: true, message: "Location deleted successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Set primary location
export const setPrimaryEventLocation = async (request, response) => {
  try {
    const { event_id, location_id } = request.params;
    
    // Unset all primary
    await db.query("UPDATE event_locations SET is_primary = 0 WHERE event_id = ?", [event_id]);
    // Set new primary
    await db.query("UPDATE event_locations SET is_primary = 1 WHERE id = ? AND event_id = ?", [location_id, event_id]);
    
    response.json({ success: true, message: "Primary location set successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};
