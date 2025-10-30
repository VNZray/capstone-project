const { v4: uuidv4 } = require('uuid');
const { createProductProcedures, dropProductProcedures } = require("../procedures/productProcedures.js");

exports.up = async function (knex) {
  // Create product_category table (renamed to avoid conflict with existing 'category' table)
  await knex.schema.createTable("product_category", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("business_id").notNullable()
      .references("id")
      .inTable("business")  // Reference existing 'business' table, not 'businesses'
      .onDelete("CASCADE");
    table.string("name", 255).notNullable();
    table.text("description").nullable();
    table.integer("display_order").defaultTo(0);
    table.enu("status", ["active", "inactive"]).defaultTo("active");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    
    table.index("business_id", "idx_product_category_business");
    table.index("status", "idx_product_category_status");
  });

  // Note: shop_category table should be created by migration 20250920000001_create_shop_category.cjs
  
  // Create product table
  await knex.schema.createTable("product", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("business_id").notNullable()
      .references("id")
      .inTable("business")  // Reference existing 'business' table
      .onDelete("CASCADE");
    table.uuid("product_category_id").notNullable()  // Changed from category_id to product_category_id
      .references("id")
      .inTable("product_category")
    table.uuid("shop_category_id").notNullable()  // Changed to shop_category_id
      .references("id")
      .inTable("shop_category")  // Reference unified shop_category table
      .onDelete("CASCADE");
    table.string("name", 255).notNullable();
    table.text("description").nullable();
    table.decimal("price", 10, 2).notNullable();
    table.string("image_url", 500).nullable();
    table.enu("status", ["active", "inactive", "out_of_stock"]).defaultTo("active");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    
    table.index("business_id", "idx_product_business");
    table.index("product_category_id", "idx_product_category");
    table.index("shop_category_id", "idx_product_shop_category");
    table.index("status", "idx_product_status");
  });

  // Create product_stock table
  await knex.schema.createTable("product_stock", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("product_id").notNullable()
      .references("id")
      .inTable("product")
      .onDelete("CASCADE");
    table.integer("current_stock").notNullable().defaultTo(0);
    table.integer("minimum_stock").defaultTo(0);
    table.integer("maximum_stock").nullable();
    table.enu("stock_unit", ["pieces", "kg", "liters", "grams", "portions"]).defaultTo("pieces");
    table.timestamp("last_restocked_at").nullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    
    table.unique("product_id", "unique_product_stock");
  });

  // Create stock_history table
  await knex.schema.createTable("stock_history", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("product_id").notNullable()
      .references("id")
      .inTable("product")
      .onDelete("CASCADE");
    table.enu("change_type", ["restock", "sale", "adjustment", "expired"]).notNullable();
    table.integer("quantity_change").notNullable(); // positive for additions, negative for reductions
    table.integer("previous_stock").notNullable();
    table.integer("new_stock").notNullable();
    table.text("notes").nullable();
    table.uuid("created_by").nullable()  // Reference to user table
      .references("id")
      .inTable("user")  // Reference existing 'user' table, not 'users'
      .onDelete("SET NULL");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    
    table.index("product_id", "idx_stock_history_product");
    table.index("created_at", "idx_stock_history_date");
  });

  // Create stored procedures
  console.log("Creating product stored procedures...");
  try {
    await createProductProcedures(knex);
    console.log("✅ Product stored procedures created successfully");
  } catch (error) {
    console.error("❌ Error creating product stored procedures:", error);
    throw error;
  }
};

exports.down = async function (knex) {
  // Drop stored procedures first
  console.log("Dropping product stored procedures...");
  try {
    await dropProductProcedures(knex);
    console.log("✅ Product stored procedures dropped successfully");
  } catch (error) {
    console.error("❌ Error dropping product stored procedures:", error);
    throw error;
  }

  // Drop tables
  await knex.schema.dropTableIfExists("stock_history");
  await knex.schema.dropTableIfExists("product_stock");
  await knex.schema.dropTableIfExists("product");
  await knex.schema.dropTableIfExists("product_category");
  // Drop tables (shop_category is managed by its own migration)
  await knex.schema.dropTableIfExists("stock_history");
  await knex.schema.dropTableIfExists("product_stock");
  await knex.schema.dropTableIfExists("product");
};
