async function createServiceProcedures(knex) {
  // ==================== SERVICE CATEGORIES ====================
  
  // Get all service categories
  await knex.raw(`
    CREATE PROCEDURE GetAllServiceCategories()
    BEGIN
      SELECT * FROM service_category ORDER BY display_order, name;
    END;
  `);

  // Get service categories by business ID
  await knex.raw(`
    CREATE PROCEDURE GetServiceCategoriesByBusinessId(IN p_businessId CHAR(64))
    BEGIN
      SELECT * FROM service_category 
      WHERE business_id = p_businessId AND status = 'active' 
      ORDER BY display_order, name;
    END;
  `);

  // Get service category by ID
  await knex.raw(`
    CREATE PROCEDURE GetServiceCategoryById(IN p_categoryId CHAR(64))
    BEGIN
      SELECT * FROM service_category WHERE id = p_categoryId;
    END;
  `);

  // Insert service category
  await knex.raw(`
    CREATE PROCEDURE InsertServiceCategory(
      IN p_id CHAR(64),
      IN p_business_id CHAR(64),
      IN p_name VARCHAR(255),
      IN p_description TEXT,
      IN p_display_order INT,
      IN p_status ENUM('active', 'inactive')
    )
    BEGIN
      INSERT INTO service_category (id, business_id, name, description, display_order, status)
      VALUES (p_id, p_business_id, p_name, p_description, IFNULL(p_display_order, 0), IFNULL(p_status, 'active'));
      
      SELECT * FROM service_category WHERE id = p_id;
    END;
  `);

  // Update service category
  await knex.raw(`
    CREATE PROCEDURE UpdateServiceCategory(
      IN p_id CHAR(64),
      IN p_name VARCHAR(255),
      IN p_description TEXT,
      IN p_display_order INT,
      IN p_status ENUM('active', 'inactive')
    )
    BEGIN
      UPDATE service_category SET
        name = IFNULL(p_name, name),
        description = IFNULL(p_description, description),
        display_order = IFNULL(p_display_order, display_order),
        status = IFNULL(p_status, status),
        updated_at = NOW()
      WHERE id = p_id;

      SELECT * FROM service_category WHERE id = p_id;
    END;
  `);

  // Delete service category
  await knex.raw(`
    CREATE PROCEDURE DeleteServiceCategory(IN p_categoryId CHAR(64))
    BEGIN
      DECLARE service_count INT DEFAULT 0;
      
      SELECT COUNT(*) INTO service_count FROM service WHERE service_category_id = p_categoryId;
      
      IF service_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot delete category that has services';
      ELSE
        DELETE FROM service_category WHERE id = p_categoryId;
      END IF;
    END;
  `);

  // ==================== SERVICES ====================
  
  // Get all services with category and business info
  await knex.raw(`
    CREATE PROCEDURE GetAllServices()
    BEGIN
      SELECT 
        s.*, 
        sc_primary.name AS primary_category_name,
        b.business_name,
        (
          SELECT COALESCE(
            CONCAT('[', GROUP_CONCAT(
              JSON_OBJECT(
                'id', scm.category_id,
                'name', sc.name,
                'is_primary', scm.is_primary,
                'display_order', sc.display_order
              ) SEPARATOR ','
            ), ']'),
            '[]'
          )
          FROM service_category_map scm
          JOIN service_category sc ON scm.category_id = sc.id
          WHERE scm.service_id = s.id
        ) AS categories
      FROM service s 
      LEFT JOIN service_category sc_primary ON s.service_category_id = sc_primary.id 
      LEFT JOIN business b ON s.business_id = b.id 
      ORDER BY s.created_at DESC;
    END;
  `);

  // Get services by business ID
  await knex.raw(`
    CREATE PROCEDURE GetServicesByBusinessId(IN p_businessId CHAR(64))
    BEGIN
      SELECT 
        s.*, 
        sc_primary.name AS primary_category_name,
        (
          SELECT COALESCE(
            CONCAT('[', GROUP_CONCAT(
              JSON_OBJECT(
                'id', scm.category_id,
                'name', sc.name,
                'is_primary', scm.is_primary,
                'display_order', sc.display_order
              ) SEPARATOR ','
            ), ']'),
            '[]'
          )
          FROM service_category_map scm
          JOIN service_category sc ON scm.category_id = sc.id
          WHERE scm.service_id = s.id
        ) AS categories
      FROM service s 
      LEFT JOIN service_category sc_primary ON s.service_category_id = sc_primary.id 
      WHERE s.business_id = p_businessId AND s.status IN ('active', 'seasonal')
      ORDER BY sc_primary.display_order, s.display_order, s.name;
    END;
  `);

  // Get services by category ID
  await knex.raw(`
    CREATE PROCEDURE GetServicesByCategoryId(IN p_categoryId CHAR(64))
    BEGIN
      SELECT s.*
      FROM service s 
      WHERE s.service_category_id = p_categoryId AND s.status = 'active'
      ORDER BY s.display_order, s.name;
    END;
  `);

  // Get service by ID with details
  await knex.raw(`
    CREATE PROCEDURE GetServiceById(IN p_serviceId CHAR(64))
    BEGIN
      SELECT 
        s.*, 
        sc_primary.name AS primary_category_name,
        b.business_name,
        (
          SELECT COALESCE(
            CONCAT('[', GROUP_CONCAT(
              JSON_OBJECT(
                'id', scm.category_id,
                'name', sc.name,
                'is_primary', scm.is_primary,
                'display_order', sc.display_order
              ) SEPARATOR ','
            ), ']'),
            '[]'
          )
          FROM service_category_map scm
          JOIN service_category sc ON scm.category_id = sc.id
          WHERE scm.service_id = s.id
        ) AS categories
      FROM service s 
      LEFT JOIN service_category sc_primary ON s.service_category_id = sc_primary.id 
      LEFT JOIN business b ON s.business_id = b.id 
      WHERE s.id = p_serviceId;
    END;
  `);

  // Insert service
  await knex.raw(`
    CREATE PROCEDURE InsertService(
      IN p_id CHAR(64),
      IN p_business_id CHAR(64),
      IN p_service_category_id CHAR(64),
      IN p_name VARCHAR(255),
      IN p_description TEXT,
      IN p_base_price DECIMAL(10,2),
      IN p_price_type ENUM('per_hour', 'per_day', 'per_week', 'per_month', 'per_session', 'fixed'),
      IN p_sale_type ENUM('fixed', 'percentage'),
      IN p_sale_value DECIMAL(10,2),
      IN p_duration_value INT,
      IN p_duration_unit ENUM('minutes', 'hours', 'days', 'weeks'),
      IN p_image_url VARCHAR(500),
      IN p_features JSON,
      IN p_requirements TEXT,
      IN p_display_order INT,
      IN p_status ENUM('active', 'inactive', 'seasonal')
    )
    BEGIN
      INSERT INTO service (
        id, business_id, service_category_id, name, description, base_price, price_type,
        sale_type, sale_value, duration_value, duration_unit, image_url, features, requirements, display_order, status
      ) VALUES (
        p_id, p_business_id, p_service_category_id, p_name, p_description, p_base_price, p_price_type,
        IFNULL(p_sale_type, 'fixed'), IFNULL(p_sale_value, 0), p_duration_value, p_duration_unit, p_image_url,
        p_features, p_requirements, IFNULL(p_display_order, 0), IFNULL(p_status, 'active')
      );
      
      SELECT 
        s.*, 
        sc_primary.name AS primary_category_name,
        (
          SELECT COALESCE(
            CONCAT('[', GROUP_CONCAT(
              JSON_OBJECT(
                'id', scm.category_id,
                'name', sc.name,
                'is_primary', scm.is_primary,
                'display_order', sc.display_order
              ) SEPARATOR ','
            ), ']'),
            '[]'
          )
          FROM service_category_map scm
          JOIN service_category sc ON scm.category_id = sc.id
          WHERE scm.service_id = s.id
        ) AS categories
      FROM service s 
      LEFT JOIN service_category sc_primary ON s.service_category_id = sc_primary.id 
      WHERE s.id = p_id;
    END;
  `);

  // Update service
  await knex.raw(`
    CREATE PROCEDURE UpdateService(
      IN p_id CHAR(64),
      IN p_service_category_id CHAR(64),
      IN p_name VARCHAR(255),
      IN p_description TEXT,
      IN p_base_price DECIMAL(10,2),
      IN p_price_type ENUM('per_hour', 'per_day', 'per_week', 'per_month', 'per_session', 'fixed'),
      IN p_sale_type ENUM('fixed', 'percentage'),
      IN p_sale_value DECIMAL(10,2),
      IN p_duration_value INT,
      IN p_duration_unit ENUM('minutes', 'hours', 'days', 'weeks'),
      IN p_image_url VARCHAR(500),
      IN p_features JSON,
      IN p_requirements TEXT,
      IN p_display_order INT,
      IN p_status ENUM('active', 'inactive', 'seasonal')
    )
    BEGIN
      UPDATE service SET
        service_category_id = IFNULL(p_service_category_id, service_category_id),
        name = IFNULL(p_name, name),
        description = IFNULL(p_description, description),
        base_price = IFNULL(p_base_price, base_price),
        price_type = IFNULL(p_price_type, price_type),
        sale_type = IFNULL(p_sale_type, sale_type),
        sale_value = IFNULL(p_sale_value, sale_value),
        duration_value = IFNULL(p_duration_value, duration_value),
        duration_unit = IFNULL(p_duration_unit, duration_unit),
        image_url = IFNULL(p_image_url, image_url),
        features = IFNULL(p_features, features),
        requirements = IFNULL(p_requirements, requirements),
        display_order = IFNULL(p_display_order, display_order),
        status = IFNULL(p_status, status),
        updated_at = NOW()
      WHERE id = p_id;

      SELECT 
        s.*, 
        sc_primary.name AS primary_category_name,
        (
          SELECT COALESCE(
            CONCAT('[', GROUP_CONCAT(
              JSON_OBJECT(
                'id', scm.category_id,
                'name', sc.name,
                'is_primary', scm.is_primary,
                'display_order', sc.display_order
              ) SEPARATOR ','
            ), ']'),
            '[]'
          )
          FROM service_category_map scm
          JOIN service_category sc ON scm.category_id = sc.id
          WHERE scm.service_id = s.id
        ) AS categories
      FROM service s 
      LEFT JOIN service_category sc_primary ON s.service_category_id = sc_primary.id 
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

  // Insert service category mappings
  await knex.raw(`
    CREATE PROCEDURE InsertServiceCategoryMappings(
      IN p_service_id CHAR(36),
      IN p_category_ids JSON
    )
    BEGIN
      DECLARE i INT DEFAULT 0;
      DECLARE category_count INT;
      DECLARE current_category_id CHAR(36);
      DECLARE is_first BOOLEAN DEFAULT TRUE;
      
      SET category_count = JSON_LENGTH(p_category_ids);
      
      WHILE i < category_count DO
        SET current_category_id = JSON_UNQUOTE(JSON_EXTRACT(p_category_ids, CONCAT('$[', i, ']')));
        
        -- Only insert if not already exists
        IF NOT EXISTS (
          SELECT 1 FROM service_category_map 
          WHERE service_id = p_service_id AND category_id = current_category_id
        ) THEN
          INSERT INTO service_category_map (id, service_id, category_id, is_primary)
          VALUES (UUID(), p_service_id, current_category_id, is_first);
        END IF;
        
        SET is_first = FALSE;
        SET i = i + 1;
      END WHILE;
    END;
  `);

  // Update service category mappings
  await knex.raw(`
    CREATE PROCEDURE UpdateServiceCategoryMappings(
      IN p_service_id CHAR(36),
      IN p_category_ids JSON
    )
    BEGIN
      -- Delete existing mappings
      DELETE FROM service_category_map WHERE service_id = p_service_id;
      
      -- Insert new mappings
      CALL InsertServiceCategoryMappings(p_service_id, p_category_ids);
    END;
  `);

  // Get services with pricing calculations
  await knex.raw(`
    CREATE PROCEDURE GetServicesWithPricing(IN p_businessId CHAR(64))
    BEGIN
      SELECT s.*, sc.name as category_name,
        CASE 
          WHEN s.sale_type = 'percentage' THEN s.base_price - (s.base_price * s.sale_value / 100)
          WHEN s.sale_type = 'fixed' THEN s.base_price - s.sale_value
          ELSE s.base_price
        END as effective_price,
        CASE 
          WHEN s.sale_value > 0 THEN true
          ELSE false
        END as has_discount
      FROM service s 
      LEFT JOIN service_category sc ON s.service_category_id = sc.id 
      WHERE s.business_id = p_businessId AND s.status IN ('active', 'seasonal')
      ORDER BY sc.display_order, s.display_order, s.name;
    END;
  `);

  // Search services with filters
  await knex.raw(`
    CREATE PROCEDURE SearchServices(
      IN p_query VARCHAR(255),
      IN p_business_id CHAR(64),
      IN p_category_id CHAR(64),
      IN p_price_type VARCHAR(50),
      IN p_price_min DECIMAL(10,2),
      IN p_price_max DECIMAL(10,2)
    )
    BEGIN
      SELECT s.*, sc.name as category_name, b.business_name,
        CASE 
          WHEN s.sale_type = 'percentage' THEN s.base_price - (s.base_price * s.sale_value / 100)
          WHEN s.sale_type = 'fixed' THEN s.base_price - s.sale_value
          ELSE s.base_price
        END as effective_price
      FROM service s 
      LEFT JOIN service_category sc ON s.service_category_id = sc.id 
      LEFT JOIN business b ON s.business_id = b.id 
      WHERE s.status = 'active'
        AND (p_query IS NULL OR s.name LIKE CONCAT('%', p_query, '%') OR s.description LIKE CONCAT('%', p_query, '%'))
        AND (p_business_id IS NULL OR s.business_id = p_business_id)
        AND (p_category_id IS NULL OR s.service_category_id = p_category_id)
        AND (p_price_type IS NULL OR s.price_type = p_price_type)
      HAVING (p_price_min IS NULL OR effective_price >= p_price_min)
        AND (p_price_max IS NULL OR effective_price <= p_price_max)
      ORDER BY s.name;
    END;
  `);

  // Get service statistics for business
  await knex.raw(`
    CREATE PROCEDURE GetServiceStatsByBusiness(IN p_businessId CHAR(64))
    BEGIN
      -- Overall statistics
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
      
      -- By category statistics
      SELECT sc.name as category_name, COUNT(s.id) as service_count
      FROM service_category sc 
      LEFT JOIN service s ON sc.id = s.service_category_id AND s.business_id = p_businessId
      WHERE sc.business_id = p_businessId
      GROUP BY sc.id, sc.name
      ORDER BY service_count DESC;
    END;
  `);
}

async function dropServiceProcedures(knex) {
  // Service Categories procedures
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllServiceCategories;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetServiceCategoriesByBusinessId;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetServiceCategoryById;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertServiceCategory;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateServiceCategory;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteServiceCategory;");
  
  // Services procedures
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllServices;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetServicesByBusinessId;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetServicesByCategoryId;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetServiceById;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertService;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateService;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteService;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertServiceCategoryMappings;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateServiceCategoryMappings;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetServicesWithPricing;");
  await knex.raw("DROP PROCEDURE IF EXISTS SearchServices;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetServiceStatsByBusiness;");
}

export { createServiceProcedures, dropServiceProcedures };
