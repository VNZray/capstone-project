exports.up = function (knex) {
  return knex.schema.createTable("type", (table) => {
    table.increments("id").primary(); 
    table.string("type", 30).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("type");
};