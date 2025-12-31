/**
 * Tourist Spots Stored Procedures
 * Handles tourist spot entity operations
 */

/**
 * Create tourist spots-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createTouristSpotProcedures(sequelize) {
  await sequelize.query(`
    CREATE PROCEDURE InsertTouristSpot(
      IN p_id CHAR(64),
      IN p_name VARCHAR(255),
      IN p_description TEXT,
      IN p_barangay_id INT,
      IN p_latitude DECIMAL(10, 8),
      IN p_longitude DECIMAL(11, 8),
      IN p_contact_phone VARCHAR(20),
      IN p_contact_email VARCHAR(255),
      IN p_website VARCHAR(255),
      IN p_entry_fee DECIMAL(10, 2),
      IN p_spot_status ENUM('pending', 'active', 'inactive', 'rejected'),
      IN p_is_featured BOOLEAN
    )
    BEGIN
      INSERT INTO tourist_spots (
        id, name, description, barangay_id, latitude, longitude, contact_phone,
        contact_email, website, entry_fee, spot_status, is_featured
      ) VALUES (
        p_id, p_name, p_description, p_barangay_id, p_latitude, p_longitude, p_contact_phone,
        p_contact_email, p_website, p_entry_fee, IFNULL(p_spot_status, 'pending'), IFNULL(p_is_featured, FALSE)
      );
      SELECT * FROM tourist_spots WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetTouristSpotById(IN p_id CHAR(64))
    BEGIN
      SELECT ts.*, b.barangay, m.municipality, p.province
      FROM tourist_spots ts
      LEFT JOIN barangay b ON ts.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      WHERE ts.id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetAllTouristSpots()
    BEGIN
      SELECT ts.*, b.barangay, m.municipality, p.province
      FROM tourist_spots ts
      LEFT JOIN barangay b ON ts.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      ORDER BY ts.name;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetActiveTouristSpots()
    BEGIN
      SELECT ts.*, b.barangay, m.municipality, p.province
      FROM tourist_spots ts
      LEFT JOIN barangay b ON ts.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      WHERE ts.spot_status = 'active'
      ORDER BY ts.name;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetFeaturedTouristSpots()
    BEGIN
      SELECT ts.*, b.barangay, m.municipality, p.province
      FROM tourist_spots ts
      LEFT JOIN barangay b ON ts.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      WHERE ts.is_featured = TRUE AND ts.spot_status = 'active'
      ORDER BY ts.name;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateTouristSpot(
      IN p_id CHAR(64),
      IN p_name VARCHAR(255),
      IN p_description TEXT,
      IN p_barangay_id INT,
      IN p_latitude DECIMAL(10, 8),
      IN p_longitude DECIMAL(11, 8),
      IN p_contact_phone VARCHAR(20),
      IN p_contact_email VARCHAR(255),
      IN p_website VARCHAR(255),
      IN p_entry_fee DECIMAL(10, 2),
      IN p_spot_status ENUM('pending', 'active', 'inactive', 'rejected'),
      IN p_is_featured BOOLEAN
    )
    BEGIN
      UPDATE tourist_spots SET
        name = IFNULL(p_name, name),
        description = IFNULL(p_description, description),
        barangay_id = IFNULL(p_barangay_id, barangay_id),
        latitude = IFNULL(p_latitude, latitude),
        longitude = IFNULL(p_longitude, longitude),
        contact_phone = IFNULL(p_contact_phone, contact_phone),
        contact_email = IFNULL(p_contact_email, contact_email),
        website = IFNULL(p_website, website),
        entry_fee = IFNULL(p_entry_fee, entry_fee),
        spot_status = IFNULL(p_spot_status, spot_status),
        is_featured = IFNULL(p_is_featured, is_featured)
      WHERE id = p_id;
      SELECT * FROM tourist_spots WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateTouristSpotStatus(IN p_id CHAR(64), IN p_status ENUM('pending', 'active', 'inactive', 'rejected'))
    BEGIN
      UPDATE tourist_spots SET spot_status = p_status WHERE id = p_id;
      SELECT * FROM tourist_spots WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeleteTouristSpot(IN p_id CHAR(64))
    BEGIN
      DELETE FROM tourist_spots WHERE id = p_id;
    END;
  `);
}

/**
 * Drop tourist spots-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropTouristSpotProcedures(sequelize) {
  const procedures = [
    'InsertTouristSpot',
    'GetTouristSpotById',
    'GetAllTouristSpots',
    'GetActiveTouristSpots',
    'GetFeaturedTouristSpots',
    'UpdateTouristSpot',
    'UpdateTouristSpotStatus',
    'DeleteTouristSpot'
  ];

  for (const proc of procedures) {
    await sequelize.query(`DROP PROCEDURE IF EXISTS ${proc};`);
  }
}
