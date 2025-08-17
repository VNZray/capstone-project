exports.up = function (knex) {
  return knex.schema.createTable("category", (table) => {
    table.increments("id").primary();
    table.string("category", 30).notNullable();

    table
      .integer("type_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("type")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("category");
};
