exports.up = async function (knex) {
  // Create service_category table (separate from existing category table)
  await knex.schema.createTable("service_category", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("business_id").notNullable()
      .references("id")
      .inTable("business")
      .onDelete("CASCADE");
    table.string("name", 255).notNullable();
    table.text("description").nullable();
    table.integer("display_order").defaultTo(0);
    table.enu("status", ["active", "inactive"]).defaultTo("active");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    
    table.index("business_id", "idx_service_category_business");
    table.index("status", "idx_service_category_status");
  });

  // Create service table (display only)
  await knex.schema.createTable("service", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("business_id").notNullable()
      .references("id")
      .inTable("business")
      .onDelete("CASCADE");
    table.uuid("service_category_id").notNullable()  // Changed from category_id to service_category_id
      .references("id")
      .inTable("service_category")
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
    table.integer("display_order").defaultTo(0);
    table.enu("status", ["active", "inactive", "seasonal"]).defaultTo("active");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    
    table.index("business_id", "idx_service_business");
    table.index("service_category_id", "idx_service_category");
    table.index("status", "idx_service_status");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("service");
  await knex.schema.dropTableIfExists("service_category");
};
