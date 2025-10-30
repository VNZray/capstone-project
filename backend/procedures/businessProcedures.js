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
    CREATE PROCEDURE GetBusinessByOwnerId(IN p_ownerId CHAR(64))
    BEGIN
      SELECT * FROM business WHERE owner_id = p_ownerId;
    END;
  `);

  // Get business by ID
  await knex.raw(`
    CREATE PROCEDURE GetBusinessById(IN p_businessId CHAR(64))
    BEGIN
      SELECT * FROM business WHERE id = p_businessId;
    END;
  `);

  // Insert business
  await knex.raw(`
    CREATE PROCEDURE InsertBusiness(
      IN p_id CHAR(64),
      IN p_business_name VARCHAR(50),
      IN p_description TEXT,
      IN p_min_price FLOAT,
      IN p_max_price FLOAT,
      IN p_email VARCHAR(40),
      IN p_phone_number VARCHAR(14),
      IN p_business_category_id INT,
      IN p_business_type_id INT,
      IN p_barangay_id INT,
      IN p_address TEXT,
      IN p_owner_id CHAR(64),
      IN p_status VARCHAR(20),
      IN p_business_image TEXT,
      IN p_latitude VARCHAR(30),
      IN p_longitude VARCHAR(30),
      IN p_x_url TEXT,
      IN p_website_url TEXT,
      IN p_facebook_url TEXT,
      IN p_instagram_url TEXT,
      IN p_hasBooking TINYINT(1)
    )
    BEGIN
      INSERT INTO business (
        id, business_name, description, min_price, max_price, email, phone_number,
        business_category_id, business_type_id, barangay_id,
        address, owner_id, status, business_image, latitude, longitude,
        x_url, website_url, facebook_url, instagram_url, hasBooking
      )
      VALUES (
        p_id, p_business_name, p_description, p_min_price, p_max_price, p_email, p_phone_number,
        p_business_category_id, p_business_type_id, p_barangay_id,
        p_address, p_owner_id, p_status, p_business_image, p_latitude, p_longitude,
        p_x_url, p_website_url, p_facebook_url, p_instagram_url, p_hasBooking
      );

      SELECT * FROM business WHERE id = p_id;
    END;
  `);

  // Update business
  await knex.raw(`
    CREATE PROCEDURE UpdateBusiness(
      IN p_id CHAR(64),
      IN p_business_name VARCHAR(50),
      IN p_description TEXT,
      IN p_min_price FLOAT,
      IN p_max_price FLOAT,
      IN p_email VARCHAR(40),
      IN p_phone_number VARCHAR(14),
      IN p_business_category_id INT,
      IN p_business_type_id INT,
      IN p_barangay_id INT,
      IN p_address TEXT,
      IN p_owner_id CHAR(64),
      IN p_status VARCHAR(20),
      IN p_business_image TEXT,
      IN p_latitude VARCHAR(30),
      IN p_longitude VARCHAR(30),
      IN p_x_url TEXT,
      IN p_website_url TEXT,
      IN p_facebook_url TEXT,
      IN p_instagram_url TEXT,
      IN p_hasBooking TINYINT(1)
    )
    BEGIN
      UPDATE business SET
        business_name = IFNULL(p_business_name, business_name),
        description = IFNULL(p_description, description),
        min_price = IFNULL(p_min_price, min_price),
        max_price = IFNULL(p_max_price, max_price),
        email = IFNULL(p_email, email),
        phone_number = IFNULL(p_phone_number, phone_number),
        business_category_id = IFNULL(p_business_category_id, business_category_id),
        business_type_id = IFNULL(p_business_type_id, business_type_id),
        barangay_id = IFNULL(p_barangay_id, barangay_id),
        address = IFNULL(p_address, address),
        owner_id = IFNULL(p_owner_id, owner_id),
        status = IFNULL(p_status, status),
        business_image = IFNULL(p_business_image, business_image),
        latitude = IFNULL(p_latitude, latitude),
        longitude = IFNULL(p_longitude, longitude),
        x_url = IFNULL(p_x_url, x_url),
        website_url = IFNULL(p_website_url, website_url),
        facebook_url = IFNULL(p_facebook_url, facebook_url),
        instagram_url = IFNULL(p_instagram_url, instagram_url),
        hasBooking = IFNULL(p_hasBooking, hasBooking)
      WHERE id = p_id;

      SELECT * FROM business WHERE id = p_id;
    END;
  `);

  // Delete business
  await knex.raw(`
    CREATE PROCEDURE DeleteBusiness(IN p_businessId CHAR(64))
    BEGIN
      DELETE FROM business WHERE id = p_businessId;
    END;
  `);

  // Get all business hours
  await knex.raw(`
    CREATE PROCEDURE GetAllBusinessHours()
    BEGIN
      SELECT * FROM business_hours ORDER BY business_id;
    END;
  `);

  // Get business hours by business ID
  await knex.raw(`
    CREATE PROCEDURE GetBusinessHoursByBusinessId(IN p_businessId CHAR(64))
    BEGIN
      SELECT * FROM business_hours WHERE business_id = p_businessId;
    END;
  `);

  // Insert business hours
  await knex.raw(`
    CREATE PROCEDURE InsertBusinessHours(
      IN p_business_id CHAR(64),
      IN p_day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'),
      IN p_open_time TIME,
      IN p_close_time TIME,
      IN p_is_open BOOLEAN
    )
    BEGIN
      INSERT INTO business_hours (
       business_id, day_of_week, open_time, close_time, is_open
      )
      VALUES (
         p_business_id, p_day_of_week, p_open_time, p_close_time, p_is_open
      );

      SELECT * FROM business_hours WHERE business_id = p_business_id AND day_of_week = p_day_of_week;
    END;
  `);

  // Update business hours
  await knex.raw(`
    CREATE PROCEDURE UpdateBusinessHours(
      IN p_id INT,
      IN p_open_time TIME,
      IN p_close_time TIME,
      IN p_is_open BOOLEAN
    )
    BEGIN
      UPDATE business_hours
      SET open_time = p_open_time,
          close_time = p_close_time,
          is_open = p_is_open
      WHERE id = p_id;

      SELECT * FROM business_hours WHERE id = p_id;
    END;
  `);

  // Delete business hours
  await knex.raw(`
    CREATE PROCEDURE DeleteBusinessHours(IN p_id INT)
    BEGIN
      DELETE FROM business_hours WHERE id = p_id;
    END;
  `);

  // Register business
  await knex.raw(`
    CREATE PROCEDURE RegisterBusiness (
      IN p_id CHAR(64),
      IN p_message TEXT,
      IN p_status ENUM('Pending', 'Approved', 'Rejected'),
      IN p_business_id CHAR(64),
      IN p_tourism_id CHAR(64)
    )
    BEGIN
      INSERT INTO registration (
        id, message, status, business_id, tourism_id
      ) VALUES (
        p_id, p_message, p_status, p_business_id, p_tourism_id
      );
      SELECT * FROM registration WHERE id = p_id;
    END;
  `);

  // Update business registration
  await knex.raw(`
    CREATE PROCEDURE UpdateBusinessRegistration(
      IN p_id CHAR(64),
      IN p_message TEXT,
      IN p_status ENUM('Pending', 'Approved', 'Rejected'),
      IN p_approved_at TIMESTAMP,
      IN p_business_id CHAR(64),
      IN p_tourism_id CHAR(64)
    )
    BEGIN
      UPDATE registration SET
        message = IFNULL(p_message, message),
        status = IFNULL(p_status, status),
        approved_at = IFNULL(p_approved_at, approved_at),
        business_id = IFNULL(p_business_id, business_id),
        tourism_id = IFNULL(p_tourism_id, tourism_id)
      WHERE id = p_id;

      SELECT * FROM registration WHERE id = p_id;
    END;
  `);

  // Get business registration by ID
  await knex.raw(`
    CREATE PROCEDURE GetBusinessRegistrationById(IN p_id CHAR(64))
    BEGIN
      SELECT * FROM registration WHERE id = p_id;
    END;
  `);

  // Get business registrations
  await knex.raw(`
    CREATE PROCEDURE GetBusinessRegistrations()
    BEGIN
      SELECT * FROM registration;
    END;
  `);

  // Delete business registration
  await knex.raw(`
    CREATE PROCEDURE DeleteBusinessRegistration(IN p_id CHAR(64))
    BEGIN
      DELETE FROM registration WHERE id = p_id;
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

  // Business Hours procedures
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllBusinessHours;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetBusinessHoursByBusinessId;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertBusinessHours;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateBusinessHours;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteBusinessHours;");

  // Registration procedures
  await knex.raw("DROP PROCEDURE IF EXISTS GetBusinessRegistrations;");
  await knex.raw("DROP PROCEDURE IF EXISTS RegisterBusiness;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateBusinessRegistration;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetBusinessRegistrationById;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteBusinessRegistration;");
}

export { createBusinessProcedures, dropBusinessProcedures };
