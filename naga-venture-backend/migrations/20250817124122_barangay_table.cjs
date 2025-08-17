/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable("barangay", function (table) {
    table.increments("id").primary(); // Auto-increment primary key
    table.string("name", 100).notNullable(); // Municipality name

    // Foreign key to province
    table
      .integer("municipality_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("municipality")
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
