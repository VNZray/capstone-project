exports.up = async function (knex) {
  await knex.schema.createTable("type", (table) => {
    table.increments("id").primary(); 
    table.string("type", 30).notNullable();
  });

  await knex.schema.createTable("category", (table) => {
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

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("category");
  await knex.schema.dropTableIfExists("type");
};