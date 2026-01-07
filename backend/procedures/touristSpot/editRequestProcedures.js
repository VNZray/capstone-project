// Edit request-related procedures
// Procedures for handling edit requests for tourist spots.

export async function createTouristSpotEditProcedures(knex) {
  // Submits an edit request for a tourist spot.
  // Returns: The ID of the newly created edit request
  // Note: type_id removed - using entity_categories table instead
  await knex.raw(`
    CREATE PROCEDURE SubmitTouristSpotEditRequest(
      IN p_tourist_spot_id CHAR(36),
      IN p_name VARCHAR(255),
      IN p_description TEXT,
      IN p_barangay_id INT,
      IN p_latitude DECIMAL(10,8),
      IN p_longitude DECIMAL(11,8),
      IN p_contact_phone VARCHAR(20),
      IN p_contact_email VARCHAR(255),
      IN p_website VARCHAR(255),
      IN p_entry_fee DECIMAL(10,2),
      IN p_spot_status ENUM('pending','active','inactive'),
      IN p_is_featured BOOLEAN,
      IN p_submitted_by CHAR(36)
    )
    BEGIN
      SET @editId = UUID();
      INSERT INTO tourist_spot_edits (
        id, tourist_spot_id, name, description, barangay_id,
        latitude, longitude, contact_phone, contact_email, website, entry_fee,
        spot_status, is_featured, approval_status, submitted_by
      ) VALUES (
        @editId, p_tourist_spot_id, p_name, p_description, p_barangay_id,
        p_latitude, p_longitude, p_contact_phone, p_contact_email, p_website, p_entry_fee,
        p_spot_status, p_is_featured, 'pending', p_submitted_by
      );
      SELECT @editId AS id;
    END;
  `);
}

export async function dropTouristSpotEditProcedures(knex) {
  const names = [
    'SubmitTouristSpotEditRequest'
  ];
  for (const n of names) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${n};`);
  }
}
