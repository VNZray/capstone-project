// migrations/20250817100000_owner.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable("owner", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())")); // MariaDB's UUID()
    table.string("first_name", 30).notNullable();
    table.string("middle_name", 20);
    table.string("last_name", 30).notNullable();
    table.integer("age", 2);
    table.date("birthday");
    table.enu("gender", ["Male", "Female"]);
    table.string("email", 40).notNullable();
    table.string("phone_number", 13).notNullable();
    table.enu("business_type", ["Shop", "Accommodation", "Both"]).notNullable();
    table
      .integer("province_id")
      .unsigned()
      .references("id")
      .inTable("province")
      .notNullable();
    table
      .integer("municipality_id")
      .unsigned()
      .references("id")
      .inTable("municipality")
      .notNullable();
    table
      .integer("barangay_id")
      .unsigned()
      .references("id")
      .inTable("barangay")
      .notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("owner");
};
