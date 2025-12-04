/**
 * Event Management Stored Procedures
 * 
 * Includes procedures for:
 * - Event CRUD operations
 * - Event categories and tags
 * - Event images
 * - Event schedules
 * - Event search and filtering
 * - Event approval workflow
 * - Featured events management
 * - Event reviews and ratings
 */

async function createEventProcedures(knex) {
  // Drop existing procedures first
  const procedureNames = [
    // Event CRUD
    'GetAllEvents', 'GetEventById', 'GetEventBySlug', 'InsertEvent', 'UpdateEvent', 'DeleteEvent',
    // Event Categories
    'GetAllEventCategories', 'GetEventCategoryById', 'InsertEventCategory', 'UpdateEventCategory', 'DeleteEventCategory',
    // Event Tags
    'GetAllEventTags', 'GetEventTagsByEventId', 'AddEventTag', 'RemoveEventTag', 'SyncEventTags',
    // Event Images
    'GetEventImages', 'InsertEventImage', 'UpdateEventImage', 'DeleteEventImage', 'SetPrimaryEventImage',
    // Event Schedules
    'GetEventSchedules', 'InsertEventSchedule', 'UpdateEventSchedule', 'DeleteEventSchedule',
    // Search & Filter
    'SearchEvents', 'GetEventsByCategory', 'GetEventsByDateRange', 'GetEventsByLocation', 'GetNearbyEvents',
    // Approval Workflow
    'GetPendingEvents', 'ApproveEvent', 'RejectEvent', 'SubmitEventForApproval',
    // Featured Events
    'GetFeaturedEvents', 'SetEventFeatured', 'UpdateFeaturedConfig', 'GetFeaturedEventsForLocation',
    // Reviews
    'GetEventReviews', 'InsertEventReview', 'UpdateEventReview', 'DeleteEventReview', 'GetEventAverageRating',
    // Stats & Analytics
    'IncrementEventViews', 'GetEventStats', 'GetPopularEvents',
    // Bookmarks
    'AddEventBookmark', 'RemoveEventBookmark', 'GetUserBookmarkedEvents', 'IsEventBookmarked',
    // Calendar
    'GetEventsForCalendar', 'GetEventDensityByMonth'
  ];

  for (const name of procedureNames) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${name};`);
  }

  // ==================== EVENT CRUD PROCEDURES ====================

  // Get all events with related data
  await knex.raw(`
    CREATE PROCEDURE GetAllEvents(
      IN p_status VARCHAR(20),
      IN p_limit INT,
      IN p_offset INT
    )
    BEGIN
      DECLARE v_limit INT DEFAULT 100;
      DECLARE v_offset INT DEFAULT 0;
      
      IF p_limit IS NOT NULL THEN SET v_limit = p_limit; END IF;
      IF p_offset IS NOT NULL THEN SET v_offset = p_offset; END IF;
      
      SELECT 
        e.*,
        ec.name AS category_name,
        ec.slug AS category_slug,
        ec.color AS category_color,
        ec.icon AS category_icon,
        b.barangay,
        m.municipality,
        p.province,
        (SELECT file_url FROM event_image ei WHERE ei.event_id = e.id AND ei.is_primary = 1 LIMIT 1) AS primary_image,
        (SELECT AVG(rating) FROM event_review er WHERE er.event_id = e.id AND er.status = 'approved') AS average_rating,
        (SELECT COUNT(*) FROM event_review er WHERE er.event_id = e.id AND er.status = 'approved') AS review_count
      FROM event e
      LEFT JOIN event_category ec ON e.event_category_id = ec.id
      LEFT JOIN barangay b ON e.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      WHERE (p_status IS NULL OR e.status = p_status)
      ORDER BY e.start_date ASC
      LIMIT v_limit OFFSET v_offset;
    END;
  `);

  // Get event by ID with full details
  await knex.raw(`
    CREATE PROCEDURE GetEventById(IN p_id CHAR(64))
    BEGIN
      -- Main event data
      SELECT 
        e.*,
        ec.name AS category_name,
        ec.slug AS category_slug,
        ec.color AS category_color,
        ec.icon AS category_icon,
        b.barangay,
        m.municipality,
        p.province,
        (SELECT AVG(rating) FROM event_review er WHERE er.event_id = e.id AND er.status = 'approved') AS average_rating,
        (SELECT COUNT(*) FROM event_review er WHERE er.event_id = e.id AND er.status = 'approved') AS review_count
      FROM event e
      LEFT JOIN event_category ec ON e.event_category_id = ec.id
      LEFT JOIN barangay b ON e.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      WHERE e.id = p_id;

      -- Event images
      SELECT * FROM event_image WHERE event_id = p_id ORDER BY is_primary DESC, display_order ASC;

      -- Event tags
      SELECT et.* FROM event_tag et
      JOIN event_tag_map etm ON et.id = etm.tag_id
      WHERE etm.event_id = p_id;

      -- Event schedules
      SELECT * FROM event_schedule WHERE event_id = p_id ORDER BY schedule_date ASC, start_time ASC;
    END;
  `);

  // Get event by slug
  await knex.raw(`
    CREATE PROCEDURE GetEventBySlug(IN p_slug VARCHAR(300))
    BEGIN
      SELECT 
        e.*,
        ec.name AS category_name,
        ec.slug AS category_slug,
        ec.color AS category_color,
        ec.icon AS category_icon,
        b.barangay,
        m.municipality,
        p.province,
        (SELECT AVG(rating) FROM event_review er WHERE er.event_id = e.id AND er.status = 'approved') AS average_rating,
        (SELECT COUNT(*) FROM event_review er WHERE er.event_id = e.id AND er.status = 'approved') AS review_count
      FROM event e
      LEFT JOIN event_category ec ON e.event_category_id = ec.id
      LEFT JOIN barangay b ON e.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      WHERE e.slug = p_slug;
    END;
  `);

  // Insert new event
  await knex.raw(`
    CREATE PROCEDURE InsertEvent(
      IN p_id CHAR(64),
      IN p_name VARCHAR(255),
      IN p_description TEXT,
      IN p_short_description TEXT,
      IN p_start_date DATETIME,
      IN p_end_date DATETIME,
      IN p_timezone VARCHAR(50),
      IN p_is_all_day BOOLEAN,
      IN p_barangay_id INT,
      IN p_venue_name TEXT,
      IN p_address TEXT,
      IN p_latitude DECIMAL(10,8),
      IN p_longitude DECIMAL(11,8),
      IN p_event_category_id INT,
      IN p_is_free BOOLEAN,
      IN p_entry_fee DECIMAL(10,2),
      IN p_early_bird_price DECIMAL(10,2),
      IN p_early_bird_deadline DATETIME,
      IN p_max_attendees INT,
      IN p_registration_required BOOLEAN,
      IN p_registration_url TEXT,
      IN p_organizer_id CHAR(64),
      IN p_organizer_type ENUM('user', 'business', 'tourism'),
      IN p_organizer_name VARCHAR(255),
      IN p_organizer_email VARCHAR(255),
      IN p_organizer_phone VARCHAR(20),
      IN p_contact_phone VARCHAR(20),
      IN p_contact_email VARCHAR(255),
      IN p_website VARCHAR(500),
      IN p_facebook_url VARCHAR(500),
      IN p_instagram_url VARCHAR(500),
      IN p_status VARCHAR(20),
      IN p_slug VARCHAR(300),
      IN p_meta_title VARCHAR(255),
      IN p_meta_description TEXT,
      IN p_created_by CHAR(64)
    )
    BEGIN
      INSERT INTO event (
        id, name, description, short_description,
        start_date, end_date, timezone, is_all_day,
        barangay_id, venue_name, address, latitude, longitude,
        event_category_id, is_free, entry_fee, early_bird_price, early_bird_deadline,
        max_attendees, registration_required, registration_url,
        organizer_id, organizer_type, organizer_name, organizer_email, organizer_phone,
        contact_phone, contact_email, website, facebook_url, instagram_url,
        status, slug, meta_title, meta_description, created_by
      ) VALUES (
        p_id, p_name, p_description, p_short_description,
        p_start_date, p_end_date, IFNULL(p_timezone, 'Asia/Manila'), IFNULL(p_is_all_day, FALSE),
        p_barangay_id, p_venue_name, p_address, p_latitude, p_longitude,
        p_event_category_id, IFNULL(p_is_free, TRUE), p_entry_fee, p_early_bird_price, p_early_bird_deadline,
        p_max_attendees, IFNULL(p_registration_required, FALSE), p_registration_url,
        p_organizer_id, IFNULL(p_organizer_type, 'tourism'), p_organizer_name, p_organizer_email, p_organizer_phone,
        p_contact_phone, p_contact_email, p_website, p_facebook_url, p_instagram_url,
        IFNULL(p_status, 'draft'), p_slug, p_meta_title, p_meta_description, p_created_by
      );

      SELECT * FROM event WHERE id = p_id;
    END;
  `);

  // Update event
  await knex.raw(`
    CREATE PROCEDURE UpdateEvent(
      IN p_id CHAR(64),
      IN p_name VARCHAR(255),
      IN p_description TEXT,
      IN p_short_description TEXT,
      IN p_start_date DATETIME,
      IN p_end_date DATETIME,
      IN p_timezone VARCHAR(50),
      IN p_is_all_day BOOLEAN,
      IN p_barangay_id INT,
      IN p_venue_name TEXT,
      IN p_address TEXT,
      IN p_latitude DECIMAL(10,8),
      IN p_longitude DECIMAL(11,8),
      IN p_event_category_id INT,
      IN p_is_free BOOLEAN,
      IN p_entry_fee DECIMAL(10,2),
      IN p_early_bird_price DECIMAL(10,2),
      IN p_early_bird_deadline DATETIME,
      IN p_max_attendees INT,
      IN p_registration_required BOOLEAN,
      IN p_registration_url TEXT,
      IN p_organizer_id CHAR(64),
      IN p_organizer_type ENUM('user', 'business', 'tourism'),
      IN p_organizer_name VARCHAR(255),
      IN p_organizer_email VARCHAR(255),
      IN p_organizer_phone VARCHAR(20),
      IN p_contact_phone VARCHAR(20),
      IN p_contact_email VARCHAR(255),
      IN p_website VARCHAR(500),
      IN p_facebook_url VARCHAR(500),
      IN p_instagram_url VARCHAR(500),
      IN p_status VARCHAR(20),
      IN p_slug VARCHAR(300),
      IN p_meta_title VARCHAR(255),
      IN p_meta_description TEXT,
      IN p_updated_by CHAR(64)
    )
    BEGIN
      UPDATE event SET
        name = IFNULL(p_name, name),
        description = IFNULL(p_description, description),
        short_description = IFNULL(p_short_description, short_description),
        start_date = IFNULL(p_start_date, start_date),
        end_date = IFNULL(p_end_date, end_date),
        timezone = IFNULL(p_timezone, timezone),
        is_all_day = IFNULL(p_is_all_day, is_all_day),
        barangay_id = IFNULL(p_barangay_id, barangay_id),
        venue_name = IFNULL(p_venue_name, venue_name),
        address = IFNULL(p_address, address),
        latitude = IFNULL(p_latitude, latitude),
        longitude = IFNULL(p_longitude, longitude),
        event_category_id = IFNULL(p_event_category_id, event_category_id),
        is_free = IFNULL(p_is_free, is_free),
        entry_fee = IFNULL(p_entry_fee, entry_fee),
        early_bird_price = IFNULL(p_early_bird_price, early_bird_price),
        early_bird_deadline = IFNULL(p_early_bird_deadline, early_bird_deadline),
        max_attendees = IFNULL(p_max_attendees, max_attendees),
        registration_required = IFNULL(p_registration_required, registration_required),
        registration_url = IFNULL(p_registration_url, registration_url),
        organizer_id = IFNULL(p_organizer_id, organizer_id),
        organizer_type = IFNULL(p_organizer_type, organizer_type),
        organizer_name = IFNULL(p_organizer_name, organizer_name),
        organizer_email = IFNULL(p_organizer_email, organizer_email),
        organizer_phone = IFNULL(p_organizer_phone, organizer_phone),
        contact_phone = IFNULL(p_contact_phone, contact_phone),
        contact_email = IFNULL(p_contact_email, contact_email),
        website = IFNULL(p_website, website),
        facebook_url = IFNULL(p_facebook_url, facebook_url),
        instagram_url = IFNULL(p_instagram_url, instagram_url),
        status = IFNULL(p_status, status),
        slug = IFNULL(p_slug, slug),
        meta_title = IFNULL(p_meta_title, meta_title),
        meta_description = IFNULL(p_meta_description, meta_description),
        updated_by = IFNULL(p_updated_by, updated_by)
      WHERE id = p_id;

      SELECT * FROM event WHERE id = p_id;
    END;
  `);

  // Delete event
  await knex.raw(`
    CREATE PROCEDURE DeleteEvent(IN p_id CHAR(64))
    BEGIN
      DELETE FROM event WHERE id = p_id;
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);

  // ==================== EVENT CATEGORY PROCEDURES ====================

  await knex.raw(`
    CREATE PROCEDURE GetAllEventCategories()
    BEGIN
      SELECT 
        ec.*,
        (SELECT COUNT(*) FROM event e WHERE e.event_category_id = ec.id AND e.status IN ('approved', 'published')) AS event_count
      FROM event_category ec
      WHERE ec.is_active = TRUE
      ORDER BY ec.name ASC;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE GetEventCategoryById(IN p_id INT)
    BEGIN
      SELECT * FROM event_category WHERE id = p_id;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE InsertEventCategory(
      IN p_name VARCHAR(100),
      IN p_slug VARCHAR(100),
      IN p_description TEXT,
      IN p_icon VARCHAR(50),
      IN p_color VARCHAR(20)
    )
    BEGIN
      INSERT INTO event_category (name, slug, description, icon, color)
      VALUES (p_name, p_slug, p_description, p_icon, p_color);
      SELECT * FROM event_category WHERE id = LAST_INSERT_ID();
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE UpdateEventCategory(
      IN p_id INT,
      IN p_name VARCHAR(100),
      IN p_slug VARCHAR(100),
      IN p_description TEXT,
      IN p_icon VARCHAR(50),
      IN p_color VARCHAR(20),
      IN p_is_active BOOLEAN
    )
    BEGIN
      UPDATE event_category SET
        name = IFNULL(p_name, name),
        slug = IFNULL(p_slug, slug),
        description = IFNULL(p_description, description),
        icon = IFNULL(p_icon, icon),
        color = IFNULL(p_color, color),
        is_active = IFNULL(p_is_active, is_active)
      WHERE id = p_id;
      SELECT * FROM event_category WHERE id = p_id;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE DeleteEventCategory(IN p_id INT)
    BEGIN
      UPDATE event_category SET is_active = FALSE WHERE id = p_id;
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);

  // ==================== EVENT TAG PROCEDURES ====================

  await knex.raw(`
    CREATE PROCEDURE GetAllEventTags()
    BEGIN
      SELECT * FROM event_tag WHERE is_active = TRUE ORDER BY name ASC;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE GetEventTagsByEventId(IN p_event_id CHAR(64))
    BEGIN
      SELECT et.* FROM event_tag et
      JOIN event_tag_map etm ON et.id = etm.tag_id
      WHERE etm.event_id = p_event_id AND et.is_active = TRUE;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE AddEventTag(IN p_event_id CHAR(64), IN p_tag_id INT)
    BEGIN
      INSERT IGNORE INTO event_tag_map (event_id, tag_id) VALUES (p_event_id, p_tag_id);
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE RemoveEventTag(IN p_event_id CHAR(64), IN p_tag_id INT)
    BEGIN
      DELETE FROM event_tag_map WHERE event_id = p_event_id AND tag_id = p_tag_id;
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE SyncEventTags(IN p_event_id CHAR(64), IN p_tag_ids TEXT)
    BEGIN
      -- Remove all existing tags
      DELETE FROM event_tag_map WHERE event_id = p_event_id;
      
      -- Add new tags if provided
      IF p_tag_ids IS NOT NULL AND p_tag_ids != '' THEN
        SET @sql = CONCAT('INSERT INTO event_tag_map (event_id, tag_id) SELECT "', p_event_id, '", id FROM event_tag WHERE FIND_IN_SET(id, "', p_tag_ids, '")');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
      END IF;

      -- Return updated tags
      SELECT et.* FROM event_tag et
      JOIN event_tag_map etm ON et.id = etm.tag_id
      WHERE etm.event_id = p_event_id;
    END;
  `);

  // ==================== EVENT IMAGE PROCEDURES ====================

  await knex.raw(`
    CREATE PROCEDURE GetEventImages(IN p_event_id CHAR(64))
    BEGIN
      SELECT * FROM event_image WHERE event_id = p_event_id ORDER BY is_primary DESC, display_order ASC;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE InsertEventImage(
      IN p_id CHAR(64),
      IN p_event_id CHAR(64),
      IN p_file_url TEXT,
      IN p_file_name VARCHAR(255),
      IN p_file_format VARCHAR(10),
      IN p_file_size BIGINT,
      IN p_is_primary BOOLEAN,
      IN p_alt_text VARCHAR(255),
      IN p_display_order INT
    )
    BEGIN
      -- If this is primary, unset other primaries
      IF p_is_primary = TRUE THEN
        UPDATE event_image SET is_primary = FALSE WHERE event_id = p_event_id;
      END IF;

      INSERT INTO event_image (id, event_id, file_url, file_name, file_format, file_size, is_primary, alt_text, display_order)
      VALUES (p_id, p_event_id, p_file_url, p_file_name, p_file_format, p_file_size, IFNULL(p_is_primary, FALSE), p_alt_text, IFNULL(p_display_order, 0));

      SELECT * FROM event_image WHERE id = p_id;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE UpdateEventImage(
      IN p_id CHAR(64),
      IN p_is_primary BOOLEAN,
      IN p_alt_text VARCHAR(255),
      IN p_display_order INT
    )
    BEGIN
      DECLARE v_event_id CHAR(64);
      SELECT event_id INTO v_event_id FROM event_image WHERE id = p_id;

      -- If setting as primary, unset other primaries
      IF p_is_primary = TRUE THEN
        UPDATE event_image SET is_primary = FALSE WHERE event_id = v_event_id;
      END IF;

      UPDATE event_image SET
        is_primary = IFNULL(p_is_primary, is_primary),
        alt_text = IFNULL(p_alt_text, alt_text),
        display_order = IFNULL(p_display_order, display_order)
      WHERE id = p_id;

      SELECT * FROM event_image WHERE id = p_id;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE DeleteEventImage(IN p_id CHAR(64))
    BEGIN
      DELETE FROM event_image WHERE id = p_id;
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE SetPrimaryEventImage(IN p_image_id CHAR(64))
    BEGIN
      DECLARE v_event_id CHAR(64);
      SELECT event_id INTO v_event_id FROM event_image WHERE id = p_image_id;
      
      UPDATE event_image SET is_primary = FALSE WHERE event_id = v_event_id;
      UPDATE event_image SET is_primary = TRUE WHERE id = p_image_id;
      
      SELECT * FROM event_image WHERE event_id = v_event_id ORDER BY is_primary DESC, display_order ASC;
    END;
  `);

  // ==================== EVENT SCHEDULE PROCEDURES ====================

  await knex.raw(`
    CREATE PROCEDURE GetEventSchedules(IN p_event_id CHAR(64))
    BEGIN
      SELECT * FROM event_schedule WHERE event_id = p_event_id ORDER BY schedule_date ASC, start_time ASC;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE InsertEventSchedule(
      IN p_id CHAR(64),
      IN p_event_id CHAR(64),
      IN p_title VARCHAR(255),
      IN p_description TEXT,
      IN p_schedule_date DATE,
      IN p_start_time TIME,
      IN p_end_time TIME,
      IN p_location_override VARCHAR(255),
      IN p_display_order INT
    )
    BEGIN
      INSERT INTO event_schedule (id, event_id, title, description, schedule_date, start_time, end_time, location_override, display_order)
      VALUES (p_id, p_event_id, p_title, p_description, p_schedule_date, p_start_time, p_end_time, p_location_override, IFNULL(p_display_order, 0));
      SELECT * FROM event_schedule WHERE id = p_id;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE UpdateEventSchedule(
      IN p_id CHAR(64),
      IN p_title VARCHAR(255),
      IN p_description TEXT,
      IN p_schedule_date DATE,
      IN p_start_time TIME,
      IN p_end_time TIME,
      IN p_location_override VARCHAR(255),
      IN p_display_order INT
    )
    BEGIN
      UPDATE event_schedule SET
        title = IFNULL(p_title, title),
        description = IFNULL(p_description, description),
        schedule_date = IFNULL(p_schedule_date, schedule_date),
        start_time = IFNULL(p_start_time, start_time),
        end_time = IFNULL(p_end_time, end_time),
        location_override = IFNULL(p_location_override, location_override),
        display_order = IFNULL(p_display_order, display_order)
      WHERE id = p_id;
      SELECT * FROM event_schedule WHERE id = p_id;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE DeleteEventSchedule(IN p_id CHAR(64))
    BEGIN
      DELETE FROM event_schedule WHERE id = p_id;
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);

  // ==================== SEARCH & FILTER PROCEDURES ====================

  await knex.raw(`
    CREATE PROCEDURE SearchEvents(
      IN p_keyword VARCHAR(255),
      IN p_category_id INT,
      IN p_start_date DATE,
      IN p_end_date DATE,
      IN p_is_free BOOLEAN,
      IN p_barangay_id INT,
      IN p_municipality_id INT,
      IN p_province_id INT,
      IN p_status VARCHAR(20),
      IN p_sort_by VARCHAR(50),
      IN p_sort_order VARCHAR(4),
      IN p_limit INT,
      IN p_offset INT
    )
    BEGIN
      SET @sql = CONCAT('
        SELECT 
          e.*,
          ec.name AS category_name,
          ec.slug AS category_slug,
          ec.color AS category_color,
          ec.icon AS category_icon,
          b.barangay,
          m.municipality,
          p.province,
          (SELECT file_url FROM event_image ei WHERE ei.event_id = e.id AND ei.is_primary = 1 LIMIT 1) AS primary_image,
          (SELECT AVG(rating) FROM event_review er WHERE er.event_id = e.id AND er.status = ''approved'') AS average_rating,
          (SELECT COUNT(*) FROM event_review er WHERE er.event_id = e.id AND er.status = ''approved'') AS review_count
        FROM event e
        LEFT JOIN event_category ec ON e.event_category_id = ec.id
        LEFT JOIN barangay b ON e.barangay_id = b.id
        LEFT JOIN municipality m ON b.municipality_id = m.id
        LEFT JOIN province p ON m.province_id = p.id
        WHERE 1=1'
      );

      IF p_keyword IS NOT NULL AND p_keyword != '' THEN
        SET @sql = CONCAT(@sql, ' AND (e.name LIKE ''%', p_keyword, '%'' OR e.description LIKE ''%', p_keyword, '%'' OR e.venue_name LIKE ''%', p_keyword, '%'')');
      END IF;

      IF p_category_id IS NOT NULL THEN
        SET @sql = CONCAT(@sql, ' AND e.event_category_id = ', p_category_id);
      END IF;

      IF p_start_date IS NOT NULL THEN
        SET @sql = CONCAT(@sql, ' AND e.start_date >= ''', p_start_date, '''');
      END IF;

      IF p_end_date IS NOT NULL THEN
        SET @sql = CONCAT(@sql, ' AND e.end_date <= ''', p_end_date, '''');
      END IF;

      IF p_is_free IS NOT NULL THEN
        SET @sql = CONCAT(@sql, ' AND e.is_free = ', p_is_free);
      END IF;

      IF p_barangay_id IS NOT NULL THEN
        SET @sql = CONCAT(@sql, ' AND e.barangay_id = ', p_barangay_id);
      END IF;

      IF p_municipality_id IS NOT NULL THEN
        SET @sql = CONCAT(@sql, ' AND m.id = ', p_municipality_id);
      END IF;

      IF p_province_id IS NOT NULL THEN
        SET @sql = CONCAT(@sql, ' AND p.id = ', p_province_id);
      END IF;

      IF p_status IS NOT NULL AND p_status != '' THEN
        SET @sql = CONCAT(@sql, ' AND e.status = ''', p_status, '''');
      ELSE
        SET @sql = CONCAT(@sql, ' AND e.status IN (''approved'', ''published'')');
      END IF;

      -- Sorting
      SET @sort_col = IFNULL(p_sort_by, 'start_date');
      SET @sort_dir = IF(UPPER(p_sort_order) = 'DESC', 'DESC', 'ASC');
      SET @sql = CONCAT(@sql, ' ORDER BY e.', @sort_col, ' ', @sort_dir);

      -- Pagination
      SET @sql = CONCAT(@sql, ' LIMIT ', IFNULL(p_limit, 20), ' OFFSET ', IFNULL(p_offset, 0));

      PREPARE stmt FROM @sql;
      EXECUTE stmt;
      DEALLOCATE PREPARE stmt;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE GetEventsByCategory(IN p_category_id INT, IN p_limit INT)
    BEGIN
      DECLARE v_limit INT DEFAULT 10;
      IF p_limit IS NOT NULL THEN SET v_limit = p_limit; END IF;
      
      SELECT 
        e.*,
        ec.name AS category_name,
        (SELECT file_url FROM event_image ei WHERE ei.event_id = e.id AND ei.is_primary = 1 LIMIT 1) AS primary_image
      FROM event e
      LEFT JOIN event_category ec ON e.event_category_id = ec.id
      WHERE e.event_category_id = p_category_id
        AND e.status IN ('approved', 'published')
        AND e.end_date >= NOW()
      ORDER BY e.start_date ASC
      LIMIT v_limit;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE GetEventsByDateRange(IN p_start DATE, IN p_end DATE)
    BEGIN
      SELECT 
        e.*,
        ec.name AS category_name,
        ec.color AS category_color,
        (SELECT file_url FROM event_image ei WHERE ei.event_id = e.id AND ei.is_primary = 1 LIMIT 1) AS primary_image
      FROM event e
      LEFT JOIN event_category ec ON e.event_category_id = ec.id
      WHERE e.status IN ('approved', 'published')
        AND ((e.start_date BETWEEN p_start AND p_end) OR (e.end_date BETWEEN p_start AND p_end) OR (e.start_date <= p_start AND e.end_date >= p_end))
      ORDER BY e.start_date ASC;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE GetEventsByLocation(IN p_barangay_id INT)
    BEGIN
      SELECT 
        e.*,
        ec.name AS category_name,
        (SELECT file_url FROM event_image ei WHERE ei.event_id = e.id AND ei.is_primary = 1 LIMIT 1) AS primary_image
      FROM event e
      LEFT JOIN event_category ec ON e.event_category_id = ec.id
      WHERE e.barangay_id = p_barangay_id
        AND e.status IN ('approved', 'published')
      ORDER BY e.start_date ASC;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE GetNearbyEvents(
      IN p_latitude DECIMAL(10,8),
      IN p_longitude DECIMAL(11,8),
      IN p_radius_km DECIMAL(5,2),
      IN p_limit INT
    )
    BEGIN
      SELECT 
        e.*,
        ec.name AS category_name,
        ec.color AS category_color,
        (SELECT file_url FROM event_image ei WHERE ei.event_id = e.id AND ei.is_primary = 1 LIMIT 1) AS primary_image,
        (
          6371 * acos(
            cos(radians(p_latitude)) * cos(radians(e.latitude)) *
            cos(radians(e.longitude) - radians(p_longitude)) +
            sin(radians(p_latitude)) * sin(radians(e.latitude))
          )
        ) AS distance_km
      FROM event e
      LEFT JOIN event_category ec ON e.event_category_id = ec.id
      WHERE e.latitude IS NOT NULL
        AND e.longitude IS NOT NULL
        AND e.status IN ('approved', 'published')
        AND e.end_date >= NOW()
      HAVING distance_km <= COALESCE(p_radius_km, 10)
      ORDER BY distance_km ASC
      LIMIT 20;
    END;
  `);

  // ==================== APPROVAL WORKFLOW PROCEDURES ====================

  await knex.raw(`
    CREATE PROCEDURE GetPendingEvents()
    BEGIN
      SELECT 
        e.*,
        ec.name AS category_name,
        ec.slug AS category_slug,
        b.barangay,
        m.municipality,
        p.province,
        u.email AS created_by_email,
        (SELECT file_url FROM event_image ei WHERE ei.event_id = e.id AND ei.is_primary = 1 LIMIT 1) AS primary_image
      FROM event e
      LEFT JOIN event_category ec ON e.event_category_id = ec.id
      LEFT JOIN barangay b ON e.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      LEFT JOIN user u ON e.created_by = u.id
      WHERE e.status = 'pending'
      ORDER BY e.created_at DESC;

      -- Get images for pending events
      SELECT ei.* FROM event_image ei
      WHERE ei.event_id IN (SELECT id FROM event WHERE status = 'pending')
      ORDER BY ei.is_primary DESC, ei.display_order ASC;

      -- Get tags for pending events
      SELECT etm.event_id, et.* FROM event_tag_map etm
      JOIN event_tag et ON etm.tag_id = et.id
      WHERE etm.event_id IN (SELECT id FROM event WHERE status = 'pending');
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE ApproveEvent(IN p_event_id CHAR(64), IN p_approved_by CHAR(64))
    BEGIN
      UPDATE event 
      SET status = 'approved', 
          approved_by = p_approved_by, 
          approved_at = CURRENT_TIMESTAMP
      WHERE id = p_event_id AND status = 'pending';

      IF ROW_COUNT() > 0 THEN
        CALL LogApprovalRecord('new', 'event', p_event_id, 'approved', p_approved_by, NULL);
      END IF;

      SELECT * FROM event WHERE id = p_event_id;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE RejectEvent(IN p_event_id CHAR(64), IN p_rejected_by CHAR(64), IN p_reason TEXT)
    BEGIN
      UPDATE event 
      SET status = 'rejected',
          rejection_reason = p_reason
      WHERE id = p_event_id AND status = 'pending';

      IF ROW_COUNT() > 0 THEN
        CALL LogApprovalRecord('new', 'event', p_event_id, 'rejected', p_rejected_by, p_reason);
      END IF;

      SELECT * FROM event WHERE id = p_event_id;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE SubmitEventForApproval(IN p_event_id CHAR(64))
    BEGIN
      UPDATE event SET status = 'pending' WHERE id = p_event_id AND status IN ('draft', 'rejected');
      SELECT * FROM event WHERE id = p_event_id;
    END;
  `);

  // ==================== FEATURED EVENTS PROCEDURES ====================

  await knex.raw(`
    CREATE PROCEDURE GetFeaturedEvents(IN p_limit INT)
    BEGIN
      SELECT 
        e.*,
        ec.name AS category_name,
        ec.color AS category_color,
        ec.icon AS category_icon,
        b.barangay,
        m.municipality,
        p.province,
        (SELECT file_url FROM event_image ei WHERE ei.event_id = e.id AND ei.is_primary = 1 LIMIT 1) AS primary_image,
        (SELECT AVG(rating) FROM event_review er WHERE er.event_id = e.id AND er.status = 'approved') AS average_rating
      FROM event e
      LEFT JOIN event_category ec ON e.event_category_id = ec.id
      LEFT JOIN barangay b ON e.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      WHERE e.is_featured = TRUE
        AND e.status IN ('approved', 'published')
        AND e.end_date >= NOW()
        AND (e.featured_start_date IS NULL OR e.featured_start_date <= NOW())
        AND (e.featured_end_date IS NULL OR e.featured_end_date >= NOW())
      ORDER BY 
        CASE e.featured_priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END,
        e.start_date ASC
      LIMIT 10;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE SetEventFeatured(
      IN p_event_id CHAR(64),
      IN p_is_featured BOOLEAN,
      IN p_priority ENUM('high', 'medium', 'low'),
      IN p_start_date DATETIME,
      IN p_end_date DATETIME
    )
    BEGIN
      UPDATE event SET
        is_featured = p_is_featured,
        featured_priority = p_priority,
        featured_start_date = p_start_date,
        featured_end_date = p_end_date
      WHERE id = p_event_id;

      SELECT * FROM event WHERE id = p_event_id;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE UpdateFeaturedConfig(
      IN p_id CHAR(64),
      IN p_event_id CHAR(64),
      IN p_display_location ENUM('homepage_hero', 'homepage_carousel', 'category_page', 'sidebar', 'search_results'),
      IN p_display_order INT,
      IN p_priority ENUM('high', 'medium', 'low'),
      IN p_start_date DATETIME,
      IN p_end_date DATETIME,
      IN p_is_active BOOLEAN,
      IN p_created_by CHAR(64)
    )
    BEGIN
      IF p_id IS NULL THEN
        INSERT INTO event_featured_config (id, event_id, display_location, display_order, priority, start_date, end_date, is_active, created_by)
        VALUES (UUID(), p_event_id, p_display_location, IFNULL(p_display_order, 0), IFNULL(p_priority, 'medium'), p_start_date, p_end_date, IFNULL(p_is_active, TRUE), p_created_by);
      ELSE
        UPDATE event_featured_config SET
          display_location = IFNULL(p_display_location, display_location),
          display_order = IFNULL(p_display_order, display_order),
          priority = IFNULL(p_priority, priority),
          start_date = p_start_date,
          end_date = p_end_date,
          is_active = IFNULL(p_is_active, is_active)
        WHERE id = p_id;
      END IF;

      SELECT * FROM event_featured_config WHERE event_id = p_event_id;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE GetFeaturedEventsForLocation(IN p_location ENUM('homepage_hero', 'homepage_carousel', 'category_page', 'sidebar', 'search_results'))
    BEGIN
      SELECT 
        e.*,
        ec.name AS category_name,
        ec.color AS category_color,
        efc.display_order,
        efc.priority,
        (SELECT file_url FROM event_image ei WHERE ei.event_id = e.id AND ei.is_primary = 1 LIMIT 1) AS primary_image
      FROM event_featured_config efc
      JOIN event e ON efc.event_id = e.id
      LEFT JOIN event_category ec ON e.event_category_id = ec.id
      WHERE efc.display_location = p_location
        AND efc.is_active = TRUE
        AND e.status IN ('approved', 'published')
        AND e.end_date >= NOW()
        AND (efc.start_date IS NULL OR efc.start_date <= NOW())
        AND (efc.end_date IS NULL OR efc.end_date >= NOW())
      ORDER BY efc.display_order ASC, efc.priority ASC;
    END;
  `);

  // ==================== REVIEW PROCEDURES ====================

  await knex.raw(`
    CREATE PROCEDURE GetEventReviews(
      IN p_event_id CHAR(64),
      IN p_status VARCHAR(20),
      IN p_limit INT,
      IN p_offset INT
    )
    BEGIN
      SELECT 
        er.*,
        u.email AS user_email,
        u.first_name AS user_first_name,
        u.last_name AS user_last_name
      FROM event_review er
      LEFT JOIN user u ON er.user_id = u.id
      WHERE er.event_id = p_event_id
        AND (p_status IS NULL OR er.status = p_status)
      ORDER BY er.created_at DESC
      LIMIT 20 OFFSET 0;

      -- Get photos for reviews
      SELECT erp.* FROM event_review_photo erp
      WHERE erp.review_id IN (
        SELECT id FROM event_review WHERE event_id = p_event_id
      );
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE InsertEventReview(
      IN p_id CHAR(64),
      IN p_event_id CHAR(64),
      IN p_user_id CHAR(64),
      IN p_rating INT,
      IN p_review_text TEXT,
      IN p_is_verified_attendee BOOLEAN
    )
    BEGIN
      INSERT INTO event_review (id, event_id, user_id, rating, review_text, is_verified_attendee)
      VALUES (p_id, p_event_id, p_user_id, p_rating, p_review_text, IFNULL(p_is_verified_attendee, FALSE));

      SELECT * FROM event_review WHERE id = p_id;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE UpdateEventReview(
      IN p_id CHAR(64),
      IN p_rating INT,
      IN p_review_text TEXT,
      IN p_status VARCHAR(20)
    )
    BEGIN
      UPDATE event_review SET
        rating = IFNULL(p_rating, rating),
        review_text = IFNULL(p_review_text, review_text),
        status = IFNULL(p_status, status)
      WHERE id = p_id;

      SELECT * FROM event_review WHERE id = p_id;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE DeleteEventReview(IN p_id CHAR(64))
    BEGIN
      DELETE FROM event_review WHERE id = p_id;
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE GetEventAverageRating(IN p_event_id CHAR(64))
    BEGIN
      SELECT 
        AVG(rating) AS average_rating,
        COUNT(*) AS total_reviews,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS one_star
      FROM event_review
      WHERE event_id = p_event_id AND status = 'approved';
    END;
  `);

  // ==================== ANALYTICS PROCEDURES ====================

  await knex.raw(`
    CREATE PROCEDURE IncrementEventViews(IN p_event_id CHAR(64))
    BEGIN
      UPDATE event SET view_count = view_count + 1 WHERE id = p_event_id;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE GetEventStats(IN p_event_id CHAR(64))
    BEGIN
      SELECT 
        e.view_count,
        e.share_count,
        e.bookmark_count,
        e.current_attendees,
        e.max_attendees,
        (SELECT COUNT(*) FROM event_review WHERE event_id = p_event_id AND status = 'approved') AS review_count,
        (SELECT AVG(rating) FROM event_review WHERE event_id = p_event_id AND status = 'approved') AS average_rating
      FROM event e
      WHERE e.id = p_event_id;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE GetPopularEvents(IN p_limit INT)
    BEGIN
      SELECT 
        e.*,
        ec.name AS category_name,
        ec.color AS category_color,
        (SELECT file_url FROM event_image ei WHERE ei.event_id = e.id AND ei.is_primary = 1 LIMIT 1) AS primary_image,
        (SELECT AVG(rating) FROM event_review er WHERE er.event_id = e.id AND er.status = 'approved') AS average_rating,
        (e.view_count + e.bookmark_count * 5 + (SELECT COUNT(*) FROM event_review WHERE event_id = e.id) * 10) AS popularity_score
      FROM event e
      LEFT JOIN event_category ec ON e.event_category_id = ec.id
      WHERE e.status IN ('approved', 'published')
        AND e.end_date >= NOW()
      ORDER BY popularity_score DESC
      LIMIT 10;
    END;
  `);

  // ==================== BOOKMARK PROCEDURES ====================

  await knex.raw(`
    CREATE PROCEDURE AddEventBookmark(IN p_event_id CHAR(64), IN p_user_id CHAR(64))
    BEGIN
      INSERT IGNORE INTO event_bookmark (event_id, user_id) VALUES (p_event_id, p_user_id);
      IF ROW_COUNT() > 0 THEN
        UPDATE event SET bookmark_count = bookmark_count + 1 WHERE id = p_event_id;
      END IF;
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE RemoveEventBookmark(IN p_event_id CHAR(64), IN p_user_id CHAR(64))
    BEGIN
      DELETE FROM event_bookmark WHERE event_id = p_event_id AND user_id = p_user_id;
      IF ROW_COUNT() > 0 THEN
        UPDATE event SET bookmark_count = GREATEST(bookmark_count - 1, 0) WHERE id = p_event_id;
      END IF;
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE GetUserBookmarkedEvents(IN p_user_id CHAR(64))
    BEGIN
      SELECT 
        e.*,
        ec.name AS category_name,
        ec.color AS category_color,
        (SELECT file_url FROM event_image ei WHERE ei.event_id = e.id AND ei.is_primary = 1 LIMIT 1) AS primary_image,
        eb.created_at AS bookmarked_at
      FROM event_bookmark eb
      JOIN event e ON eb.event_id = e.id
      LEFT JOIN event_category ec ON e.event_category_id = ec.id
      WHERE eb.user_id = p_user_id
      ORDER BY eb.created_at DESC;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE IsEventBookmarked(IN p_event_id CHAR(64), IN p_user_id CHAR(64))
    BEGIN
      SELECT COUNT(*) > 0 AS is_bookmarked FROM event_bookmark WHERE event_id = p_event_id AND user_id = p_user_id;
    END;
  `);

  // ==================== CALENDAR PROCEDURES ====================

  await knex.raw(`
    CREATE PROCEDURE GetEventsForCalendar(IN p_year INT, IN p_month INT)
    BEGIN
      SELECT 
        e.id,
        e.name,
        e.start_date,
        e.end_date,
        e.is_all_day,
        e.venue_name,
        e.is_free,
        e.entry_fee,
        ec.name AS category_name,
        ec.color AS category_color,
        ec.icon AS category_icon,
        (SELECT file_url FROM event_image ei WHERE ei.event_id = e.id AND ei.is_primary = 1 LIMIT 1) AS primary_image
      FROM event e
      LEFT JOIN event_category ec ON e.event_category_id = ec.id
      WHERE e.status IN ('approved', 'published')
        AND (
          (YEAR(e.start_date) = p_year AND MONTH(e.start_date) = p_month)
          OR (YEAR(e.end_date) = p_year AND MONTH(e.end_date) = p_month)
          OR (e.start_date <= LAST_DAY(CONCAT(p_year, '-', p_month, '-01')) AND e.end_date >= CONCAT(p_year, '-', p_month, '-01'))
        )
      ORDER BY e.start_date ASC;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE GetEventDensityByMonth(IN p_year INT, IN p_month INT)
    BEGIN
      SELECT 
        DATE(e.start_date) AS event_date,
        COUNT(*) AS event_count
      FROM event e
      WHERE e.status IN ('approved', 'published')
        AND YEAR(e.start_date) = p_year
        AND MONTH(e.start_date) = p_month
      GROUP BY DATE(e.start_date)
      ORDER BY event_date;
    END;
  `);

  console.log('Event procedures created successfully.');
}

