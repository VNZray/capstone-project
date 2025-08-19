exports.up = function (knex) {
  return knex.schema.createTable("room_amenities", function (table) {
    table.increments("id").primary(); // int(11) AUTO_INCREMENT PRIMARY KEY
    table
      .uuid("room_id")
      .notNullable()
      .references("id")
      .inTable("room")
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
  return knex.schema.dropTableIfExists("room_amenities");
};
