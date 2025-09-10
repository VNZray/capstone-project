const {
  createProcedures,
  dropProcedures,
} = require("../procedures/touristProcedures");

exports.up = async function (knex) {
  await knex.schema.createTable("tourist", function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));

    table.string("first_name", 30).notNullable();
    table.string("middle_name", 20).nullable();
    table.string("last_name", 30).notNullable();

    table
      .enu("ethnicity", ["Bicolano", "Non-Bicolano", "Foreigner"])
      .notNullable();
    table.date("birthday").notNullable();
    table.integer("age").notNullable();
    table.enu("gender", ["Male", "Female", "Prefer not to say"]).notNullable();
    table.string("nationality", 20).notNullable();
    table.enu("category", ["Domestic", "Overseas"]).notNullable();

    table.string("phone_number", 13).notNullable();
    table.string("email", 40).notNullable();

    // ✅ Foreign keys
    table
      .integer("address_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("address")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  await createProcedures(knex);
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = async function (knex) {
  await knex.schema.dropTable("tourist");
  await dropProcedures(knex);
};
