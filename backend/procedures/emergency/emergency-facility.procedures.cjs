/**
 * Emergency Facilities Stored Procedures
 * CRUD operations for emergency facilities management
 */

async function createEmergencyFacilityProcedures(knex) {
  // Get all emergency facilities
  await knex.raw(`
    CREATE PROCEDURE GetAllEmergencyFacilities()
    BEGIN
      SELECT
        ef.*,
        b.barangay AS barangay_name,
        m.municipality AS municipality_name,
        p.province AS province_name
      FROM emergency_facilities ef
      LEFT JOIN barangay b ON ef.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      ORDER BY ef.facility_type, ef.name;
    END;
  `);

  // Get all active emergency facilities (for mobile/public display)
  await knex.raw(`
    CREATE PROCEDURE GetActiveEmergencyFacilities()
    BEGIN
      SELECT
        ef.*,
        b.barangay AS barangay_name,
        m.municipality AS municipality_name,
        p.province AS province_name
      FROM emergency_facilities ef
      LEFT JOIN barangay b ON ef.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      WHERE ef.status = 'active'
      ORDER BY ef.facility_type, ef.name;
    END;
  `);

  // Get emergency facility by ID
  await knex.raw(`
    CREATE PROCEDURE GetEmergencyFacilityById(IN p_id CHAR(64))
    BEGIN
      SELECT
        ef.*,
        b.barangay AS barangay_name,
        m.municipality AS municipality_name,
        p.province AS province_name
      FROM emergency_facilities ef
      LEFT JOIN barangay b ON ef.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      WHERE ef.id = p_id;
    END;
  `);

  // Get emergency facilities by type
  await knex.raw(`
    CREATE PROCEDURE GetEmergencyFacilitiesByType(IN p_facility_type VARCHAR(50))
    BEGIN
      SELECT
        ef.*,
        b.barangay AS barangay_name,
        m.municipality AS municipality_name,
        p.province AS province_name
      FROM emergency_facilities ef
      LEFT JOIN barangay b ON ef.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      WHERE ef.facility_type = p_facility_type AND ef.status = 'active'
      ORDER BY ef.name;
    END;
  `);

  // Get emergency facilities by barangay
  await knex.raw(`
    CREATE PROCEDURE GetEmergencyFacilitiesByBarangay(IN p_barangay_id INT)
    BEGIN
      SELECT
        ef.*,
        b.barangay AS barangay_name,
        m.municipality AS municipality_name,
        p.province AS province_name
      FROM emergency_facilities ef
      LEFT JOIN barangay b ON ef.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      WHERE ef.barangay_id = p_barangay_id
      ORDER BY ef.facility_type, ef.name;
    END;
  `);

  // Insert emergency facility
  await knex.raw(`
    CREATE PROCEDURE InsertEmergencyFacility(
      IN p_id CHAR(64),
      IN p_name VARCHAR(255),
      IN p_description TEXT,
      IN p_facility_type VARCHAR(50),
      IN p_barangay_id INT,
      IN p_address TEXT,
      IN p_latitude DECIMAL(10,8),
      IN p_longitude DECIMAL(11,8),
      IN p_contact_phone VARCHAR(20),
      IN p_contact_email VARCHAR(255),
      IN p_emergency_hotline VARCHAR(20),
      IN p_operating_hours TEXT,
      IN p_facility_image VARCHAR(500),
      IN p_status VARCHAR(20),
      IN p_capacity INT,
      IN p_services_offered TEXT
    )
    BEGIN
      INSERT INTO emergency_facilities (
        id, name, description, facility_type, barangay_id, address,
        latitude, longitude, contact_phone, contact_email, emergency_hotline,
        operating_hours, facility_image, status, capacity, services_offered
      )
      VALUES (
        p_id, p_name, p_description, p_facility_type, p_barangay_id, p_address,
        p_latitude, p_longitude, p_contact_phone, p_contact_email, p_emergency_hotline,
        p_operating_hours, p_facility_image, p_status, p_capacity, p_services_offered
      );

      SELECT * FROM emergency_facilities WHERE id = p_id;
    END;
  `);

  // Update emergency facility
  await knex.raw(`
    CREATE PROCEDURE UpdateEmergencyFacility(
      IN p_id CHAR(64),
      IN p_name VARCHAR(255),
      IN p_description TEXT,
      IN p_facility_type VARCHAR(50),
      IN p_barangay_id INT,
      IN p_address TEXT,
      IN p_latitude DECIMAL(10,8),
      IN p_longitude DECIMAL(11,8),
      IN p_contact_phone VARCHAR(20),
      IN p_contact_email VARCHAR(255),
      IN p_emergency_hotline VARCHAR(20),
      IN p_operating_hours TEXT,
      IN p_facility_image VARCHAR(500),
      IN p_status VARCHAR(20),
      IN p_capacity INT,
      IN p_services_offered TEXT
    )
    BEGIN
      UPDATE emergency_facilities SET
        name = IFNULL(p_name, name),
        description = IFNULL(p_description, description),
        facility_type = IFNULL(p_facility_type, facility_type),
        barangay_id = IFNULL(p_barangay_id, barangay_id),
        address = IFNULL(p_address, address),
        latitude = IFNULL(p_latitude, latitude),
        longitude = IFNULL(p_longitude, longitude),
        contact_phone = IFNULL(p_contact_phone, contact_phone),
        contact_email = IFNULL(p_contact_email, contact_email),
        emergency_hotline = IFNULL(p_emergency_hotline, emergency_hotline),
        operating_hours = IFNULL(p_operating_hours, operating_hours),
        facility_image = IFNULL(p_facility_image, facility_image),
        status = IFNULL(p_status, status),
        capacity = IFNULL(p_capacity, capacity),
        services_offered = IFNULL(p_services_offered, services_offered)
      WHERE id = p_id;

      SELECT * FROM emergency_facilities WHERE id = p_id;
    END;
  `);

  // Delete emergency facility
  await knex.raw(`
    CREATE PROCEDURE DeleteEmergencyFacility(IN p_id CHAR(64))
    BEGIN
      DELETE FROM emergency_facilities WHERE id = p_id;
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);

  // Update emergency facility status
  await knex.raw(`
    CREATE PROCEDURE UpdateEmergencyFacilityStatus(
      IN p_id CHAR(64),
      IN p_status VARCHAR(20)
    )
    BEGIN
      UPDATE emergency_facilities SET status = p_status WHERE id = p_id;
      SELECT * FROM emergency_facilities WHERE id = p_id;
    END;
  `);

  // Get nearby emergency facilities (within radius in kilometers)
  await knex.raw(`
    CREATE PROCEDURE GetNearbyEmergencyFacilities(
      IN p_latitude DECIMAL(10,8),
      IN p_longitude DECIMAL(11,8),
      IN p_radius_km DECIMAL(10,2),
      IN p_facility_type VARCHAR(50)
    )
    BEGIN
      SELECT
        ef.*,
        b.barangay AS barangay_name,
        m.municipality AS municipality_name,
        p.province AS province_name,
        (6371 * ACOS(
          COS(RADIANS(p_latitude)) * COS(RADIANS(ef.latitude)) *
          COS(RADIANS(ef.longitude) - RADIANS(p_longitude)) +
          SIN(RADIANS(p_latitude)) * SIN(RADIANS(ef.latitude))
        )) AS distance_km
      FROM emergency_facilities ef
      LEFT JOIN barangay b ON ef.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      WHERE ef.status = 'active'
        AND ef.latitude IS NOT NULL
        AND ef.longitude IS NOT NULL
        AND (p_facility_type IS NULL OR ef.facility_type = p_facility_type)
      HAVING distance_km <= p_radius_km
      ORDER BY distance_km ASC;
    END;
  `);
}

async function dropEmergencyFacilityProcedures(knex) {
  const procedures = [
    'GetAllEmergencyFacilities',
    'GetActiveEmergencyFacilities',
    'GetEmergencyFacilityById',
    'GetEmergencyFacilitiesByType',
    'GetEmergencyFacilitiesByBarangay',
    'InsertEmergencyFacility',
    'UpdateEmergencyFacility',
    'DeleteEmergencyFacility',
    'UpdateEmergencyFacilityStatus',
    'GetNearbyEmergencyFacilities'
  ];

  for (const proc of procedures) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${proc}`);
  }
}

module.exports = { createEmergencyFacilityProcedures, dropEmergencyFacilityProcedures };
