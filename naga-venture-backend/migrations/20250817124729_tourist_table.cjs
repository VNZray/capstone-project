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
    table.date("birthdate").notNullable();
    table.integer("age").notNullable();
    table.enu("gender", ["Male", "Female", "Prefer not to say"]).notNullable();
    table.string("nationality", 20).notNullable();
    table.enu("category", ["Domestic", "Overseas"]).notNullable();

    // Foreign keys
    table
      .integer("barangay_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("barangay")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("user")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

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
