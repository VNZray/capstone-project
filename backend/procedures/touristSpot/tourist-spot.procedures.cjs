// Procedures for managing main tourist spot data.

async function createTouristSpotProcedures(knex) {
  // Retrieves all tourist spots, their address details, categories, and images.
  // Uses entity_categories join for category lookup.
  await knex.raw(`
    CREATE PROCEDURE GetAllTouristSpots()
    BEGIN
      SELECT
        ts.*,
        p.id AS province_id,
        p.province AS province,
        m.id AS municipality_id,
        m.municipality AS municipality,
        b.id AS barangay_id,
        b.barangay AS barangay
      FROM tourist_spots ts
      LEFT JOIN barangay b ON ts.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      WHERE ts.spot_status IN ('active','inactive')
      ORDER BY ts.name ASC;

      SELECT
        ec.entity_id AS tourist_spot_id,
        c.id,
        c.id AS category_id,
        c.title AS category,
        c.parent_category,
        GetCategoryTreeDepth(c.id) AS level
      FROM entity_categories ec
      JOIN categories c ON ec.category_id = c.id
      JOIN tourist_spots ts ON ts.id = ec.entity_id
      WHERE ec.entity_type = 'tourist_spot'
        AND ts.spot_status IN ('active','inactive')
      ORDER BY c.sort_order, c.title ASC;

      SELECT
        id, tourist_spot_id, file_url, file_format, file_size, is_primary, alt_text, uploaded_at
      FROM tourist_spot_images
      WHERE tourist_spot_id IN (SELECT id FROM tourist_spots WHERE spot_status IN ('active','inactive'))
      ORDER BY is_primary DESC, uploaded_at ASC;
    END;
  `);

  // Retrieves a single tourist spot by ID, including its address, categories, and images.
  await knex.raw(`
    CREATE PROCEDURE GetTouristSpotById(IN p_id CHAR(36))
    BEGIN
      SELECT
        ts.*,
        p.id AS province_id,
        p.province AS province,
        m.id AS municipality_id,
        m.municipality AS municipality,
        b.id AS barangay_id,
        b.barangay AS barangay
      FROM tourist_spots ts
      LEFT JOIN barangay b ON ts.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      WHERE ts.id = p_id;

      SELECT
        c.id,
        c.id AS category_id,
        c.title AS category,
        c.parent_category,
        GetCategoryTreeDepth(c.id) AS level,
        ec.is_primary
      FROM entity_categories ec
      JOIN categories c ON ec.category_id = c.id
      WHERE ec.entity_id = p_id AND ec.entity_type = 'tourist_spot'
      ORDER BY ec.is_primary DESC, c.sort_order, c.title ASC;

      SELECT
        id, file_url, file_format, file_size, is_primary, alt_text, uploaded_at
      FROM tourist_spot_images
      WHERE tourist_spot_id = p_id
      ORDER BY is_primary DESC, uploaded_at ASC;
    END;
  `);

  // Inserts a new tourist spot record (without type_id, uses entity_categories for classification)
  await knex.raw(`
    CREATE PROCEDURE InsertTouristSpot(
    IN p_name VARCHAR(255),
    IN p_description TEXT,
    IN p_barangay_id INT,
    IN p_latitude DECIMAL(10,8),
    IN p_longitude DECIMAL(11,8),
    IN p_contact_phone VARCHAR(20),
    IN p_contact_email VARCHAR(255),
    IN p_website VARCHAR(255),
    IN p_entry_fee DECIMAL(10,2),
    IN p_submitted_by CHAR(36),
    IN p_spot_status VARCHAR(20)
    )
    BEGIN
      SET @newId = UUID();
      INSERT INTO tourist_spots (
        id, name, description, barangay_id,
        latitude, longitude, contact_phone, contact_email, website, entry_fee,
        spot_status, submitted_by
      ) VALUES (
        @newId, p_name, p_description, p_barangay_id,
        p_latitude, p_longitude, p_contact_phone, p_contact_email, p_website, p_entry_fee,
        p_spot_status, p_submitted_by
      );
      SELECT @newId AS id;
    END;
  `);

  // Updates an existing tourist spot record
  await knex.raw(`
    CREATE PROCEDURE UpdateTouristSpot(
    IN p_id CHAR(36),
    IN p_name VARCHAR(255),
    IN p_description TEXT,
    IN p_barangay_id INT,
    IN p_latitude DECIMAL(10,8),
    IN p_longitude DECIMAL(11,8),
    IN p_contact_phone VARCHAR(20),
    IN p_contact_email VARCHAR(255),
    IN p_website VARCHAR(255),
    IN p_entry_fee DECIMAL(10,2),
    IN p_spot_status VARCHAR(20),
    IN p_is_featured BOOLEAN
    )
    BEGIN
      UPDATE tourist_spots SET
        name = p_name,
        description = p_description,
        barangay_id = p_barangay_id,
        latitude = p_latitude,
        longitude = p_longitude,
        contact_phone = p_contact_phone,
        contact_email = p_contact_email,
        website = p_website,
        entry_fee = p_entry_fee,
        spot_status = p_spot_status,
        is_featured = p_is_featured,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = p_id;
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);

  // Featured management procedures
  await knex.raw(`
    CREATE PROCEDURE GetFeaturedTouristSpots()
    BEGIN
      SELECT
        ts.*,
        p.id AS province_id,
        p.province AS province,
        m.id AS municipality_id,
        m.municipality AS municipality,
        b.id AS barangay_id,
        b.barangay AS barangay
      FROM tourist_spots ts
      LEFT JOIN barangay b ON ts.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      WHERE ts.is_featured = 1 AND ts.spot_status IN ('active','inactive')
      ORDER BY ts.name ASC;

      SELECT
        ec.entity_id AS tourist_spot_id,
        c.id,
        c.id AS category_id,
        c.title AS category,
        c.parent_category,
        GetCategoryTreeDepth(c.id) AS level
      FROM entity_categories ec
      JOIN categories c ON ec.category_id = c.id
      JOIN tourist_spots ts ON ts.id = ec.entity_id
      WHERE ec.entity_type = 'tourist_spot'
        AND ts.is_featured = 1
        AND ts.spot_status IN ('active','inactive')
      ORDER BY c.sort_order, c.title ASC;

      SELECT
        id, tourist_spot_id, file_url, file_format, file_size, is_primary, alt_text, uploaded_at
      FROM tourist_spot_images
      WHERE tourist_spot_id IN (SELECT id FROM tourist_spots WHERE is_featured = 1 AND spot_status IN ('active','inactive'))
      ORDER BY is_primary DESC, uploaded_at ASC;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE GetNonFeaturedTouristSpots()
    BEGIN
      SELECT
        ts.*,
        p.id AS province_id,
        p.province AS province,
        m.id AS municipality_id,
        m.municipality AS municipality,
        b.id AS barangay_id,
        b.barangay AS barangay
      FROM tourist_spots ts
      LEFT JOIN barangay b ON ts.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      WHERE ts.is_featured = 0 AND ts.spot_status IN ('active','inactive')
      ORDER BY ts.name ASC;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE FeatureTouristSpot(IN p_id CHAR(36))
    BEGIN
      UPDATE tourist_spots
      SET is_featured = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = p_id AND spot_status IN ('active','inactive');
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE UnfeatureTouristSpot(IN p_id CHAR(36))
    BEGIN
      UPDATE tourist_spots
      SET is_featured = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = p_id;
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE DeleteTouristSpot(IN p_id CHAR(36))
    BEGIN
      -- Delete related images
      DELETE FROM tourist_spot_images WHERE tourist_spot_id = p_id;

      -- Delete related schedules
      DELETE FROM tourist_spot_schedules WHERE tourist_spot_id = p_id;

      -- Delete related categories mapping
      DELETE FROM entity_categories WHERE entity_id = p_id AND entity_type = 'tourist_spot';

      -- Delete the tourist spot
      DELETE FROM tourist_spots WHERE id = p_id;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE RequestDeleteTouristSpot(IN p_id CHAR(36), IN p_requested_by CHAR(36))
    BEGIN
      UPDATE tourist_spots
      SET spot_status = 'pending_deletion', deletion_requested_by = p_requested_by
      WHERE id = p_id;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE GetMySubmittedTouristSpots(IN p_user_id CHAR(36))
    BEGIN
      SELECT
        ts.*,
        p.province, m.municipality, b.barangay,
        (SELECT remarks
         FROM approval_records ar
         WHERE ar.subject_id = ts.id
           AND ar.subject_type = 'tourist_spot'
           AND ar.decision = 'rejected'
         ORDER BY ar.decided_at DESC
         LIMIT 1) as rejection_reason
      FROM tourist_spots ts
      LEFT JOIN barangay b ON ts.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      WHERE ts.submitted_by = p_user_id OR ts.deletion_requested_by = p_user_id
      ORDER BY ts.updated_at DESC;
    END;
  `);
}

async function dropTouristSpotProcedures(knex) {
  const names = [
    'GetAllTouristSpots', 'GetTouristSpotById', 'InsertTouristSpot', 'UpdateTouristSpot',
    'GetFeaturedTouristSpots', 'GetNonFeaturedTouristSpots', 'FeatureTouristSpot', 'UnfeatureTouristSpot',
    'DeleteTouristSpot', 'RequestDeleteTouristSpot', 'GetMySubmittedTouristSpots'
  ];
  for (const n of names) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${n};`);
  }
}

module.exports = { createTouristSpotProcedures, dropTouristSpotProcedures };