async function dropEventProcedures(knex) {
  const procedureNames = [
    'GetAllEvents', 'GetEventById', 'GetEventBySlug', 'InsertEvent', 'UpdateEvent', 'DeleteEvent',
    'GetAllEventCategories', 'GetEventCategoryById', 'InsertEventCategory', 'UpdateEventCategory', 'DeleteEventCategory',
    'GetAllEventTags', 'GetEventTagsByEventId', 'AddEventTag', 'RemoveEventTag', 'SyncEventTags',
    'GetEventImages', 'InsertEventImage', 'UpdateEventImage', 'DeleteEventImage', 'SetPrimaryEventImage',
    'GetEventSchedules', 'InsertEventSchedule', 'UpdateEventSchedule', 'DeleteEventSchedule',
    'SearchEvents', 'GetEventsByCategory', 'GetEventsByDateRange', 'GetEventsByLocation', 'GetNearbyEvents',
    'GetPendingEvents', 'ApproveEvent', 'RejectEvent', 'SubmitEventForApproval',
    'GetFeaturedEvents', 'SetEventFeatured', 'UpdateFeaturedConfig', 'GetFeaturedEventsForLocation',
    'GetEventReviews', 'InsertEventReview', 'UpdateEventReview', 'DeleteEventReview', 'GetEventAverageRating',
    'IncrementEventViews', 'GetEventStats', 'GetPopularEvents',
    'AddEventBookmark', 'RemoveEventBookmark', 'GetUserBookmarkedEvents', 'IsEventBookmarked',
    'GetEventsForCalendar', 'GetEventDensityByMonth'
  ];

  for (const name of procedureNames) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${name};`);
  }

  console.log('Event procedures dropped.');
}

export {
  createEventProcedures,
  dropEventProcedures
};
