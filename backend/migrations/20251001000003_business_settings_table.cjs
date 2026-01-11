exports.up = async function (knex) {
  // Create business_settings table for business-specific configurations
  await knex.schema.createTable("business_settings", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("business_id").notNullable()
      .references("id")
      .inTable("business")
      .onDelete("CASCADE");

    // Order/Product Settings
    table.integer("minimum_preparation_time_minutes").defaultTo(30); // Default 30 mins
    table.integer("order_advance_notice_hours").defaultTo(0); // 0 = can order anytime
    table.boolean("accepts_product_orders").defaultTo(true);

    // Cancellation Policy
    table.integer("cancellation_deadline_hours").nullable(); // null = no deadline, can cancel anytime
    table.decimal("cancellation_penalty_percentage", 5, 2).defaultTo(0); // 0-100
    table.decimal("cancellation_penalty_fixed", 10, 2).defaultTo(0);
    table.boolean("allow_customer_cancellation").defaultTo(true);

    // Operational Settings
    table.boolean("auto_confirm_orders").defaultTo(false); // Auto-confirm or require manual confirmation
    table.boolean("send_notifications").defaultTo(true);

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.unique("business_id", "unique_business_settings");
  });

  // Create default settings for existing businesses
  await knex.raw(`
    INSERT INTO business_settings (id, business_id)
    SELECT UUID(), id FROM business
    WHERE NOT EXISTS (SELECT 1 FROM business_settings WHERE business_settings.business_id = business.id)
  `);

  // Create stored procedures
  console.log("Creating business settings stored procedures...");
  try {
    const { createBusinessSettingsProcedures } = require("../procedures/business/business-settings.procedures.cjs");
    await createBusinessSettingsProcedures(knex);
    console.log("✅ Business settings stored procedures created successfully");
  } catch (error) {
    console.error("❌ Error creating business settings stored procedures:", error);
    throw error;
  }
};

exports.down = async function (knex) {
  // Drop stored procedures first
  console.log("Dropping business settings stored procedures...");
  try {
    const { dropBusinessSettingsProcedures } = require("../procedures/business/business-settings.procedures.cjs");
    await dropBusinessSettingsProcedures(knex);
    console.log("✅ Business settings stored procedures dropped successfully");
  } catch (error) {
    console.error("❌ Error dropping business settings stored procedures:", error);
    throw error;
  }

  // Drop tables
  await knex.schema.dropTableIfExists("business_settings");
};
