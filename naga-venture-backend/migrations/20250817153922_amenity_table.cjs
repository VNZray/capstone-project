exports.up = function (knex) {
  return knex.schema.createTable("amenity", function (table) {
    table.increments("id").primary(); // int(11) AUTO_INCREMENT PRIMARY KEY
    table.string("name", 40).notNullable();
    table.string("icon", 255).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("amenity");
};
