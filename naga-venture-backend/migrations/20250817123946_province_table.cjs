/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable("province", function (table) {
    table.increments("id").primary(); // Auto-increment primary key
    table.string("name", 100).notNullable(); // Province name
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = function (knex) {
  return knex.schema.dropTable("province");
};
