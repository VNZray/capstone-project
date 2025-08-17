exports.up = function (knex) {
  return knex.schema.createTable("business_amenities", function (table) {
    table.increments("id").primary(); // int(11) AUTO_INCREMENT PRIMARY KEY
    table
      .uuid("business_id")
      .notNullable()
      .references("id")
      .inTable("business")
      .onDelete("CASCADE");
    table
      .integer("amenity_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("amenity")
      .onDelete("CASCADE");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("business_amenities");
};
