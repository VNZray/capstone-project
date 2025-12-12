exports.up = async function (knex) {
  // Create notification table for orders and service bookings
  await knex.schema.createTable("notification", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("user_id").notNullable()
      .references("id")
      .inTable("user")
      .onDelete("CASCADE");
    table.enu("notification_type", [
      // Order notifications
      "order_created",
      "order_confirmed",
      "order_preparing",
      "order_ready",
      "order_completed",
      "order_cancelled",
      // Service booking notifications
      "booking_created",
      "booking_confirmed",
      "booking_reminder",
      "booking_in_progress",
      "booking_completed",
      "booking_cancelled",
      "booking_in_progress",
      "booking_no_show",
      // General
      "payment_received",
      "payment_failed",
      "refund_processed"
    ]).notNullable();
    table.uuid("related_id").notNullable(); // order_id or service_booking_id
    table.enu("related_type", ["order", "service_booking"]).notNullable();
    table.string("title", 255).notNullable();
    table.text("message").notNullable();
    table.json("metadata").nullable(); // Additional data (business_name, pickup_time, etc.)
    table.boolean("is_read").defaultTo(false);
    table.enu("delivery_method", ["push", "email", "sms", "in_app"]).defaultTo("in_app");
    table.enu("delivery_status", ["pending", "sent", "failed", "delivered"]).defaultTo("pending");
    table.timestamp("sent_at").nullable();
    table.timestamp("read_at").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.index("user_id", "idx_notification_user");
    table.index(["related_id", "related_type"], "idx_notification_related");
    table.index("is_read", "idx_notification_read");
    table.index("created_at", "idx_notification_created");
  });

  // Create stored procedures
  console.log("Creating notification stored procedures...");
  try {
    const { createNotificationProcedures } = await import("../procedures/notificationProcedures.js");
    await createNotificationProcedures(knex);
    console.log("✅ Notification stored procedures created successfully");
  } catch (error) {
    console.error("❌ Error creating notification stored procedures:", error);
    throw error;
  }
};

exports.down = async function (knex) {
  // Drop stored procedures first
  console.log("Dropping notification stored procedures...");
  try {
    const { dropNotificationProcedures } = await import("../procedures/notificationProcedures.js");
    await dropNotificationProcedures(knex);
    console.log("✅ Notification stored procedures dropped successfully");
  } catch (error) {
    console.error("❌ Error dropping notification stored procedures:", error);
    throw error;
  }

  // Drop tables
  await knex.schema.dropTableIfExists("notification");
};
