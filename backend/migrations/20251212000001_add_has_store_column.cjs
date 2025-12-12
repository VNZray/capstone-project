/**
 * Migration: Add hasStore column to business table
 * 
 * This migration adds a `hasStore` boolean column to support businesses
 * that can have store/shop capabilities independently of booking capabilities.
 * 
 * Business capability combinations:
 * - hasBooking: true, hasStore: false  → Accommodation only
 * - hasBooking: false, hasStore: true  → Shop only
 * - hasBooking: true, hasStore: true   → Both capabilities
 * - hasBooking: false, hasStore: false → Neither (edge case)
 */

exports.up = async function (knex) {
  // Check if column already exists
  const hasColumn = await knex.schema.hasColumn('business', 'hasStore');
  
  if (!hasColumn) {
    await knex.schema.alterTable('business', function (table) {
      // Add hasStore column - defaults to true for existing shops (where hasBooking is false)
      table.boolean('hasStore').nullable().defaultTo(false).after('hasBooking');
    });
    
    // Update existing businesses:
    // - If hasBooking is false (shop), set hasStore to true
    // - If hasBooking is true (accommodation), keep hasStore as false
    await knex.raw(`
      UPDATE business 
      SET hasStore = CASE 
        WHEN hasBooking = 0 OR hasBooking IS NULL THEN 1 
        ELSE 0 
      END
    `);
    
    console.log('Added hasStore column to business table and migrated existing data.');
  } else {
    console.log('hasStore column already exists, skipping.');
  }

  // Update InsertBusiness procedure to include hasStore
  await knex.raw(`DROP PROCEDURE IF EXISTS InsertBusiness`);
  await knex.raw(`
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

  // Update UpdateBusiness procedure to include hasStore
  await knex.raw(`DROP PROCEDURE IF EXISTS UpdateBusiness`);
  await knex.raw(`
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

  console.log('Updated InsertBusiness and UpdateBusiness procedures with hasStore parameter.');
};

exports.down = async function (knex) {
  const hasColumn = await knex.schema.hasColumn('business', 'hasStore');
  
  if (hasColumn) {
    await knex.schema.alterTable('business', function (table) {
      table.dropColumn('hasStore');
    });
    
    console.log('Removed hasStore column from business table.');
  }

  // Restore original procedures without hasStore
  await knex.raw(`DROP PROCEDURE IF EXISTS InsertBusiness`);
  await knex.raw(`
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
      IN p_hasBooking TINYINT(1)
    )
    BEGIN
      INSERT INTO business (
        id, business_name, description, min_price, max_price, email, phone_number,
        barangay_id, address, owner_id, status, business_image, latitude, longitude,
        website_url, facebook_url, instagram_url, hasBooking
      )
      VALUES (
        p_id, p_business_name, p_description, p_min_price, p_max_price, p_email, p_phone_number,
        p_barangay_id, p_address, p_owner_id, p_status, p_business_image, p_latitude, p_longitude,
        p_website_url, p_facebook_url, p_instagram_url, p_hasBooking
      );

      SELECT * FROM business WHERE id = p_id;
    END;
  `);

  await knex.raw(`DROP PROCEDURE IF EXISTS UpdateBusiness`);
  await knex.raw(`
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
        hasBooking = IFNULL(p_hasBooking, hasBooking)
      WHERE id = p_id;

      SELECT * FROM business WHERE id = p_id;
    END;
  `);

  console.log('Restored original InsertBusiness and UpdateBusiness procedures.');
};
