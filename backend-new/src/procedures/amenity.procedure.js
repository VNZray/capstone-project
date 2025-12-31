/**
 * Amenity Stored Procedures
 * Handles amenity and junction table operations
 */

/**
 * Create amenity-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createAmenityProcedures(sequelize) {
  await sequelize.query(`
    CREATE PROCEDURE InsertAmenity(
      IN p_name VARCHAR(100),
      IN p_slug VARCHAR(100),
      IN p_icon VARCHAR(60),
      IN p_is_active BOOLEAN
    )
    BEGIN
      INSERT INTO amenity (name, slug, icon, is_active)
      VALUES (p_name, p_slug, p_icon, IFNULL(p_is_active, TRUE));
      SELECT * FROM amenity WHERE id = LAST_INSERT_ID();
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetAmenityById(IN p_id INT)
    BEGIN
      SELECT * FROM amenity WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetAllAmenities()
    BEGIN
      SELECT * FROM amenity WHERE is_active = TRUE ORDER BY name;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateAmenity(
      IN p_id INT,
      IN p_name VARCHAR(100),
      IN p_slug VARCHAR(100),
      IN p_icon VARCHAR(60),
      IN p_is_active BOOLEAN
    )
    BEGIN
      UPDATE amenity SET
        name = IFNULL(p_name, name),
        slug = IFNULL(p_slug, slug),
        icon = IFNULL(p_icon, icon),
        is_active = IFNULL(p_is_active, is_active)
      WHERE id = p_id;
      SELECT * FROM amenity WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeleteAmenity(IN p_id INT)
    BEGIN
      DELETE FROM amenity WHERE id = p_id;
    END;
  `);

  // Business amenities procedures
  await sequelize.query(`
    CREATE PROCEDURE AddBusinessAmenity(IN p_business_id CHAR(64), IN p_amenity_id INT)
    BEGIN
      INSERT IGNORE INTO business_amenities (business_id, amenity_id) VALUES (p_business_id, p_amenity_id);
      SELECT ba.*, a.name, a.slug, a.icon
      FROM business_amenities ba
      JOIN amenity a ON ba.amenity_id = a.id
      WHERE ba.business_id = p_business_id AND ba.amenity_id = p_amenity_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetBusinessAmenities(IN p_business_id CHAR(64))
    BEGIN
      SELECT a.*
      FROM amenity a
      JOIN business_amenities ba ON a.id = ba.amenity_id
      WHERE ba.business_id = p_business_id AND a.is_active = TRUE
      ORDER BY a.name;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE RemoveBusinessAmenity(IN p_business_id CHAR(64), IN p_amenity_id INT)
    BEGIN
      DELETE FROM business_amenities WHERE business_id = p_business_id AND amenity_id = p_amenity_id;
    END;
  `);

  // Room amenities procedures
  await sequelize.query(`
    CREATE PROCEDURE AddRoomAmenity(IN p_room_id CHAR(64), IN p_amenity_id INT)
    BEGIN
      INSERT IGNORE INTO room_amenities (room_id, amenity_id) VALUES (p_room_id, p_amenity_id);
      SELECT ra.*, a.name, a.slug, a.icon
      FROM room_amenities ra
      JOIN amenity a ON ra.amenity_id = a.id
      WHERE ra.room_id = p_room_id AND ra.amenity_id = p_amenity_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetRoomAmenities(IN p_room_id CHAR(64))
    BEGIN
      SELECT a.*
      FROM amenity a
      JOIN room_amenities ra ON a.id = ra.amenity_id
      WHERE ra.room_id = p_room_id AND a.is_active = TRUE
      ORDER BY a.name;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE RemoveRoomAmenity(IN p_room_id CHAR(64), IN p_amenity_id INT)
    BEGIN
      DELETE FROM room_amenities WHERE room_id = p_room_id AND amenity_id = p_amenity_id;
    END;
  `);
}

/**
 * Drop amenity-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropAmenityProcedures(sequelize) {
  const procedures = [
    'InsertAmenity',
    'GetAmenityById',
    'GetAllAmenities',
    'UpdateAmenity',
    'DeleteAmenity',
    'AddBusinessAmenity',
    'GetBusinessAmenities',
    'RemoveBusinessAmenity',
    'AddRoomAmenity',
    'GetRoomAmenities',
    'RemoveRoomAmenity'
  ];

  for (const proc of procedures) {
    await sequelize.query(`DROP PROCEDURE IF EXISTS ${proc};`);
  }
}
