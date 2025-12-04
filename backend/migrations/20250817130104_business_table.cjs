const {
  createBusinessProcedures,
  dropBusinessProcedures,
} = require("../procedures/businessProcedures");

exports.up = async function (knex) {
  // Create business table
  await knex.schema.createTable("business", function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())")); // MariaDB UUID()
    table.string("business_name", 50).notNullable();
    table.text("description").nullable();
    table.float("min_price").nullable();
    table.float("max_price").nullable();
    table.string("email", 40).notNullable().unique();
    table.string("phone_number", 14).notNullable().unique();
    // Note: business_type_id and business_category_id removed - using entity_categories table instead


    table.text("address").notNullable();
    table.uuid("owner_id").notNullable().references("id").inTable("owner");
    table
      .enu("status", ["Pending", "Active", "Inactive", "Maintenance"])
      .notNullable()
      .defaultTo("Pending");
    table.text("business_image").nullable();
    table.string("latitude", 30).notNullable();
    table.string("longitude", 30).notNullable();
    table.text("website_url").nullable();
    table.text("facebook_url").nullable();
    table.text("instagram_url").nullable();
    table.boolean("hasBooking").nullable().defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now());

        // Foreign keys
    table
      .integer("barangay_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("barangay")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });

  await createBusinessProcedures(knex);

  console.log("Business table and procedures created.");
};

exports.down = async function (knex) {
  // Drop table
  await knex.schema.dropTableIfExists("business");
  await dropBusinessProcedures(knex);
};
