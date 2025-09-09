async function createBusinessProcedures(knex) {
  // Get all businesses
  await knex.raw(`
    CREATE PROCEDURE GetAllBusiness()
    BEGIN
      SELECT * FROM business;
    END;
  `);

  // Get business by owner ID
  await knex.raw(`
    CREATE PROCEDURE GetBusinessByOwnerId(IN ownerId CHAR(36))
    BEGIN
      SELECT * FROM business WHERE owner_id = ownerId;
    END;
  `);

  // Get business by ID
  await knex.raw(`
    CREATE PROCEDURE GetBusinessById(IN businessId CHAR(36))
    BEGIN
      SELECT * FROM business WHERE id = businessId;
    END;
  `);

  // Insert business
  await knex.raw(`
    CREATE PROCEDURE InsertBusiness(
      IN p_id CHAR(36),
      IN p_business_name VARCHAR(50),
      IN p_description TEXT,
      IN p_min_price FLOAT,
      IN p_max_price FLOAT,
      IN p_email VARCHAR(40),
      IN p_phone_number VARCHAR(14),
      IN p_business_category_id INT,
      IN p_business_type_id INT,
      IN p_province_id INT,
      IN p_municipality_id INT,
      IN p_barangay_id INT,
      IN p_address TEXT,
      IN p_owner_id CHAR(36),
      IN p_status ENUM('Pending','Active','Inactive','Maintenance'),
      IN p_business_image TEXT,
      IN p_latitude VARCHAR(30),
      IN p_longitude VARCHAR(30),
      IN p_x_url TEXT,
      IN p_website_url TEXT,
      IN p_facebook_url TEXT,
      IN p_instagram_url TEXT,
      IN p_hasBooking BOOLEAN
    )
    BEGIN
      INSERT INTO business (
        id, business_name, description, min_price, max_price, email, phone_number,
        business_category_id, business_type_id, province_id, municipality_id, barangay_id,
        address, owner_id, status, business_image, latitude, longitude,
        x_url, website_url, facebook_url, instagram_url, hasBooking
      )
      VALUES (
        p_id, p_business_name, p_description, p_min_price, p_max_price, p_email, p_phone_number,
        p_business_category_id, p_business_type_id, p_province_id, p_municipality_id, p_barangay_id,
        p_address, p_owner_id, p_status, p_business_image, p_latitude, p_longitude,
        p_x_url, p_website_url, p_facebook_url, p_instagram_url, p_hasBooking
      );

      SELECT * FROM business WHERE id = p_id;
    END;
  `);

  // Update business
  await knex.raw(`
    CREATE PROCEDURE UpdateBusiness(
      IN p_id CHAR(36),
      IN p_business_name VARCHAR(50),
      IN p_description TEXT,
      IN p_min_price FLOAT,
      IN p_max_price FLOAT,
      IN p_email VARCHAR(40),
      IN p_phone_number VARCHAR(14),
      IN p_business_category_id INT,
      IN p_business_type_id INT,
      IN p_province_id INT,
      IN p_municipality_id INT,
      IN p_barangay_id INT,
      IN p_address TEXT,
      IN p_owner_id CHAR(36),
      IN p_status ENUM('Pending','Active','Inactive','Maintenance'),
      IN p_business_image TEXT,
      IN p_latitude VARCHAR(30),
      IN p_longitude VARCHAR(30),
      IN p_x_url TEXT,
      IN p_website_url TEXT,
      IN p_facebook_url TEXT,
      IN p_instagram_url TEXT,
      IN p_hasBooking BOOLEAN
    )
    BEGIN
      UPDATE business SET
        business_name = p_business_name,
        description = p_description,
        min_price = p_min_price,
        max_price = p_max_price,
        email = p_email,
        phone_number = p_phone_number,
        business_category_id = p_business_category_id,
        business_type_id = p_business_type_id,
        province_id = p_province_id,
        municipality_id = p_municipality_id,
        barangay_id = p_barangay_id,
        address = p_address,
        owner_id = p_owner_id,
        status = p_status,
        business_image = p_business_image,
        latitude = p_latitude,
        longitude = p_longitude,
        x_url = p_x_url,
        website_url = p_website_url,
        facebook_url = p_facebook_url,
        instagram_url = p_instagram_url,
        hasBooking = p_hasBooking
      WHERE id = p_id;

      SELECT * FROM business WHERE id = p_id;
    END;
  `);

  // Delete business
  await knex.raw(`
    CREATE PROCEDURE DeleteBusiness(IN businessId CHAR(36))
    BEGIN
      DELETE FROM business WHERE id = businessId;
    END;
  `);
}

async function dropBusinessProcedures(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllBusiness;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetBusinessByOwnerId;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetBusinessById;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertBusiness;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateBusiness;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteBusiness;");
}

export default {
  createBusinessProcedures,
  dropBusinessProcedures,
};
