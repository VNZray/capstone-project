/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable("tourist", function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));

    table.string("first_name", 30).notNullable();
    table.string("middle_name", 20).nullable();
    table.string("last_name", 30).notNullable();

    table
      .enu("ethnicity", ["Bicolano", "Non-Bicolano", "Foreigner", "Local"])
      .notNullable();
    table.date("birthday").notNullable();
    table.integer("age").notNullable();
    table.enu("gender", ["Male", "Female"]).notNullable();
    table.string("nationality", 20).notNullable();
    table.enu("category", ["Domestic", "Overseas"]).notNullable();

    table.string("phone_number", 13).notNullable();
    table.string("email", 40).notNullable();

    // ✅ Foreign keys
    table
      .integer("province_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("province")
      .onDelete("CASCADE")
      .onUpdate("CASCADE")

    table
      .integer("municipality_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("municipality")
      .onDelete("CASCADE")
      .onUpdate("CASCADE")

    table
      .integer("barangay_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("barangay")
      .onDelete("CASCADE")
      .onUpdate("CASCADE")

    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = function (knex) {
  return knex.schema.dropTable("tourist");
};
