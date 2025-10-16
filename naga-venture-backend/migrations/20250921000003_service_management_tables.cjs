const { createServiceProcedures, dropServiceProcedures } = require("../procedures/serviceProcedures.js");

exports.up = async function (knex) {
  // Note: shop_category table should be created by migration 20250920000001_create_shop_category.cjs
  
  // Create service table (display only with contact information)
  await knex.schema.createTable("service", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("business_id").notNullable()
      .references("id")
      .inTable("business")
      .onDelete("CASCADE");
    table.uuid("shop_category_id").notNullable()  // Changed to shop_category_id
      .references("id")
      .inTable("shop_category")  // Reference unified shop_category table
      .onDelete("CASCADE");
    table.string("name", 255).notNullable();
    table.text("description").nullable();
    table.decimal("base_price", 10, 2).notNullable();
    table.enu("price_type", ["per_hour", "per_day", "per_week", "per_month", "per_session", "fixed"]).notNullable();
    table.enu("sale_type", ["fixed", "percentage"]).defaultTo("fixed");
    table.decimal("sale_value", 10, 2).defaultTo(0); // discount amount or percentage
    table.integer("duration_value").nullable(); // Numeric value for duration (e.g., 2, 5, 1)
    table.enu("duration_unit", ["minutes", "hours", "days", "weeks"]).nullable(); // Unit for duration value
    table.string("image_url", 500).nullable();
    table.json("features").nullable(); // Store service features/inclusions as JSON array
    table.text("requirements").nullable(); // What customer needs to bring/prepare
    
    // Contact information for direct merchant communication
    table.string("contact_phone", 50).nullable();
    table.string("contact_email", 255).nullable();
    table.string("contact_facebook", 500).nullable();
    table.string("contact_viber", 50).nullable();
    table.string("contact_whatsapp", 50).nullable();
    table.string("external_booking_url", 500).nullable(); // If merchant has their own booking system
    table.text("contact_notes").nullable(); // Additional contact instructions (e.g., "Call between 9 AM - 5 PM")
    
    table.integer("display_order").defaultTo(0);
    table.enu("status", ["active", "inactive", "seasonal"]).defaultTo("active");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    
    table.index("business_id", "idx_service_business");
    table.index("shop_category_id", "idx_service_shop_category");
    table.index("status", "idx_service_status");
  });

  // Create stored procedures
  console.log("Creating service stored procedures...");
  try {
    await createServiceProcedures(knex);
    console.log("✅ Service stored procedures created successfully");
  } catch (error) {
    console.error("❌ Error creating service stored procedures:", error);
    throw error;
  }
};

exports.down = async function (knex) {
  // Drop stored procedures first
  console.log("Dropping service stored procedures...");
  try {
    await dropServiceProcedures(knex);
    console.log("✅ Service stored procedures dropped successfully");
  } catch (error) {
    console.error("❌ Error dropping service stored procedures:", error);
    throw error;
  }

  // Drop table (shop_category is managed by its own migration)
  await knex.schema.dropTableIfExists("service");
};
