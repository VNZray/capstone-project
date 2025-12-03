/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Create hierarchical categories table
  // Note: No 'level' column - tree depth is computed from parent_category chain
  await knex.schema.createTable('categories', (table) => {
    table.increments('id').primary();
    table.integer('parent_category').unsigned().nullable()
      .references('id').inTable('categories').onDelete('SET NULL');
    table.string('alias', 100).notNullable().unique();
    table.string('title', 100).notNullable();
    table.text('description').nullable();
    table.enu('applicable_to', ['business', 'tourist_spot', 'event', 'business,tourist_spot', 'business,event', 'tourist_spot,event', 'all'])
      .notNullable().defaultTo('all');
    table.enu('status', ['active', 'inactive']).notNullable().defaultTo('active');
    table.integer('sort_order').unsigned().notNullable().defaultTo(0);
    table.timestamps(true, true);
    
    // Indexes
    table.index('parent_category', 'idx_categories_parent');
    table.index('status', 'idx_categories_status');
    table.index('sort_order', 'idx_categories_sort');
    table.index('applicable_to', 'idx_categories_applicable');
  });

  // Create entity_categories junction table
  // level: Priority of category for the entity (1=Primary, 2=Secondary, 3=Tertiary)
  // is_primary: Boolean flag for quick primary lookups
  await knex.schema.createTable('entity_categories', (table) => {
    table.increments('id').primary();
    table.uuid('entity_id').notNullable();
    table.enu('entity_type', ['business', 'tourist_spot', 'event']).notNullable();
    table.integer('category_id').unsigned().notNullable()
      .references('id').inTable('categories').onDelete('CASCADE');
    table.integer('level').unsigned().notNullable().defaultTo(1)
      .comment('Priority: 1=primary, 2=secondary, 3=tertiary');
    table.boolean('is_primary').notNullable().defaultTo(false);
    table.timestamps(true, true);
    
    // Unique constraint: entity can only have each category once
    table.unique(['entity_id', 'entity_type', 'category_id'], 'idx_entity_category_unique');
    
    // Indexes
    table.index(['entity_id', 'entity_type'], 'idx_entity_categories_entity');
    table.index('category_id', 'idx_entity_categories_category');
    table.index('is_primary', 'idx_entity_categories_primary');
    table.index('level', 'idx_entity_categories_level');
  });

  // Create stored procedures for hierarchical categories
  
  // Helper function to compute tree depth (level) dynamically
  await knex.raw(`
    DROP FUNCTION IF EXISTS GetCategoryTreeDepth;
  `);
  
  await knex.raw(`
    CREATE FUNCTION GetCategoryTreeDepth(p_category_id INT) 
    RETURNS INT
    DETERMINISTIC
    READS SQL DATA
    BEGIN
      DECLARE v_depth INT DEFAULT 1;
      DECLARE v_parent INT;
      
      SELECT parent_category INTO v_parent FROM categories WHERE id = p_category_id;
      
      WHILE v_parent IS NOT NULL DO
        SET v_depth = v_depth + 1;
        SELECT parent_category INTO v_parent FROM categories WHERE id = v_parent;
      END WHILE;
      
      RETURN v_depth;
    END
  `);

  await knex.raw(`
    DROP PROCEDURE IF EXISTS GetAllCategories;
  `);
  
  await knex.raw(`
    CREATE PROCEDURE GetAllCategories(
      IN p_applicable_to VARCHAR(50),
      IN p_status VARCHAR(20),
      IN p_parent_id INT
    )
    BEGIN
      SELECT 
        c.id,
        c.parent_category,
        c.alias,
        c.title,
        c.description,
        c.applicable_to,
        c.status,
        c.sort_order,
        c.created_at,
        c.updated_at,
        pc.title AS parent_title,
        (SELECT COUNT(*) FROM categories WHERE parent_category = c.id) AS children_count
      FROM categories c
      LEFT JOIN categories pc ON c.parent_category = pc.id
      WHERE (p_applicable_to IS NULL OR c.applicable_to LIKE CONCAT('%', p_applicable_to, '%') OR c.applicable_to = 'all')
        AND (p_status IS NULL OR c.status = p_status)
        AND (p_parent_id IS NULL OR c.parent_category = p_parent_id OR (p_parent_id = 0 AND c.parent_category IS NULL))
      ORDER BY c.sort_order, c.title;
    END
  `);

  await knex.raw(`
    DROP PROCEDURE IF EXISTS GetCategoryTree;
  `);

  await knex.raw(`
    CREATE PROCEDURE GetCategoryTree(
      IN p_applicable_to VARCHAR(50)
    )
    BEGIN
      SELECT 
        c.id,
        c.parent_category,
        c.alias,
        c.title,
        c.description,
        c.applicable_to,
        c.status,
        c.sort_order,
        c.created_at,
        c.updated_at
      FROM categories c
      WHERE c.status = 'active'
        AND (p_applicable_to IS NULL OR c.applicable_to LIKE CONCAT('%', p_applicable_to, '%') OR c.applicable_to = 'all')
      ORDER BY c.sort_order, c.title;
    END
  `);

  await knex.raw(`
    DROP PROCEDURE IF EXISTS GetCategoryById;
  `);

  await knex.raw(`
    CREATE PROCEDURE GetCategoryById(IN p_id INT)
    BEGIN
      SELECT 
        c.id,
        c.parent_category,
        c.alias,
        c.title,
        c.description,
        c.applicable_to,
        c.status,
        c.sort_order,
        c.created_at,
        c.updated_at,
        pc.title AS parent_title
      FROM categories c
      LEFT JOIN categories pc ON c.parent_category = pc.id
      WHERE c.id = p_id;
    END
  `);

  await knex.raw(`
    DROP PROCEDURE IF EXISTS GetCategoryChildren;
  `);

  await knex.raw(`
    CREATE PROCEDURE GetCategoryChildren(IN p_parent_id INT)
    BEGIN
      SELECT 
        c.id,
        c.parent_category,
        c.alias,
        c.title,
        c.description,
        c.applicable_to,
        c.status,
        c.sort_order,
        c.created_at,
        c.updated_at,
        (SELECT COUNT(*) FROM categories WHERE parent_category = c.id) AS children_count
      FROM categories c
      WHERE c.parent_category = p_parent_id AND c.status = 'active'
      ORDER BY c.sort_order, c.title;
    END
  `);

  await knex.raw(`
    DROP PROCEDURE IF EXISTS InsertCategory;
  `);

  await knex.raw(`
    CREATE PROCEDURE InsertCategory(
      IN p_parent_category INT,
      IN p_alias VARCHAR(100),
      IN p_title VARCHAR(100),
      IN p_description TEXT,
      IN p_applicable_to VARCHAR(50),
      IN p_status VARCHAR(20),
      IN p_sort_order INT
    )
    BEGIN
      -- Validate max depth (3 levels)
      DECLARE v_depth INT DEFAULT 1;
      DECLARE v_current_parent INT;
      
      SET v_current_parent = p_parent_category;
      
      WHILE v_current_parent IS NOT NULL DO
        SET v_depth = v_depth + 1;
        SELECT parent_category INTO v_current_parent FROM categories WHERE id = v_current_parent;
        
        IF v_depth > 3 THEN
          SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Maximum category depth (3 levels) exceeded';
        END IF;
      END WHILE;
      
      INSERT INTO categories (parent_category, alias, title, description, applicable_to, status, sort_order)
      VALUES (p_parent_category, p_alias, p_title, p_description, COALESCE(p_applicable_to, 'all'), COALESCE(p_status, 'active'), COALESCE(p_sort_order, 0));
      
      SELECT LAST_INSERT_ID() AS id;
    END
  `);

  await knex.raw(`
    DROP PROCEDURE IF EXISTS UpdateCategory;
  `);

  await knex.raw(`
    CREATE PROCEDURE UpdateCategory(
      IN p_id INT,
      IN p_parent_category INT,
      IN p_alias VARCHAR(100),
      IN p_title VARCHAR(100),
      IN p_description TEXT,
      IN p_applicable_to VARCHAR(50),
      IN p_status VARCHAR(20),
      IN p_sort_order INT
    )
    BEGIN
      -- Validate max depth (3 levels) and prevent self-reference
      DECLARE v_depth INT DEFAULT 1;
      DECLARE v_current_parent INT;
      
      IF p_parent_category IS NOT NULL THEN
        IF p_parent_category = p_id THEN
          SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Category cannot be its own parent';
        END IF;
        
        SET v_current_parent = p_parent_category;
        
        WHILE v_current_parent IS NOT NULL DO
          SET v_depth = v_depth + 1;
          SELECT parent_category INTO v_current_parent FROM categories WHERE id = v_current_parent;
          
          IF v_depth > 3 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Maximum category depth (3 levels) exceeded';
          END IF;
        END WHILE;
      END IF;
      
      UPDATE categories SET 
        parent_category = p_parent_category,
        alias = COALESCE(p_alias, alias),
        title = COALESCE(p_title, title),
        description = COALESCE(p_description, description),
        applicable_to = COALESCE(p_applicable_to, applicable_to),
        status = COALESCE(p_status, status),
        sort_order = COALESCE(p_sort_order, sort_order),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = p_id;
      
      SELECT ROW_COUNT() AS affected_rows;
    END
  `);

  await knex.raw(`
    DROP PROCEDURE IF EXISTS DeleteCategory;
  `);

  await knex.raw(`
    CREATE PROCEDURE DeleteCategory(IN p_id INT)
    BEGIN
      UPDATE categories SET parent_category = NULL WHERE parent_category = p_id;
      DELETE FROM categories WHERE id = p_id;
      SELECT ROW_COUNT() AS affected_rows;
    END
  `);

  // Entity categories procedures
  await knex.raw(`
    DROP PROCEDURE IF EXISTS GetEntityCategories;
  `);

  await knex.raw(`
    CREATE PROCEDURE GetEntityCategories(
      IN p_entity_id CHAR(36),
      IN p_entity_type VARCHAR(20)
    )
    BEGIN
      SELECT 
        ec.id,
        ec.entity_id,
        ec.entity_type,
        ec.category_id,
        ec.level,
        ec.is_primary,
        ec.created_at,
        ec.updated_at,
        c.title AS category_title,
        c.alias AS category_alias,
        c.parent_category,
        pc.title AS parent_title
      FROM entity_categories ec
      JOIN categories c ON ec.category_id = c.id
      LEFT JOIN categories pc ON c.parent_category = pc.id
      WHERE ec.entity_id = p_entity_id
        AND ec.entity_type = p_entity_type
      ORDER BY ec.is_primary DESC, ec.level, c.sort_order;
    END
  `);

  await knex.raw(`
    DROP PROCEDURE IF EXISTS AddEntityCategory;
  `);

  await knex.raw(`
    CREATE PROCEDURE AddEntityCategory(
      IN p_entity_id CHAR(36),
      IN p_entity_type VARCHAR(20),
      IN p_category_id INT,
      IN p_level INT,
      IN p_is_primary BOOLEAN
    )
    BEGIN
      INSERT INTO entity_categories (entity_id, entity_type, category_id, level, is_primary)
      VALUES (p_entity_id, p_entity_type, p_category_id, COALESCE(p_level, 1), COALESCE(p_is_primary, false))
      ON DUPLICATE KEY UPDATE 
        level = COALESCE(p_level, level),
        is_primary = COALESCE(p_is_primary, is_primary),
        updated_at = CURRENT_TIMESTAMP;
      
      SELECT LAST_INSERT_ID() AS id;
    END
  `);

  await knex.raw(`
    DROP PROCEDURE IF EXISTS RemoveEntityCategory;
  `);

  await knex.raw(`
    CREATE PROCEDURE RemoveEntityCategory(
      IN p_entity_id CHAR(36),
      IN p_entity_type VARCHAR(20),
      IN p_category_id INT
    )
    BEGIN
      DELETE FROM entity_categories 
      WHERE entity_id = p_entity_id 
        AND entity_type = p_entity_type 
        AND category_id = p_category_id;
      
      SELECT ROW_COUNT() AS affected_rows;
    END
  `);

  await knex.raw(`
    DROP PROCEDURE IF EXISTS SetEntityPrimaryCategory;
  `);

  await knex.raw(`
    CREATE PROCEDURE SetEntityPrimaryCategory(
      IN p_entity_id CHAR(36),
      IN p_entity_type VARCHAR(20),
      IN p_category_id INT
    )
    BEGIN
      UPDATE entity_categories SET is_primary = false 
      WHERE entity_id = p_entity_id AND entity_type = p_entity_type;
      
      UPDATE entity_categories SET is_primary = true, updated_at = CURRENT_TIMESTAMP
      WHERE entity_id = p_entity_id 
        AND entity_type = p_entity_type 
        AND category_id = p_category_id;
      
      SELECT ROW_COUNT() AS affected_rows;
    END
  `);

  await knex.raw(`
    DROP PROCEDURE IF EXISTS GetEntitiesByCategory;
  `);

  await knex.raw(`
    CREATE PROCEDURE GetEntitiesByCategory(
      IN p_category_id INT,
      IN p_entity_type VARCHAR(20),
      IN p_include_children BOOLEAN
    )
    BEGIN
      IF p_include_children THEN
        SELECT DISTINCT ec.entity_id, ec.entity_type, ec.is_primary, ec.level
        FROM entity_categories ec
        WHERE ec.category_id IN (
          SELECT id FROM categories WHERE id = p_category_id OR parent_category = p_category_id
          UNION
          SELECT c2.id FROM categories c1 
          JOIN categories c2 ON c2.parent_category = c1.id 
          WHERE c1.parent_category = p_category_id
        )
        AND (p_entity_type IS NULL OR ec.entity_type = p_entity_type);
      ELSE
        SELECT DISTINCT ec.entity_id, ec.entity_type, ec.is_primary, ec.level
        FROM entity_categories ec
        WHERE ec.category_id = p_category_id
        AND (p_entity_type IS NULL OR ec.entity_type = p_entity_type);
      END IF;
    END
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Drop procedures
  await knex.raw('DROP PROCEDURE IF EXISTS GetAllCategories');
  await knex.raw('DROP PROCEDURE IF EXISTS GetCategoryTree');
  await knex.raw('DROP PROCEDURE IF EXISTS GetCategoryById');
  await knex.raw('DROP PROCEDURE IF EXISTS GetCategoryChildren');
  await knex.raw('DROP PROCEDURE IF EXISTS InsertCategory');
  await knex.raw('DROP PROCEDURE IF EXISTS UpdateCategory');
  await knex.raw('DROP PROCEDURE IF EXISTS DeleteCategory');
  await knex.raw('DROP PROCEDURE IF EXISTS GetEntityCategories');
  await knex.raw('DROP PROCEDURE IF EXISTS AddEntityCategory');
  await knex.raw('DROP PROCEDURE IF EXISTS RemoveEntityCategory');
  await knex.raw('DROP PROCEDURE IF EXISTS SetEntityPrimaryCategory');
  await knex.raw('DROP PROCEDURE IF EXISTS GetEntitiesByCategory');
  
  // Drop helper function
  await knex.raw('DROP FUNCTION IF EXISTS GetCategoryTreeDepth');
  
  // Drop tables
  await knex.schema.dropTableIfExists('entity_categories');
  await knex.schema.dropTableIfExists('categories');
};
