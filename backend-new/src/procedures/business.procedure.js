/**
 * Business Stored Procedures
 * Handles business and business hours operations
 */

/**
 * Create business-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createBusinessProcedures(sequelize) {
  await sequelize.query(`
    CREATE PROCEDURE InsertBusiness(
      IN p_id CHAR(64),
      IN p_business_name VARCHAR(50),
      IN p_description TEXT,
      IN p_min_price FLOAT,
      IN p_max_price FLOAT,
      IN p_email VARCHAR(40),
      IN p_phone_number VARCHAR(14),
      IN p_barangay_id INT,
      IN p_address TEXT,
      IN p_owner_id CHAR(64),
      IN p_status VARCHAR(20),
      IN p_business_image TEXT,
      IN p_latitude VARCHAR(30),
      IN p_longitude VARCHAR(30),
      IN p_website_url TEXT,
      IN p_facebook_url TEXT,
      IN p_instagram_url TEXT,
      IN p_hasBooking TINYINT(1),
      IN p_hasStore TINYINT(1)
    )
    BEGIN
      INSERT INTO business (
        id, business_name, description, min_price, max_price, email, phone_number,
        barangay_id, address, owner_id, status, business_image, latitude, longitude,
        website_url, facebook_url, instagram_url, hasBooking, hasStore
      )
      VALUES (
        p_id, p_business_name, p_description, p_min_price, p_max_price, p_email, p_phone_number,
        p_barangay_id, p_address, p_owner_id, p_status, p_business_image, p_latitude, p_longitude,
        p_website_url, p_facebook_url, p_instagram_url, p_hasBooking, p_hasStore
      );
      SELECT * FROM business WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetBusinessById(IN p_id CHAR(64))
    BEGIN
      SELECT b.*, o.first_name AS owner_first_name, o.last_name AS owner_last_name
      FROM business b
      LEFT JOIN owner o ON b.owner_id = o.id
      WHERE b.id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetBusinessByOwnerId(IN p_owner_id CHAR(64))
    BEGIN
      SELECT b.*, o.first_name AS owner_first_name, o.last_name AS owner_last_name
      FROM business b
      LEFT JOIN owner o ON b.owner_id = o.id
      WHERE b.owner_id = p_owner_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateBusiness(
      IN p_id CHAR(64),
      IN p_business_name VARCHAR(50),
      IN p_description TEXT,
      IN p_min_price FLOAT,
      IN p_max_price FLOAT,
      IN p_email VARCHAR(40),
      IN p_phone_number VARCHAR(14),
      IN p_barangay_id INT,
      IN p_address TEXT,
      IN p_owner_id CHAR(64),
      IN p_status VARCHAR(20),
      IN p_business_image TEXT,
      IN p_latitude VARCHAR(30),
      IN p_longitude VARCHAR(30),
      IN p_website_url TEXT,
      IN p_facebook_url TEXT,
      IN p_instagram_url TEXT,
      IN p_hasBooking TINYINT(1),
      IN p_hasStore TINYINT(1)
    )
    BEGIN
      UPDATE business SET
        business_name = IFNULL(p_business_name, business_name),
        description = IFNULL(p_description, description),
        min_price = IFNULL(p_min_price, min_price),
        max_price = IFNULL(p_max_price, max_price),
        email = IFNULL(p_email, email),
        phone_number = IFNULL(p_phone_number, phone_number),
        barangay_id = IFNULL(p_barangay_id, barangay_id),
        address = IFNULL(p_address, address),
        owner_id = IFNULL(p_owner_id, owner_id),
        status = IFNULL(p_status, status),
        business_image = IFNULL(p_business_image, business_image),
        latitude = IFNULL(p_latitude, latitude),
        longitude = IFNULL(p_longitude, longitude),
        website_url = IFNULL(p_website_url, website_url),
        facebook_url = IFNULL(p_facebook_url, facebook_url),
        instagram_url = IFNULL(p_instagram_url, instagram_url),
        hasBooking = IFNULL(p_hasBooking, hasBooking),
        hasStore = IFNULL(p_hasStore, hasStore)
      WHERE id = p_id;
      SELECT * FROM business WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeleteBusiness(IN p_id CHAR(64))
    BEGIN
      DELETE FROM business WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetAllBusinesses()
    BEGIN
      SELECT b.*, o.first_name AS owner_first_name, o.last_name AS owner_last_name
      FROM business b
      LEFT JOIN owner o ON b.owner_id = o.id
      ORDER BY b.created_at DESC;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetBusinessesByStatus(IN p_status VARCHAR(20))
    BEGIN
      SELECT b.*, o.first_name AS owner_first_name, o.last_name AS owner_last_name
      FROM business b
      LEFT JOIN owner o ON b.owner_id = o.id
      WHERE b.status = p_status
      ORDER BY b.created_at DESC;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateBusinessStatus(IN p_id CHAR(64), IN p_status VARCHAR(20))
    BEGIN
      UPDATE business SET status = p_status WHERE id = p_id;
      SELECT * FROM business WHERE id = p_id;
    END;
  `);
}

/**
 * Drop business-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropBusinessProcedures(sequelize) {
  const procedures = [
    'InsertBusiness',
    'GetBusinessById',
    'GetBusinessByOwnerId',
    'UpdateBusiness',
    'DeleteBusiness',
    'GetAllBusinesses',
    'GetBusinessesByStatus',
    'UpdateBusinessStatus'
  ];

  for (const proc of procedures) {
    await sequelize.query(`DROP PROCEDURE IF EXISTS ${proc};`);
  }
}
