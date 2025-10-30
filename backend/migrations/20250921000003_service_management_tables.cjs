const { createServiceProcedures, dropServiceProcedures } = require("../procedures/serviceProcedures.js");

exports.up = async function (knex) {
  // Note: shop_category table should be created by migration 20250920000001_create_shop_category.cjs
  
  // Create service table (display-only version)
  // Services are displayed in mobile app and tourists can submit inquiries for more info
  // No booking/reservation system - that's for a future phase
  await knex.schema.createTable("service", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("business_id").notNullable()
      .references("id")
      .inTable("business")
      .onDelete("CASCADE");
    table.uuid("shop_category_id").notNullable()
      .references("id")
      .inTable("shop_category")
      .onDelete("CASCADE");
    
    // Basic display information
    table.string("name", 255).notNullable();
    table.text("description").nullable();
    table.string("image_url", 500).nullable();
    
    // Service details for display
    table.decimal("base_price", 10, 2).notNullable(); // Price displayed to tourists
    table.enu("price_type", ["per_hour", "per_day", "per_week", "per_month", "per_session", "fixed"]).notNullable();
    table.text("requirements").nullable(); // What customers should know/bring
    
    // Unified contact methods (consolidates phone, email, facebook, viber, whatsapp)
    // Format: [{ "type": "phone", "value": "+639123456789" }, { "type": "email", "value": "service@business.com" }]
    table.json("contact_methods").defaultTo('[]');
    table.text("contact_notes").nullable(); // Additional contact instructions (e.g., "Call between 9 AM - 5 PM")
    
    // Ordering and visibility
    table.integer("display_order").defaultTo(0);
    table.enu("status", ["active", "inactive", "seasonal"]).defaultTo("active");
    
    // Timestamps
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    
    // Indexes for common queries
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
