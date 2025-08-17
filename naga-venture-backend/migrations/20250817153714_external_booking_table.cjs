exports.up = function (knex) {
  return knex.schema.createTable("external_booking", function (table) {
    table.increments("id").primary(); // int(11) AUTO_INCREMENT PRIMARY KEY
    table.string("name", 40).notNullable();
    table.string("link", 255).notNullable();

    table
      .uuid("business_id")
      .notNullable()
      .references("id")
      .inTable("business")
      .onDelete("CASCADE");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("external_booking");
};
