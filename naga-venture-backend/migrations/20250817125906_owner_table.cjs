// migrations/20250817100000_owner.js

const {
  createOwnerProcedures,
  dropOwnerProcedures,
} = require("../procedures/ownerProcedures");

exports.up = async function (knex) {
  await knex.schema.createTable("owner", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())")); // MariaDB's UUID()
    table.string("first_name", 30).notNullable();
    table.string("middle_name", 20);
    table.string("last_name", 30).notNullable();
    table.integer("age", 2);
    table.date("birthday");
    table.enu("gender", ["Male", "Female"]);
    table.string("email", 40).notNullable().unique();
    table.string("phone_number", 13).notNullable().unique();
    table.enu("business_type", ["Shop", "Accommodation", "Both"]).notNullable();
    table
      .integer("address_id")
      .unsigned()
      .references("id")
      .inTable("address")
      .nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  await createOwnerProcedures(knex);
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("owner");
  await dropOwnerProcedures(knex);
};
