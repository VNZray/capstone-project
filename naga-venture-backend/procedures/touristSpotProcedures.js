async function createTouristSpotProcedures(knex) {
  // ================= READ PROCEDURES =================

  // Get all tourist spots with lookups + categories + images (3 result sets)
  await knex.raw(`
    CREATE PROCEDURE GetAllTouristSpots()
    BEGIN
      SELECT 
        ts.*, 
        t.type AS type,
        p.province AS province,
        m.municipality AS municipality,
        b.barangay AS barangay
      FROM tourist_spots ts
      LEFT JOIN type t ON ts.type_id = t.id
      LEFT JOIN province p ON ts.province_id = p.id
      LEFT JOIN municipality m ON ts.municipality_id = m.id
      LEFT JOIN barangay b ON ts.barangay_id = b.id
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

  // Get a single tourist spot + categories + images
  await knex.raw(`
    CREATE PROCEDURE GetTouristSpotById(IN p_id CHAR(36))
    BEGIN
      SELECT 
        ts.*, 
        t.type AS type,
        p.province AS province,
        m.municipality AS municipality,
        b.barangay AS barangay
      FROM tourist_spots ts
      LEFT JOIN type t ON ts.type_id = t.id
      LEFT JOIN province p ON ts.province_id = p.id
      LEFT JOIN municipality m ON ts.municipality_id = m.id
      LEFT JOIN barangay b ON ts.barangay_id = b.id
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

  // Categories and Types data
  await knex.raw(`
    CREATE PROCEDURE GetTouristSpotCategoriesAndTypes()
    BEGIN
      SELECT * FROM type ORDER BY type ASC;
      SELECT c.* 
      FROM category c 
      INNER JOIN type t ON c.type_id = t.id 
      WHERE t.id = 4 
      ORDER BY c.category ASC;
    END;
  `);

  // Location data procedures
  await knex.raw(`
    CREATE PROCEDURE GetLocationData()
    BEGIN
      SELECT * FROM province ORDER BY province ASC;
      SELECT * FROM municipality ORDER BY municipality ASC;
      SELECT * FROM barangay ORDER BY barangay ASC;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE GetMunicipalitiesByProvince(IN p_province_id INT)
    BEGIN
      SELECT * FROM municipality WHERE province_id = p_province_id ORDER BY municipality ASC;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE GetBarangaysByMunicipality(IN p_municipality_id INT)
    BEGIN
      SELECT * FROM barangay WHERE municipality_id = p_municipality_id ORDER BY barangay ASC;
    END;
  `);

  // Tourist spot categories
  await knex.raw(`
    CREATE PROCEDURE GetTouristSpotCategories(IN p_id CHAR(36))
    BEGIN
      SELECT 
        c.id,
        c.category,
        c.type_id
      FROM tourist_spot_categories tsc
      JOIN category c ON tsc.category_id = c.id
      WHERE tsc.tourist_spot_id = p_id
      ORDER BY c.category ASC;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE DeleteCategoriesByTouristSpot(IN p_id CHAR(36))
    BEGIN
      DELETE FROM tourist_spot_categories WHERE tourist_spot_id = p_id;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE InsertTouristSpotCategory(IN p_id CHAR(36), IN p_category_id INT)
    BEGIN
      INSERT INTO tourist_spot_categories (id, tourist_spot_id, category_id)
      VALUES (UUID(), p_id, p_category_id);
    END;
  `);

  // Schedules
  await knex.raw(`
    CREATE PROCEDURE GetTouristSpotSchedules(IN p_id CHAR(36))
    BEGIN
      SELECT * FROM tourist_spot_schedules WHERE tourist_spot_id = p_id ORDER BY day_of_week ASC;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE DeleteSchedulesByTouristSpot(IN p_id CHAR(36))
    BEGIN
      DELETE FROM tourist_spot_schedules WHERE tourist_spot_id = p_id;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE InsertTouristSpotSchedule(
      IN p_tourist_spot_id CHAR(36),
      IN p_day_of_week TINYINT,
      IN p_open_time TIME,
      IN p_close_time TIME,
      IN p_is_closed BOOLEAN
    )
    BEGIN
      INSERT INTO tourist_spot_schedules (id, tourist_spot_id, day_of_week, open_time, close_time, is_closed)
      VALUES (UUID(), p_tourist_spot_id, p_day_of_week, p_open_time, p_close_time, p_is_closed);
    END;
  `);

  // Images
  await knex.raw(`
    CREATE PROCEDURE GetTouristSpotImages(IN p_tourist_spot_id CHAR(36))
    BEGIN
      SELECT 
        id, tourist_spot_id, file_url, file_format, file_size, 
        is_primary, alt_text, uploaded_at, updated_at
      FROM tourist_spot_images 
      WHERE tourist_spot_id = p_tourist_spot_id 
      ORDER BY is_primary DESC, uploaded_at ASC;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE AddTouristSpotImage(
      IN p_tourist_spot_id CHAR(36),
      IN p_file_url TEXT,
      IN p_file_format VARCHAR(10),
      IN p_file_size BIGINT,
      IN p_is_primary BOOLEAN,
      IN p_alt_text VARCHAR(255)
    )
    BEGIN
      IF p_is_primary THEN
        UPDATE tourist_spot_images SET is_primary = FALSE WHERE tourist_spot_id = p_tourist_spot_id;
      END IF;
      SET @imgId = UUID();
      INSERT INTO tourist_spot_images (id, tourist_spot_id, file_url, file_format, file_size, is_primary, alt_text)
      VALUES (@imgId, p_tourist_spot_id, p_file_url, p_file_format, p_file_size, p_is_primary, p_alt_text);
      SELECT * FROM tourist_spot_images WHERE id = @imgId;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE UpdateTouristSpotImage(
      IN p_tourist_spot_id CHAR(36),
      IN p_image_id CHAR(36),
      IN p_is_primary BOOLEAN,
      IN p_alt_text VARCHAR(255)
    )
    BEGIN
      IF p_is_primary THEN
        UPDATE tourist_spot_images SET is_primary = FALSE WHERE tourist_spot_id = p_tourist_spot_id;
      END IF;
      UPDATE tourist_spot_images 
      SET 
        is_primary = IFNULL(p_is_primary, is_primary),
        alt_text = IFNULL(p_alt_text, alt_text)
      WHERE id = p_image_id AND tourist_spot_id = p_tourist_spot_id;
      SELECT * FROM tourist_spot_images WHERE id = p_image_id;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE DeleteTouristSpotImage(
      IN p_tourist_spot_id CHAR(36),
      IN p_image_id CHAR(36)
    )
    BEGIN
      DELETE FROM tourist_spot_images WHERE id = p_image_id AND tourist_spot_id = p_tourist_spot_id;
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE SetPrimaryTouristSpotImage(
      IN p_tourist_spot_id CHAR(36),
      IN p_image_id CHAR(36)
    )
    BEGIN
      UPDATE tourist_spot_images SET is_primary = FALSE WHERE tourist_spot_id = p_tourist_spot_id;
      UPDATE tourist_spot_images SET is_primary = TRUE WHERE id = p_image_id AND tourist_spot_id = p_tourist_spot_id;
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);

  // Create & Update tourist spot (main record)
  await knex.raw(`
    CREATE PROCEDURE InsertTouristSpot(
      IN p_name VARCHAR(255),
      IN p_description TEXT,
      IN p_province_id INT,
      IN p_municipality_id INT,
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
        id, name, description, province_id, municipality_id, barangay_id,
        latitude, longitude, contact_phone, contact_email, website, entry_fee,
        type_id, spot_status
      ) VALUES (
        @newId, p_name, p_description, p_province_id, p_municipality_id, p_barangay_id,
        p_latitude, p_longitude, p_contact_phone, p_contact_email, p_website, p_entry_fee,
        p_type_id, 'pending'
      );
      SELECT @newId AS id;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE UpdateTouristSpot(
      IN p_id CHAR(36),
      IN p_name VARCHAR(255),
      IN p_description TEXT,
      IN p_province_id INT,
      IN p_municipality_id INT,
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
        province_id = p_province_id,
        municipality_id = p_municipality_id,
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

  // ================= VALIDATION / HELPERS =================
  await knex.raw(`
    CREATE PROCEDURE CheckTouristSpotExists(IN p_id CHAR(36))
    BEGIN
      SELECT COUNT(*) AS cnt FROM tourist_spots WHERE id = p_id;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE CheckProvinceExists(IN p_id INT)
    BEGIN
      SELECT COUNT(*) AS cnt FROM province WHERE id = p_id;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE CheckTypeExists(IN p_id INT)
    BEGIN
      SELECT COUNT(*) AS cnt FROM type WHERE id = p_id;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE ValidateMunicipalityInProvince(IN p_municipality_id INT, IN p_province_id INT)
    BEGIN
      SELECT COUNT(*) AS cnt FROM municipality WHERE id = p_municipality_id AND province_id = p_province_id;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE ValidateBarangayInMunicipality(IN p_barangay_id INT, IN p_municipality_id INT)
    BEGIN
      SELECT COUNT(*) AS cnt FROM barangay WHERE id = p_barangay_id AND municipality_id = p_municipality_id;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE ValidateCategoriesForType(IN p_type_id INT, IN p_category_ids_csv TEXT)
    BEGIN
      SELECT COUNT(*) AS matched_count
      FROM category
      WHERE FIND_IN_SET(id, p_category_ids_csv) AND type_id = p_type_id;
    END;
  `);
}

async function dropTouristSpotProcedures(knex) {
  const names = [
    'GetAllTouristSpots', 'GetTouristSpotById', 'GetTouristSpotCategoriesAndTypes', 'GetLocationData',
    'GetMunicipalitiesByProvince', 'GetBarangaysByMunicipality', 'GetTouristSpotCategories',
    'DeleteCategoriesByTouristSpot', 'InsertTouristSpotCategory', 'GetTouristSpotSchedules',
    'DeleteSchedulesByTouristSpot', 'InsertTouristSpotSchedule', 'GetTouristSpotImages',
    'AddTouristSpotImage', 'UpdateTouristSpotImage', 'DeleteTouristSpotImage', 'SetPrimaryTouristSpotImage',
  'InsertTouristSpot', 'UpdateTouristSpot',
  'CheckTouristSpotExists', 'CheckProvinceExists', 'CheckTypeExists',
  'ValidateMunicipalityInProvince', 'ValidateBarangayInMunicipality', 'ValidateCategoriesForType'
  ];
  for (const n of names) {
    // Drop if exists
    // eslint-disable-next-line no-await-in-loop
    await knex.raw(`DROP PROCEDURE IF EXISTS ${n};`);
  }
}

export { createTouristSpotProcedures, dropTouristSpotProcedures };
// Additional, edit-related procedures in a separate creator to allow additive migrations
async function createTouristSpotEditProcedures(knex) {
  await knex.raw(`
    CREATE PROCEDURE ValidateCategoriesExistCSV(IN p_category_ids_csv TEXT)
    BEGIN
      SELECT COUNT(*) AS matched_count
      FROM category
      WHERE FIND_IN_SET(id, p_category_ids_csv);
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE HasPendingEditRequest(IN p_tourist_spot_id CHAR(36))
    BEGIN
      SELECT COUNT(*) AS pending_count
      FROM tourist_spot_edits
      WHERE tourist_spot_id = p_tourist_spot_id AND approval_status = 'pending';
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE SubmitTouristSpotEditRequest(
      IN p_tourist_spot_id CHAR(36),
      IN p_name VARCHAR(255),
      IN p_description TEXT,
      IN p_province_id INT,
      IN p_municipality_id INT,
      IN p_barangay_id INT,
      IN p_latitude DECIMAL(10,8),
      IN p_longitude DECIMAL(11,8),
      IN p_contact_phone VARCHAR(20),
      IN p_contact_email VARCHAR(255),
      IN p_website VARCHAR(255),
      IN p_entry_fee DECIMAL(10,2),
      IN p_spot_status ENUM('pending','active','inactive'),
      IN p_is_featured BOOLEAN,
      IN p_type_id INT
    )
    BEGIN
      SET @editId = UUID();
      INSERT INTO tourist_spot_edits (
        id, tourist_spot_id, name, description, province_id, municipality_id, barangay_id,
        latitude, longitude, contact_phone, contact_email, website, entry_fee,
        spot_status, is_featured, type_id, approval_status
      ) VALUES (
        @editId, p_tourist_spot_id, p_name, p_description, p_province_id, p_municipality_id, p_barangay_id,
        p_latitude, p_longitude, p_contact_phone, p_contact_email, p_website, p_entry_fee,
        p_spot_status, p_is_featured, p_type_id, 'pending'
      );
      SELECT @editId AS id;
    END;
  `);
}

async function dropTouristSpotEditProcedures(knex) {
  const names = [
    'ValidateCategoriesExistCSV', 'HasPendingEditRequest', 'SubmitTouristSpotEditRequest'
  ];
  for (const n of names) {
    // eslint-disable-next-line no-await-in-loop
    await knex.raw(`DROP PROCEDURE IF EXISTS ${n};`);
  }
}

export { createTouristSpotEditProcedures, dropTouristSpotEditProcedures };
async function createTouristSpotAdditionalHelpers(knex) {
  await knex.raw(`
    CREATE PROCEDURE UpdateTouristSpotTimestamp(IN p_id CHAR(36))
    BEGIN
      UPDATE tourist_spots SET updated_at = CURRENT_TIMESTAMP WHERE id = p_id;
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);
}

async function dropTouristSpotAdditionalHelpers(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateTouristSpotTimestamp;");
}

export { createTouristSpotAdditionalHelpers, dropTouristSpotAdditionalHelpers };

// ======================= APPROVAL PROCEDURES =======================
async function createTouristSpotApprovalProcedures(knex) {
  // Pending edit requests (2 result sets: rows, current categories)
  await knex.raw(`
    CREATE PROCEDURE GetPendingEditRequests()
    BEGIN
      SELECT 
        tse.*,
        t.type,
        p.province,
        m.municipality,
        b.barangay,
        ts.name AS original_name,
        ts.description AS original_description,
        ot.type AS original_type,
        op.province AS original_province,
        om.municipality AS original_municipality,
        ob.barangay AS original_barangay,
        ts.contact_phone AS original_contact_phone,
        ts.website AS original_website,
        ts.entry_fee AS original_entry_fee,
        ts.spot_status AS original_status
      FROM tourist_spot_edits tse
      JOIN type t ON tse.type_id = t.id
      JOIN province p ON tse.province_id = p.id
      JOIN municipality m ON tse.municipality_id = m.id
      JOIN barangay b ON tse.barangay_id = b.id
      JOIN tourist_spots ts ON tse.tourist_spot_id = ts.id
      LEFT JOIN province op ON ts.province_id = op.id
      LEFT JOIN municipality om ON ts.municipality_id = om.id
      LEFT JOIN barangay ob ON ts.barangay_id = ob.id
      LEFT JOIN type ot ON ts.type_id = ot.id
      WHERE tse.approval_status = 'pending'
      ORDER BY tse.submitted_at DESC;

      SELECT 
        tsc.tourist_spot_id,
        c.id,
        c.category,
        c.type_id
      FROM tourist_spot_categories tsc
      JOIN category c ON tsc.category_id = c.id
      WHERE tsc.tourist_spot_id IN (
        SELECT tourist_spot_id FROM tourist_spot_edits WHERE approval_status = 'pending'
      )
      ORDER BY c.category ASC;
    END;
  `);

  // Pending tourist spots (2 result sets: rows, categories)
  await knex.raw(`
    CREATE PROCEDURE GetPendingTouristSpots()
    BEGIN
      SELECT 
        ts.id, ts.name, ts.description, ts.province_id, ts.municipality_id, ts.barangay_id,
        ts.latitude, ts.longitude, ts.contact_phone, ts.contact_email, ts.website, ts.entry_fee,
        ts.spot_status, ts.is_featured, t.type, ts.type_id,
        ts.created_at, ts.updated_at, p.province, m.municipality, b.barangay
      FROM tourist_spots ts
      JOIN type t ON ts.type_id = t.id
      JOIN province p ON ts.province_id = p.id
      JOIN municipality m ON ts.municipality_id = m.id
      JOIN barangay b ON ts.barangay_id = b.id
      WHERE ts.spot_status = 'pending'
      ORDER BY ts.created_at DESC;

      SELECT 
        tsc.tourist_spot_id,
        c.id,
        c.category,
        c.type_id
      FROM tourist_spot_categories tsc
      JOIN category c ON tsc.category_id = c.id
      WHERE tsc.tourist_spot_id IN (
        SELECT id FROM tourist_spots WHERE spot_status = 'pending'
      )
      ORDER BY c.category ASC;
    END;
  `);

  // Approve spot
  await knex.raw(`
    CREATE PROCEDURE ApproveTouristSpot(IN p_id CHAR(36))
    BEGIN
      SELECT spot_status AS current_status FROM tourist_spots WHERE id = p_id;
      UPDATE tourist_spots 
      SET spot_status = 'active', updated_at = CURRENT_TIMESTAMP 
      WHERE id = p_id AND spot_status = 'pending';
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);

  // Approve edit request (transactional)
  await knex.raw(`
    CREATE PROCEDURE ApproveTouristSpotEdit(IN p_edit_id CHAR(36))
    BEGIN
      DECLARE v_exists INT DEFAULT 0;
      SELECT COUNT(*) INTO v_exists FROM tourist_spot_edits WHERE id = p_edit_id AND approval_status = 'pending';
      IF v_exists = 0 THEN
        SELECT 'not_found' AS status;
      ELSE
        START TRANSACTION;
        UPDATE tourist_spots ts
          JOIN tourist_spot_edits tse ON tse.id = p_edit_id AND ts.id = tse.tourist_spot_id
        SET ts.name = tse.name,
            ts.description = tse.description,
            ts.province_id = tse.province_id,
            ts.municipality_id = tse.municipality_id,
            ts.barangay_id = tse.barangay_id,
            ts.latitude = tse.latitude,
            ts.longitude = tse.longitude,
            ts.contact_phone = tse.contact_phone,
            ts.contact_email = tse.contact_email,
            ts.website = tse.website,
            ts.entry_fee = tse.entry_fee,
            ts.spot_status = tse.spot_status,
            ts.is_featured = tse.is_featured,
            ts.type_id = tse.type_id,
            ts.updated_at = CURRENT_TIMESTAMP;

        UPDATE tourist_spot_edits 
        SET approval_status = 'approved', reviewed_at = CURRENT_TIMESTAMP
        WHERE id = p_edit_id;

        COMMIT;
        SELECT 'approved' AS status;
      END IF;
    END;
  `);

  // Reject edit request
  await knex.raw(`
    CREATE PROCEDURE RejectTouristSpotEdit(IN p_edit_id CHAR(36), IN p_reason VARCHAR(255))
    BEGIN
      UPDATE tourist_spot_edits
      SET approval_status = 'rejected', reviewed_at = CURRENT_TIMESTAMP, remarks = IFNULL(p_reason, '')
      WHERE id = p_edit_id AND approval_status = 'pending';
      SELECT id, approval_status, remarks, reviewed_at FROM tourist_spot_edits WHERE id = p_edit_id;
    END;
  `);

  // Reject spot
  await knex.raw(`
    CREATE PROCEDURE RejectTouristSpot(IN p_id CHAR(36))
    BEGIN
      UPDATE tourist_spots SET spot_status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = p_id AND spot_status = 'pending';
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);
}

async function dropTouristSpotApprovalProcedures(knex) {
  const names = [
    'GetPendingEditRequests', 'GetPendingTouristSpots', 'ApproveTouristSpot',
    'ApproveTouristSpotEdit', 'RejectTouristSpotEdit', 'RejectTouristSpot'
  ];
  for (const n of names) {
    // eslint-disable-next-line no-await-in-loop
    await knex.raw(`DROP PROCEDURE IF EXISTS ${n};`);
  }
}

export { createTouristSpotApprovalProcedures, dropTouristSpotApprovalProcedures };
