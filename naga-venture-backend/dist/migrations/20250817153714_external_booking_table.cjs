const {
  createExternalBookingProcedures,
  dropExternalBookingProcedures,
} = require("../procedures/externalBookingProcedures");

exports.up = async function (knex) {
  await knex.schema.createTable("external_booking", function (table) {
    table.increments("id").primary();
    table.string("name", 40).notNullable();
    table.string("link", 255).notNullable();
    table
      .uuid("business_id")
      .notNullable()
      .references("id")
      .inTable("business")
      .onDelete("CASCADE");
  });

  await createExternalBookingProcedures(knex);
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("external_booking");
  await dropExternalBookingProcedures(knex);
};
