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
    table.float("min_price").notNullable();
    table.float("max_price").notNullable();
    table.string("email", 40).notNullable().unique();
    table.string("phone_number", 14).notNullable().unique();
    table.integer("business_category_id").notNullable();
    table.integer("business_type_id").notNullable();
    table
      .integer("province_id")
      .unsigned()
      .references("id")
      .inTable("province")
      .nullable();
    table
      .integer("municipality_id")
      .unsigned()
      .references("id")
      .inTable("municipality")
      .nullable();
    table
      .integer("barangay_id")
      .unsigned()
      .references("id")
      .inTable("barangay")
      .nullable();
    table.text("address").notNullable();
    table
      .uuid("owner_id")
      .notNullable()
      .references("id")
      .inTable("owner");
    table
      .enu("status", ["Pending", "Active", "Inactive", "Maintenance"])
      .notNullable();
    table.text("business_image").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.string("latitude", 30).notNullable();
    table.string("longitude", 30).notNullable();
    table.text("x_url").nullable();
    table.text("website_url").nullable();
    table.text("facebook_url").nullable();
    table.text("instagram_url").nullable();
    table.boolean("hasBooking").notNullable().defaultTo(true);
  });
};

exports.down = async function (knex) {
  // Drop table
  await knex.schema.dropTableIfExists("business");
};

// Stored Procedures
exports.up = async function (knex) {
  await createBusinessProcedures(knex);
};

exports.down = async function (knex) {
  await dropBusinessProcedures(knex);
};