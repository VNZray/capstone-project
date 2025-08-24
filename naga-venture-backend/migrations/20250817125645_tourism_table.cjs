exports.up = function (knex) {
  return knex.schema.createTable("tourism", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())")); // default uuid()
    table.string("first_name", 30).notNullable();
    table.string("middle_name", 20).nullable();
    table.string("last_name", 30).notNullable();
    table.string("position", 20).nullable();
    table.string("email", 30).notNullable().unique();
    table.string("phone_number", 14).notNullable().unique();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("tourism");
};
