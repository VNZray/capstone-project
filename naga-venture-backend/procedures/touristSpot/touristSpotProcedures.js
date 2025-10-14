// Procedures for managing main tourist spot data.

export async function createTouristSpotProcedures(knex) {
  // Retrieves all tourist spots, their types, address details, categories, and images.
  await knex.raw(`
    CREATE PROCEDURE GetAllTouristSpots()
    BEGIN
      SELECT 
        ts.*, 
        t.type AS type,
        p.id AS province_id,
        p.province AS province,
        m.id AS municipality_id,
        m.municipality AS municipality,
        b.id AS barangay_id,
        b.barangay AS barangay
      FROM tourist_spots ts
      LEFT JOIN type t ON ts.type_id = t.id
      LEFT JOIN barangay b ON ts.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      WHERE ts.spot_status IN ('active','inactive')
      ORDER BY ts.name ASC;

      SELECT 
        tsc.tourist_spot_id,
        c.id,
        c.category,
        c.type_id
      FROM tourist_spot_categories tsc
      JOIN category c ON tsc.category_id = c.id
      JOIN tourist_spots ts ON ts.id = tsc.tourist_spot_id
      WHERE ts.spot_status IN ('active','inactive')
      ORDER BY c.category ASC;

      SELECT 
        id, tourist_spot_id, file_url, file_format, file_size, is_primary, alt_text, uploaded_at
      FROM tourist_spot_images
      WHERE tourist_spot_id IN (SELECT id FROM tourist_spots WHERE spot_status IN ('active','inactive'))
      ORDER BY is_primary DESC, uploaded_at ASC;
    END;
  `);

  // Retrieves a single tourist spot by ID, including its type, address, categories, and images.
  await knex.raw(`
    CREATE PROCEDURE GetTouristSpotById(IN p_id CHAR(36))
    BEGIN
      SELECT 
        ts.*, 
        t.type AS type,
        p.id AS province_id,
        p.province AS province,
        m.id AS municipality_id,
        m.municipality AS municipality,
        b.id AS barangay_id,
        b.barangay AS barangay
      FROM tourist_spots ts
      LEFT JOIN type t ON ts.type_id = t.id
      LEFT JOIN barangay b ON ts.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      WHERE ts.id = p_id;

      SELECT c.id, c.category, c.type_id 
      FROM tourist_spot_categories tsc
      JOIN category c ON tsc.category_id = c.id
      WHERE tsc.tourist_spot_id = p_id
      ORDER BY c.category ASC;

      SELECT 
        id, file_url, file_format, file_size, is_primary, alt_text, uploaded_at
      FROM tourist_spot_images 
      WHERE tourist_spot_id = p_id
      ORDER BY is_primary DESC, uploaded_at ASC;
    END;
  `);

  // Inserts a new tourist spot record
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
    IN p_type_id INT
    )
    BEGIN
      SET @newId = UUID();
      INSERT INTO tourist_spots (
        id, name, description, barangay_id,
        latitude, longitude, contact_phone, contact_email, website, entry_fee,
        type_id, spot_status
      ) VALUES (
        @newId, p_name, p_description, p_barangay_id,
        p_latitude, p_longitude, p_contact_phone, p_contact_email, p_website, p_entry_fee,
        p_type_id, 'pending'
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
    IN p_type_id INT
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
        type_id = p_type_id,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = p_id;
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);
}

export async function dropTouristSpotProcedures(knex) {
  const names = [
    'GetAllTouristSpots', 'GetTouristSpotById', 'InsertTouristSpot', 'UpdateTouristSpot'
  ];
  for (const n of names) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${n};`);
  }
}
