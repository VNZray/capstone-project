async function createServiceProcedures(knex) {
  // ==================== SERVICES (DISPLAY-ONLY) ====================
  
  // Get all services
  await knex.raw(`
    CREATE PROCEDURE GetAllServices()
    BEGIN
      SELECT 
        s.*, 
        sc.name AS category_name,
        b.business_name
      FROM service s 
      LEFT JOIN shop_category sc ON s.shop_category_id = sc.id 
      LEFT JOIN business b ON s.business_id = b.id 
      WHERE s.status = 'active'
      ORDER BY s.created_at DESC;
    END;
  `);

  // Get services by business ID
  await knex.raw(`
    CREATE PROCEDURE GetServicesByBusinessId(IN p_businessId CHAR(64))
    BEGIN
      SELECT 
        s.*, 
        sc.name AS category_name
      FROM service s 
      LEFT JOIN shop_category sc ON s.shop_category_id = sc.id 
      WHERE s.business_id = p_businessId
      ORDER BY s.display_order, s.name;
    END;
  `);

  // Get services by category ID
  await knex.raw(`
    CREATE PROCEDURE GetServicesByCategoryId(IN p_categoryId CHAR(64))
    BEGIN
      SELECT s.*
      FROM service s 
      WHERE s.shop_category_id = p_categoryId AND s.status = 'active'
      ORDER BY s.display_order, s.name;
    END;
  `);

  // Get service by ID with details
  await knex.raw(`
    CREATE PROCEDURE GetServiceById(IN p_serviceId CHAR(64))
    BEGIN
      SELECT 
        s.*, 
        sc.name AS category_name,
        b.business_name
      FROM service s 
      LEFT JOIN shop_category sc ON s.shop_category_id = sc.id 
      LEFT JOIN business b ON s.business_id = b.id 
      WHERE s.id = p_serviceId;
    END;
  `);

  // Insert service
  await knex.raw(`
    CREATE PROCEDURE InsertService(
      IN p_id CHAR(64),
      IN p_business_id CHAR(64),
      IN p_shop_category_id CHAR(64),
      IN p_name VARCHAR(255),
      IN p_description TEXT,
      IN p_base_price DECIMAL(10,2),
      IN p_price_type VARCHAR(50),
      IN p_image_url VARCHAR(500),
      IN p_requirements TEXT,
      IN p_contact_methods JSON,
      IN p_contact_notes TEXT,
      IN p_display_order INT,
      IN p_status VARCHAR(20)
    )
    BEGIN
      INSERT INTO service (
        id, business_id, shop_category_id, name, description, base_price, price_type,
        image_url, requirements, contact_methods, contact_notes, display_order, status
      ) VALUES (
        p_id, p_business_id, p_shop_category_id, p_name, p_description, p_base_price, p_price_type,
        p_image_url, p_requirements, 
        IFNULL(p_contact_methods, JSON_ARRAY()), p_contact_notes, IFNULL(p_display_order, 0), IFNULL(p_status, 'active')
      );
      
      SELECT 
        s.*, 
        sc.name AS category_name
      FROM service s 
      LEFT JOIN shop_category sc ON s.shop_category_id = sc.id 
      WHERE s.id = p_id;
    END;
  `);

  // Update service
  await knex.raw(`
    CREATE PROCEDURE UpdateService(
      IN p_id CHAR(64),
      IN p_shop_category_id CHAR(64),
      IN p_name VARCHAR(255),
      IN p_description TEXT,
      IN p_base_price DECIMAL(10,2),
      IN p_price_type VARCHAR(50),
      IN p_image_url VARCHAR(500),
      IN p_requirements TEXT,
      IN p_contact_methods JSON,
      IN p_contact_notes TEXT,
      IN p_display_order INT,
      IN p_status VARCHAR(20)
    )
    BEGIN
      UPDATE service SET
        shop_category_id = IFNULL(p_shop_category_id, shop_category_id),
        name = IFNULL(p_name, name),
        description = IFNULL(p_description, description),
        base_price = IFNULL(p_base_price, base_price),
        price_type = IFNULL(p_price_type, price_type),
        image_url = IFNULL(p_image_url, image_url),
        requirements = IFNULL(p_requirements, requirements),
        contact_methods = IFNULL(p_contact_methods, contact_methods),
        contact_notes = IFNULL(p_contact_notes, contact_notes),
        display_order = IFNULL(p_display_order, display_order),
        status = IFNULL(p_status, status),
        updated_at = NOW()
      WHERE id = p_id;

      SELECT 
        s.*, 
        sc.name AS category_name
      FROM service s 
      LEFT JOIN shop_category sc ON s.shop_category_id = sc.id 
      WHERE s.id = p_id;
    END;
  `);

  // Delete service
  await knex.raw(`
    CREATE PROCEDURE DeleteService(IN p_serviceId CHAR(64))
    BEGIN
      DELETE FROM service WHERE id = p_serviceId;
    END;
  `);

  // Search services with basic filters
  await knex.raw(`
    CREATE PROCEDURE SearchServices(
      IN p_query VARCHAR(255),
      IN p_business_id CHAR(64),
      IN p_category_id CHAR(64),
      IN p_status VARCHAR(20)
    )
    BEGIN
      SELECT s.*, sc.name as category_name, b.business_name
      FROM service s 
      LEFT JOIN shop_category sc ON s.shop_category_id = sc.id 
      LEFT JOIN business b ON s.business_id = b.id 
      WHERE (p_query IS NULL OR s.name LIKE CONCAT('%', p_query, '%') OR s.description LIKE CONCAT('%', p_query, '%'))
        AND (p_business_id IS NULL OR s.business_id = p_business_id)
        AND (p_category_id IS NULL OR s.shop_category_id = p_category_id)
        AND (p_status IS NULL OR s.status = p_status)
      ORDER BY s.display_order, s.name;
    END;
  `);

  // Get service statistics for business (overview)
  await knex.raw(`
    CREATE PROCEDURE GetServiceStatsByBusiness(IN p_businessId CHAR(64))
    BEGIN
      SELECT 
        COUNT(*) as total_services,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_services,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_services,
        COUNT(CASE WHEN status = 'seasonal' THEN 1 END) as seasonal_services,
        AVG(base_price) as average_price,
        MIN(base_price) as min_price,
        MAX(base_price) as max_price
      FROM service 
      WHERE business_id = p_businessId;
    END;
  `);
}

async function dropServiceProcedures(knex) {
  // Drop all service-related procedures
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllServices;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetServicesByBusinessId;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetServicesByCategoryId;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetServiceById;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertService;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateService;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteService;");
  await knex.raw("DROP PROCEDURE IF EXISTS SearchServices;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetServiceStatsByBusiness;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertServiceCategoryMappings;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateServiceCategoryMappings;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetServicesWithPricing;");
}

export { createServiceProcedures, dropServiceProcedures };
