// migrations/xxxx_create_payment.js
const {
  createGuestProcedures,
  dropGuestProcedures,
} = require("../procedures/guestProcedures");

exports.up = async function (knex) {
  await knex.schema.createTable("guest", function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("(uuid())"));
    table.string("name", 60).notNullable();
    table.integer("age").notNullable();
    table.string("gender", 10).notNullable();
    table
      .uuid("booking_id")
      .notNullable()
      .references("id")
      .inTable("booking")
      .onDelete("CASCADE");

    table.index(["booking_id"], "idx_booking");
  });

  await createGuestProcedures(knex);
};

exports.down = async function (knex) {
  await knex.schema.dropTable("guest");
  await dropGuestProcedures(knex);
};
