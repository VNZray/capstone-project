/**
 * Service Stored Procedures
 * Extracted from 20250921000003-service-management-tables.cjs
 */

/**
 * Create all service-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createServiceProcedures(sequelize) {
  await sequelize.query(`
    CREATE PROCEDURE InsertService(
      IN p_business_id CHAR(64),
      IN p_name VARCHAR(255),
      IN p_description TEXT,
      IN p_price DECIMAL(10, 2),
      IN p_duration_minutes INT,
      IN p_category_id CHAR(64),
      IN p_image_url TEXT,
      IN p_is_available BOOLEAN
    )
    BEGIN
      DECLARE new_id CHAR(64);
      SET new_id = UUID();
      INSERT INTO service (id, business_id, name, description, price, duration_minutes, category_id, image_url, is_available)
      VALUES (new_id, p_business_id, p_name, p_description, p_price, p_duration_minutes, p_category_id, p_image_url, IFNULL(p_is_available, true));
      SELECT * FROM service WHERE id = new_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetServiceById(IN p_id CHAR(64))
    BEGIN
      SELECT s.*, sc.name AS category_name
      FROM service s
      LEFT JOIN service_category sc ON s.category_id = sc.id
      WHERE s.id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetServicesByBusinessId(IN p_business_id CHAR(64))
    BEGIN
      SELECT s.*, sc.name AS category_name
      FROM service s
      LEFT JOIN service_category sc ON s.category_id = sc.id
      WHERE s.business_id = p_business_id
      ORDER BY s.name ASC;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetAvailableServicesByBusinessId(IN p_business_id CHAR(64))
    BEGIN
      SELECT s.*, sc.name AS category_name
      FROM service s
      LEFT JOIN service_category sc ON s.category_id = sc.id
      WHERE s.business_id = p_business_id AND s.is_available = true
      ORDER BY s.name ASC;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateService(
      IN p_id CHAR(64),
      IN p_name VARCHAR(255),
      IN p_description TEXT,
      IN p_price DECIMAL(10, 2),
      IN p_duration_minutes INT,
      IN p_category_id CHAR(64),
      IN p_image_url TEXT,
      IN p_is_available BOOLEAN
    )
    BEGIN
      UPDATE service SET
        name = IFNULL(p_name, name),
        description = IFNULL(p_description, description),
        price = IFNULL(p_price, price),
        duration_minutes = IFNULL(p_duration_minutes, duration_minutes),
        category_id = p_category_id,
        image_url = IFNULL(p_image_url, image_url),
        is_available = IFNULL(p_is_available, is_available)
      WHERE id = p_id;
      SELECT * FROM service WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeleteService(IN p_id CHAR(64))
    BEGIN
      DELETE FROM service WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE InsertServiceCategory(
      IN p_name VARCHAR(100),
      IN p_description TEXT,
      IN p_icon VARCHAR(50)
    )
    BEGIN
      DECLARE new_id CHAR(64);
      SET new_id = UUID();
      INSERT INTO service_category (id, name, description, icon)
      VALUES (new_id, p_name, p_description, p_icon);
      SELECT * FROM service_category WHERE id = new_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetAllServiceCategories()
    BEGIN
      SELECT * FROM service_category ORDER BY name ASC;
    END;
  `);
}

/**
 * Drop all service-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropServiceProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertService;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetServiceById;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetServicesByBusinessId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetAvailableServicesByBusinessId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS UpdateService;');
  await sequelize.query('DROP PROCEDURE IF EXISTS DeleteService;');
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertServiceCategory;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetAllServiceCategories;');
}
