/**
 * Event stored procedures migration
 * Creates all stored procedures for event management
 */
exports.up = async function(knex) {
  // ===== EVENT CATEGORIES =====

  // Get all event categories
  await knex.raw(`
    CREATE PROCEDURE GetAllEventCategories()
    BEGIN
      SELECT id, name, description, icon, is_active, created_at, updated_at
      FROM event_categories
      WHERE is_active = 1
      ORDER BY name;
    END
  `);
  console.log("Created GetAllEventCategories procedure");

  // Get event category by ID
  await knex.raw(`
    CREATE PROCEDURE GetEventCategoryById(IN p_id CHAR(36))
    BEGIN
      SELECT id, name, description, icon, is_active, created_at, updated_at
      FROM event_categories
      WHERE id = p_id;
    END
  `);
  console.log("Created GetEventCategoryById procedure");

  // Create event category
  await knex.raw(`
    CREATE PROCEDURE CreateEventCategory(
      IN p_name VARCHAR(100),
      IN p_description TEXT,
      IN p_icon VARCHAR(100)
    )
    BEGIN
      INSERT INTO event_categories (name, description, icon)
      VALUES (p_name, p_description, p_icon);

      SELECT * FROM event_categories WHERE id = LAST_INSERT_ID();
    END
  `);
  console.log("Created CreateEventCategory procedure");

  // Update event category
  await knex.raw(`
    CREATE PROCEDURE UpdateEventCategory(
      IN p_id CHAR(36),
      IN p_name VARCHAR(100),
      IN p_description TEXT,
      IN p_icon VARCHAR(100),
      IN p_is_active TINYINT(1)
    )
    BEGIN
      UPDATE event_categories SET
        name = IFNULL(p_name, name),
        description = IFNULL(p_description, description),
        icon = IFNULL(p_icon, icon),
        is_active = IFNULL(p_is_active, is_active)
      WHERE id = p_id;

      SELECT * FROM event_categories WHERE id = p_id;
    END
  `);
  console.log("Created UpdateEventCategory procedure");

  // Delete event category
  await knex.raw(`
    CREATE PROCEDURE DeleteEventCategory(IN p_id CHAR(36))
    BEGIN
      DELETE FROM event_categories WHERE id = p_id;
    END
  `);
  console.log("Created DeleteEventCategory procedure");

  // ===== EVENTS =====

  // Get all events
  await knex.raw(`
    CREATE PROCEDURE GetAllEvents()
    BEGIN
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
      ORDER BY e.start_date DESC, e.created_at DESC;
    END
  `);
  console.log("Created GetAllEvents procedure");

  // Get event by ID
  await knex.raw(`
    CREATE PROCEDURE GetEventById(IN p_id CHAR(36))
    BEGIN
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
      WHERE e.id = p_id;
    END
  `);
  console.log("Created GetEventById procedure");

  // Get event images
  await knex.raw(`
    CREATE PROCEDURE GetEventImages(IN p_event_id CHAR(36))
    BEGIN
      SELECT * FROM event_images
      WHERE event_id = p_event_id
      ORDER BY display_order;
    END
  `);
  console.log("Created GetEventImages procedure");

  // Get event categories for an event (mapping)
  await knex.raw(`
    CREATE PROCEDURE GetEventCategoryMapping(IN p_event_id CHAR(36))
    BEGIN
      SELECT ec.id, ec.name, ec.icon, ecm.is_primary
      FROM event_category_mapping ecm
      JOIN event_categories ec ON ecm.category_id = ec.id
      WHERE ecm.event_id = p_event_id
      ORDER BY ecm.is_primary DESC;
    END
  `);
  console.log("Created GetEventCategoryMapping procedure");

  // Get event locations
  await knex.raw(`
    CREATE PROCEDURE GetEventLocations(IN p_event_id CHAR(36))
    BEGIN
      SELECT
        el.*,
        b.barangay as barangay_name,
        m.municipality as municipality_name,
        p.province as province_name
      FROM event_locations el
      LEFT JOIN barangay b ON el.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      WHERE el.event_id = p_event_id
      ORDER BY el.is_primary DESC, el.display_order;
    END
  `);
  console.log("Created GetEventLocations procedure");

  // Create event
  await knex.raw(`
    CREATE PROCEDURE CreateEvent(
      IN p_name VARCHAR(255),
      IN p_description TEXT,
      IN p_category_id CHAR(36),
      IN p_venue_name VARCHAR(255),
      IN p_venue_address TEXT,
      IN p_barangay_id INT,
      IN p_latitude DECIMAL(10, 8),
      IN p_longitude DECIMAL(11, 8),
      IN p_start_date DATE,
      IN p_end_date DATE,
      IN p_start_time TIME,
      IN p_end_time TIME,
      IN p_is_all_day TINYINT(1),
      IN p_is_recurring TINYINT(1),
      IN p_recurrence_pattern VARCHAR(50),
      IN p_ticket_price DECIMAL(10, 2),
      IN p_is_free TINYINT(1),
      IN p_max_capacity INT,
      IN p_contact_phone VARCHAR(20),
      IN p_contact_email VARCHAR(100),
      IN p_website VARCHAR(255),
      IN p_registration_url VARCHAR(255),
      IN p_cover_image_url TEXT,
      IN p_organizer_name VARCHAR(255),
      IN p_organizer_type VARCHAR(50),
      IN p_status VARCHAR(20),
      IN p_submitted_by CHAR(36)
    )
    BEGIN
      DECLARE v_event_id CHAR(36);
      SET v_event_id = UUID();

      INSERT INTO events (
        id, name, description, category_id, venue_name, venue_address, barangay_id,
        latitude, longitude, start_date, end_date, start_time, end_time,
        is_all_day, is_recurring, recurrence_pattern, ticket_price, is_free,
        max_capacity, contact_phone, contact_email, website, registration_url,
        cover_image_url, organizer_name, organizer_type, status, submitted_by
      ) VALUES (
        v_event_id, p_name, p_description, p_category_id, p_venue_name, p_venue_address, p_barangay_id,
        p_latitude, p_longitude, p_start_date, p_end_date, p_start_time, p_end_time,
        p_is_all_day, p_is_recurring, p_recurrence_pattern, p_ticket_price, p_is_free,
        p_max_capacity, p_contact_phone, p_contact_email, p_website, p_registration_url,
        p_cover_image_url, p_organizer_name, p_organizer_type, p_status, p_submitted_by
      );

      SELECT id, status FROM events WHERE id = v_event_id;
    END
  `);
  console.log("Created CreateEvent procedure");

  // Update event
  await knex.raw(`
    CREATE PROCEDURE UpdateEvent(
      IN p_id CHAR(36),
      IN p_name VARCHAR(255),
      IN p_description TEXT,
      IN p_category_id CHAR(36),
      IN p_venue_name VARCHAR(255),
      IN p_venue_address TEXT,
      IN p_barangay_id INT,
      IN p_latitude DECIMAL(10, 8),
      IN p_longitude DECIMAL(11, 8),
      IN p_start_date DATE,
      IN p_end_date DATE,
      IN p_start_time TIME,
      IN p_end_time TIME,
      IN p_is_all_day TINYINT(1),
      IN p_is_recurring TINYINT(1),
      IN p_recurrence_pattern VARCHAR(50),
      IN p_ticket_price DECIMAL(10, 2),
      IN p_is_free TINYINT(1),
      IN p_max_capacity INT,
      IN p_contact_phone VARCHAR(20),
      IN p_contact_email VARCHAR(100),
      IN p_website VARCHAR(255),
      IN p_registration_url VARCHAR(255),
      IN p_cover_image_url TEXT,
      IN p_organizer_name VARCHAR(255),
      IN p_organizer_type VARCHAR(50),
      IN p_status VARCHAR(20)
    )
    BEGIN
      UPDATE events SET
        name = IFNULL(p_name, name),
        description = IFNULL(p_description, description),
        category_id = IFNULL(p_category_id, category_id),
        venue_name = IFNULL(p_venue_name, venue_name),
        venue_address = IFNULL(p_venue_address, venue_address),
        barangay_id = IFNULL(p_barangay_id, barangay_id),
        latitude = IFNULL(p_latitude, latitude),
        longitude = IFNULL(p_longitude, longitude),
        start_date = IFNULL(p_start_date, start_date),
        end_date = IFNULL(p_end_date, end_date),
        start_time = IFNULL(p_start_time, start_time),
        end_time = IFNULL(p_end_time, end_time),
        is_all_day = IFNULL(p_is_all_day, is_all_day),
        is_recurring = IFNULL(p_is_recurring, is_recurring),
        recurrence_pattern = IFNULL(p_recurrence_pattern, recurrence_pattern),
        ticket_price = IFNULL(p_ticket_price, ticket_price),
        is_free = IFNULL(p_is_free, is_free),
        max_capacity = IFNULL(p_max_capacity, max_capacity),
        contact_phone = IFNULL(p_contact_phone, contact_phone),
        contact_email = IFNULL(p_contact_email, contact_email),
        website = IFNULL(p_website, website),
        registration_url = IFNULL(p_registration_url, registration_url),
        cover_image_url = IFNULL(p_cover_image_url, cover_image_url),
        organizer_name = IFNULL(p_organizer_name, organizer_name),
        organizer_type = IFNULL(p_organizer_type, organizer_type),
        status = IFNULL(p_status, status)
      WHERE id = p_id;

      SELECT
        e.*,
        ec.name as category_name,
        ec.icon as category_icon
      FROM events e
      LEFT JOIN event_categories ec ON e.category_id = ec.id
      WHERE e.id = p_id;
    END
  `);
  console.log("Created UpdateEvent procedure");

  // Delete event
  await knex.raw(`
    CREATE PROCEDURE DeleteEvent(IN p_id CHAR(36))
    BEGIN
      DELETE FROM event_images WHERE event_id = p_id;
      DELETE FROM event_category_mapping WHERE event_id = p_id;
      DELETE FROM event_locations WHERE event_id = p_id;
      DELETE FROM events WHERE id = p_id;
    END
  `);
  console.log("Created DeleteEvent procedure");

  // ===== FEATURED EVENTS =====

  // Get featured events
  await knex.raw(`
    CREATE PROCEDURE GetFeaturedEvents()
    BEGIN
      SELECT
        e.*,
        ec.name as category_name,
        ec.icon as category_icon
      FROM events e
      LEFT JOIN event_categories ec ON e.category_id = ec.id
      WHERE e.is_featured = 1 AND e.status = 'published'
      ORDER BY e.featured_order ASC, e.start_date ASC;
    END
  `);
  console.log("Created GetFeaturedEvents procedure");

  // Get non-featured events
  await knex.raw(`
    CREATE PROCEDURE GetNonFeaturedEvents()
    BEGIN
      SELECT
        e.*,
        ec.name as category_name,
        ec.icon as category_icon
      FROM events e
      LEFT JOIN event_categories ec ON e.category_id = ec.id
      WHERE e.is_featured = 0 AND e.status = 'published'
      ORDER BY e.start_date ASC;
    END
  `);
  console.log("Created GetNonFeaturedEvents procedure");

  // Feature event
  await knex.raw(`
    CREATE PROCEDURE FeatureEvent(
      IN p_id CHAR(36),
      IN p_featured_order INT
    )
    BEGIN
      UPDATE events
      SET is_featured = 1, featured_order = p_featured_order
      WHERE id = p_id;
    END
  `);
  console.log("Created FeatureEvent procedure");

  // Unfeature event
  await knex.raw(`
    CREATE PROCEDURE UnfeatureEvent(IN p_id CHAR(36))
    BEGIN
      UPDATE events
      SET is_featured = 0, featured_order = NULL
      WHERE id = p_id;
    END
  `);
  console.log("Created UnfeatureEvent procedure");

  // Update featured order
  await knex.raw(`
    CREATE PROCEDURE UpdateEventFeaturedOrder(
      IN p_id CHAR(36),
      IN p_featured_order INT
    )
    BEGIN
      UPDATE events
      SET featured_order = p_featured_order
      WHERE id = p_id;
    END
  `);
  console.log("Created UpdateEventFeaturedOrder procedure");

  // ===== EVENT IMAGES =====

  // Add event image
  await knex.raw(`
    CREATE PROCEDURE AddEventImage(
      IN p_event_id CHAR(36),
      IN p_file_url TEXT,
      IN p_file_format VARCHAR(20),
      IN p_file_size INT,
      IN p_is_primary TINYINT(1),
      IN p_alt_text VARCHAR(255),
      IN p_display_order INT
    )
    BEGIN
      IF p_is_primary = 1 THEN
        UPDATE event_images SET is_primary = 0 WHERE event_id = p_event_id;
      END IF;

      INSERT INTO event_images (event_id, file_url, file_format, file_size, is_primary, alt_text, display_order)
      VALUES (p_event_id, p_file_url, p_file_format, p_file_size, p_is_primary, p_alt_text, p_display_order);

      SELECT * FROM event_images WHERE id = LAST_INSERT_ID();
    END
  `);
  console.log("Created AddEventImage procedure");

  // Delete event image
  await knex.raw(`
    CREATE PROCEDURE DeleteEventImage(
      IN p_image_id CHAR(36),
      IN p_event_id CHAR(36)
    )
    BEGIN
      DELETE FROM event_images WHERE id = p_image_id AND event_id = p_event_id;
    END
  `);
  console.log("Created DeleteEventImage procedure");

  // Set primary event image
  await knex.raw(`
    CREATE PROCEDURE SetPrimaryEventImage(
      IN p_image_id CHAR(36),
      IN p_event_id CHAR(36)
    )
    BEGIN
      UPDATE event_images SET is_primary = 0 WHERE event_id = p_event_id;
      UPDATE event_images SET is_primary = 1 WHERE id = p_image_id AND event_id = p_event_id;
    END
  `);
  console.log("Created SetPrimaryEventImage procedure");

  // ===== PUBLIC EVENTS =====

  // Get published events (with filters)
  await knex.raw(`
    CREATE PROCEDURE GetPublishedEvents(
      IN p_category_id CHAR(36),
      IN p_upcoming TINYINT(1),
      IN p_search VARCHAR(255)
    )
    BEGIN
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
        AND (p_category_id IS NULL OR e.category_id = p_category_id)
        AND (p_upcoming = 0 OR e.start_date >= CURDATE())
        AND (p_search IS NULL OR p_search = '' OR
             e.name LIKE CONCAT('%', p_search, '%') OR
             e.description LIKE CONCAT('%', p_search, '%') OR
             e.venue_name LIKE CONCAT('%', p_search, '%'))
      ORDER BY e.start_date ASC;
    END
  `);
  console.log("Created GetPublishedEvents procedure");

  // Get upcoming events (next 30 days)
  await knex.raw(`
    CREATE PROCEDURE GetUpcomingEvents()
    BEGIN
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
      LIMIT 10;
    END
  `);
  console.log("Created GetUpcomingEvents procedure");

  // ===== EVENT STATUS =====

  // Update event status
  await knex.raw(`
    CREATE PROCEDURE UpdateEventStatus(
      IN p_id CHAR(36),
      IN p_status VARCHAR(20),
      IN p_rejection_reason TEXT,
      IN p_approved_by CHAR(36)
    )
    BEGIN
      UPDATE events SET
        status = p_status,
        rejection_reason = CASE WHEN p_status = 'rejected' THEN p_rejection_reason ELSE rejection_reason END,
        approved_by = CASE WHEN p_status IN ('approved', 'published') THEN p_approved_by ELSE approved_by END,
        approved_at = CASE WHEN p_status IN ('approved', 'published') THEN NOW() ELSE approved_at END
      WHERE id = p_id;

      SELECT * FROM events WHERE id = p_id;
    END
  `);
  console.log("Created UpdateEventStatus procedure");

  // ===== EVENT CATEGORY MAPPINGS =====

  // Clear event category mappings
  await knex.raw(`
    CREATE PROCEDURE ClearEventCategoryMappings(IN p_event_id CHAR(36))
    BEGIN
      DELETE FROM event_category_mapping WHERE event_id = p_event_id;
    END
  `);
  console.log("Created ClearEventCategoryMappings procedure");

  // Add event category mapping
  await knex.raw(`
    CREATE PROCEDURE AddEventCategoryMapping(
      IN p_event_id CHAR(36),
      IN p_category_id CHAR(36)
    )
    BEGIN
      INSERT IGNORE INTO event_category_mapping (event_id, category_id)
      VALUES (p_event_id, p_category_id);
    END
  `);
  console.log("Created AddEventCategoryMapping procedure");

  // Remove event category mapping
  await knex.raw(`
    CREATE PROCEDURE RemoveEventCategoryMapping(
      IN p_event_id CHAR(36),
      IN p_category_id CHAR(36)
    )
    BEGIN
      DELETE FROM event_category_mapping
      WHERE event_id = p_event_id AND category_id = p_category_id;
    END
  `);
  console.log("Created RemoveEventCategoryMapping procedure");

  // Update event primary category
  await knex.raw(`
    CREATE PROCEDURE UpdateEventPrimaryCategory(
      IN p_event_id CHAR(36),
      IN p_category_id CHAR(36)
    )
    BEGIN
      UPDATE events SET category_id = p_category_id WHERE id = p_event_id;
    END
  `);
  console.log("Created UpdateEventPrimaryCategory procedure");

  // ===== EVENT LOCATIONS =====

  // Add event location
  await knex.raw(`
    CREATE PROCEDURE AddEventLocation(
      IN p_event_id CHAR(36),
      IN p_venue_name VARCHAR(255),
      IN p_venue_address TEXT,
      IN p_barangay_id INT,
      IN p_latitude DECIMAL(10, 8),
      IN p_longitude DECIMAL(11, 8),
      IN p_is_primary TINYINT(1),
      IN p_display_order INT
    )
    BEGIN
      DECLARE v_location_id CHAR(36);
      SET v_location_id = UUID();

      IF p_is_primary = 1 THEN
        UPDATE event_locations SET is_primary = 0 WHERE event_id = p_event_id;
      END IF;

      INSERT INTO event_locations (id, event_id, venue_name, venue_address, barangay_id, latitude, longitude, is_primary, display_order)
      VALUES (v_location_id, p_event_id, p_venue_name, p_venue_address, p_barangay_id, p_latitude, p_longitude, p_is_primary, p_display_order);

      SELECT
        el.*,
        b.barangay as barangay_name,
        m.municipality as municipality_name,
        p.province as province_name
      FROM event_locations el
      LEFT JOIN barangay b ON el.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      WHERE el.id = v_location_id;
    END
  `);
  console.log("Created AddEventLocation procedure");

  // Update event location
  await knex.raw(`
    CREATE PROCEDURE UpdateEventLocation(
      IN p_location_id CHAR(36),
      IN p_event_id CHAR(36),
      IN p_venue_name VARCHAR(255),
      IN p_venue_address TEXT,
      IN p_barangay_id INT,
      IN p_latitude DECIMAL(10, 8),
      IN p_longitude DECIMAL(11, 8),
      IN p_is_primary TINYINT(1),
      IN p_display_order INT
    )
    BEGIN
      IF p_is_primary = 1 THEN
        UPDATE event_locations SET is_primary = 0 WHERE event_id = p_event_id;
      END IF;

      UPDATE event_locations SET
        venue_name = IFNULL(p_venue_name, venue_name),
        venue_address = IFNULL(p_venue_address, venue_address),
        barangay_id = IFNULL(p_barangay_id, barangay_id),
        latitude = IFNULL(p_latitude, latitude),
        longitude = IFNULL(p_longitude, longitude),
        is_primary = IFNULL(p_is_primary, is_primary),
        display_order = IFNULL(p_display_order, display_order)
      WHERE id = p_location_id AND event_id = p_event_id;
    END
  `);
  console.log("Created UpdateEventLocation procedure");

  // Delete event location
  await knex.raw(`
    CREATE PROCEDURE DeleteEventLocation(
      IN p_location_id CHAR(36),
      IN p_event_id CHAR(36)
    )
    BEGIN
      DELETE FROM event_locations WHERE id = p_location_id AND event_id = p_event_id;
    END
  `);
  console.log("Created DeleteEventLocation procedure");

  // Set primary event location
  await knex.raw(`
    CREATE PROCEDURE SetPrimaryEventLocation(
      IN p_location_id CHAR(36),
      IN p_event_id CHAR(36)
    )
    BEGIN
      UPDATE event_locations SET is_primary = 0 WHERE event_id = p_event_id;
      UPDATE event_locations SET is_primary = 1 WHERE id = p_location_id AND event_id = p_event_id;
    END
  `);
  console.log("Created SetPrimaryEventLocation procedure");

  console.log("All event procedures created successfully!");
};

