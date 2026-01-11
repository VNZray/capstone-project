/**
 * Migration to create service inquiry table
 * Tracks when tourists express interest in services for analytics and lead generation
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // Create service_inquiry table for tracking interest/leads
  await knex.schema.createTable("service_inquiry", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("service_id").notNullable()
      .references("id")
      .inTable("service")
      .onDelete("CASCADE");
    table.uuid("business_id").notNullable()
      .references("id")
      .inTable("business")
      .onDelete("CASCADE");

    // Support logged-in users (guest_id removed - guest table doesn't exist)
    table.uuid("user_id").nullable()
      .references("id")
      .inTable("user")
      .onDelete("CASCADE");

    // Inquiry details
    table.string("inquiry_number", 50).unique().notNullable(); // Generated inquiry reference
    table.text("message").nullable(); // Optional message from tourist
    table.integer("number_of_people").defaultTo(1); // How many people
    table.date("preferred_date").nullable(); // When they want the service

    // Contact method used
    table.enu("contact_method", [
      "phone",
      "email",
      "facebook",
      "viber",
      "whatsapp",
      "external_booking",
      "view_only"
    ]).nullable(); // Which contact method they clicked

    // Tracking
    table.enu("status", ["new", "contacted", "converted", "archived"]).defaultTo("new");
    table.boolean("merchant_viewed").defaultTo(false);
    table.timestamp("merchant_viewed_at").nullable();
    table.text("merchant_notes").nullable(); // Merchant can add notes

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    // Indexes
    table.index("service_id", "idx_service_inquiry_service");
    table.index("business_id", "idx_service_inquiry_business");
    table.index("user_id", "idx_service_inquiry_user");
    table.index("status", "idx_service_inquiry_status");
    table.index("created_at", "idx_service_inquiry_created");

    // Note: user_id is nullable to allow anonymous inquiries
  });

  console.log("✅ Created service_inquiry table");

  // Create stored procedures
  console.log("Creating service inquiry stored procedures...");
  try {
    const { createServiceInquiryProcedures } = require("../procedures/service/service-inquiry.procedures.cjs");
    await createServiceInquiryProcedures(knex);
    console.log("✅ Service inquiry stored procedures created successfully");
  } catch (error) {
    console.error("❌ Error creating service inquiry stored procedures:", error);
    throw error;
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  // Drop stored procedures first
  console.log("Dropping service inquiry stored procedures...");
  try {
    const { dropServiceInquiryProcedures } = require("../procedures/service/service-inquiry.procedures.cjs");
    await dropServiceInquiryProcedures(knex);
    console.log("✅ Service inquiry stored procedures dropped successfully");
  } catch (error) {
    console.error("❌ Error dropping service inquiry stored procedures:", error);
    throw error;
  }

  // Drop tables
  await knex.schema.dropTableIfExists("service_inquiry");
};
