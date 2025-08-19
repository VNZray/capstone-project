/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable("province", function (table) {
    table.increments("id").primary(); // Auto-increment primary key
    table.string("province", 100).notNullable(); 
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = function (knex) {
  return knex.schema.dropTable("province");
};
