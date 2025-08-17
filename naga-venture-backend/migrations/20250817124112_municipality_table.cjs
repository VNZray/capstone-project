/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable("municipality", function (table) {
    table.increments("id").primary(); // Auto-increment primary key
    table.string("municipality", 100).notNullable(); // Municipality name

    // Foreign key to province
    table
      .integer("province_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("province")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = function (knex) {
  return knex.schema.dropTable("municipality");
};
