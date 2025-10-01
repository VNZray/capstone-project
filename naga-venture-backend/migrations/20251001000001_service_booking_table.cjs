exports.up = async function (knex) {
  // Create service_booking table - for reserving/booking services
  await knex.schema.createTable("service_booking", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("service_id").notNullable()
      .references("id")
      .inTable("service")
      .onDelete("CASCADE");
    table.uuid("business_id").notNullable()
      .references("id")
      .inTable("business")
      .onDelete("CASCADE");
    table.uuid("user_id").notNullable()
      .references("id")
      .inTable("user")
      .onDelete("CASCADE");
    table.string("booking_number", 50).unique().notNullable();
    table.timestamp("booking_datetime").notNullable(); // When service is scheduled
    table.integer("duration_minutes").nullable(); // Expected duration of service
    table.integer("number_of_people").defaultTo(1);
    table.decimal("base_price", 10, 2).notNullable(); // Price at time of booking
    table.decimal("total_price", 10, 2).notNullable(); // Final price after calculations
    table.text("special_requests").nullable();
    table.text("customer_notes").nullable();
    table.enu("status", [
      "pending",       // Just created, awaiting business confirmation
      "confirmed",     // Business confirmed the booking
      "in_progress",   // Service is currently being provided
      "completed",     // Service finished
      "cancelled",     // Cancelled by user or business
      "no_show"        // Customer didn't show up
    ]).defaultTo("pending");
    table.enu("payment_status", ["pending", "paid", "failed", "refunded"]).defaultTo("pending");
    table.enu("payment_method", ["cash_on_site", "cash_on_arrival", "card", "digital_wallet"]).defaultTo("cash_on_site");
    table.timestamp("confirmed_at").nullable();
    table.timestamp("cancelled_at").nullable();
    table.text("cancellation_reason").nullable();
    table.decimal("refund_amount", 10, 2).nullable();
    table.timestamp("customer_arrived_at").nullable();
    table.timestamp("service_started_at").nullable();
    table.timestamp("service_completed_at").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    
    table.index("service_id", "idx_service_booking_service");
    table.index("business_id", "idx_service_booking_business");
    table.index("user_id", "idx_service_booking_user");
    table.index("booking_datetime", "idx_service_booking_datetime");
    table.index("status", "idx_service_booking_status");
    table.index("booking_number", "idx_service_booking_number");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("service_booking");
};
