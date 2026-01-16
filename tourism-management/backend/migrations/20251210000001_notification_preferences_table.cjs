/**
 * Notification Preferences & Push Token Storage
 * Stores user notification preferences and Expo push tokens
 */

exports.up = async function (knex) {
  // Create notification preferences table
  await knex.schema.createTable("notification_preferences", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("user_id").notNullable().unique()
      .references("id")
      .inTable("user")
      .onDelete("CASCADE");

    // Push notification preferences
    table.boolean("push_enabled").defaultTo(true);
    table.boolean("push_bookings").defaultTo(true);
    table.boolean("push_orders").defaultTo(true);
    table.boolean("push_payments").defaultTo(true);
    table.boolean("push_promotions").defaultTo(true);

    // Email notification preferences (future use)
    table.boolean("email_enabled").defaultTo(false);
    table.boolean("email_bookings").defaultTo(false);
    table.boolean("email_orders").defaultTo(false);
    table.boolean("email_payments").defaultTo(false);

    // SMS notification preferences (future use)
    table.boolean("sms_enabled").defaultTo(false);
    table.boolean("sms_bookings").defaultTo(false);
    table.boolean("sms_payments").defaultTo(false);

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // Create push tokens table
  await knex.schema.createTable("push_tokens", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("user_id").notNullable()
      .references("id")
      .inTable("user")
      .onDelete("CASCADE");
    table.string("token", 255).notNullable(); // Expo push token
    table.string("device_id", 255).nullable(); // Device identifier
    table.enu("platform", ["ios", "android", "web"]).nullable();
    table.boolean("is_active").defaultTo(true);
    table.timestamp("last_used_at").defaultTo(knex.fn.now());
    table.timestamp("created_at").defaultTo(knex.fn.now());

    // Unique constraint: one token per device per user
    table.unique(["user_id", "token"]);
    table.index("user_id", "idx_push_tokens_user");
    table.index("is_active", "idx_push_tokens_active");
  });

  // Create stored procedures
  console.log("Creating notification preferences stored procedures...");
  try {
    const { createNotificationPreferencesProcedures } = require("../procedures/notification/notification-preferences.procedures.cjs");
    await createNotificationPreferencesProcedures(knex);
    console.log("✅ Notification preferences stored procedures created successfully");
  } catch (error) {
    console.error("❌ Error creating notification preferences stored procedures:", error);
    throw error;
  }
};

exports.down = async function (knex) {
  // Drop stored procedures first
  console.log("Dropping notification preferences stored procedures...");
  try {
    const { dropNotificationPreferencesProcedures } = require("../procedures/notification/notification-preferences.procedures.cjs");
    await dropNotificationPreferencesProcedures(knex);
    console.log("✅ Notification preferences stored procedures dropped successfully");
  } catch (error) {
    console.error("❌ Error dropping notification preferences stored procedures:", error);
    throw error;
  }

  // Drop tables
  await knex.schema.dropTableIfExists("push_tokens");
  await knex.schema.dropTableIfExists("notification_preferences");
};
