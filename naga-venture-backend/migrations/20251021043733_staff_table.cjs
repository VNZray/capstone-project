// migrations/xxxx_create_payment.js

exports.up = async function (knex) {
  await knex.schema.createTable("staff", function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("(uuid())"));
    table.string("first_name", 30).notNullable();
    table.string("middle_name", 20).nullable();
    table.string("last_name", 30).notNullable();
    table
      .enu("role", ["Manager", "Room Manager", "Receptionist"])
      .defaultTo("Manager");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTable("staff");
};