exports.down = async function(knex) {
  const procedures = [
    // Categories
    'GetAllEventCategories',
    'GetEventCategoryById',
    'CreateEventCategory',
    'UpdateEventCategory',
    'DeleteEventCategory',
    // Events
    'GetAllEvents',
    'GetEventById',
    'GetEventImages',
    'GetEventCategoryMapping',
    'GetEventLocations',
    'CreateEvent',
    'UpdateEvent',
    'DeleteEvent',
    // Featured
    'GetFeaturedEvents',
    'GetNonFeaturedEvents',
    'FeatureEvent',
    'UnfeatureEvent',
    'UpdateEventFeaturedOrder',
    // Images
    'AddEventImage',
    'DeleteEventImage',
    'SetPrimaryEventImage',
    // Public
    'GetPublishedEvents',
    'GetUpcomingEvents',
    // Status
    'UpdateEventStatus',
    // Category Mappings
    'ClearEventCategoryMappings',
    'AddEventCategoryMapping',
    'RemoveEventCategoryMapping',
    'UpdateEventPrimaryCategory',
    // Locations
    'AddEventLocation',
    'UpdateEventLocation',
    'DeleteEventLocation',
    'SetPrimaryEventLocation',
  ];

  for (const proc of procedures) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${proc}`);
    console.log(`Dropped procedure ${proc}`);
  }

  console.log("All event procedures dropped successfully!");
};
