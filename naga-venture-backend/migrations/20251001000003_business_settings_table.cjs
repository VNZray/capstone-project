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
    table.boolean("accepts_service_bookings").defaultTo(true);
    
    // Cancellation Policy
    table.integer("cancellation_deadline_hours").nullable(); // null = no deadline, can cancel anytime
    table.decimal("cancellation_penalty_percentage", 5, 2).defaultTo(0); // 0-100
    table.decimal("cancellation_penalty_fixed", 10, 2).defaultTo(0);
    table.boolean("allow_customer_cancellation").defaultTo(true);
    
    // Service Booking Settings
    table.integer("service_booking_advance_notice_hours").defaultTo(0);
    table.integer("service_default_duration_minutes").defaultTo(60);
    
    // Operational Settings
    table.boolean("auto_confirm_orders").defaultTo(false); // Auto-confirm or require manual confirmation
    table.boolean("auto_confirm_bookings").defaultTo(false);
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
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("business_settings");
};
