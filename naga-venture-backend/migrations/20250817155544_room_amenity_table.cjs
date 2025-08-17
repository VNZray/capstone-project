exports.up = function (knex) {
  return knex.schema.createTable("room_amenities", function (table) {
    table.increments("id").primary(); // int(11) AUTO_INCREMENT PRIMARY KEY
    table
      .uuid("room_id")
      .notNullable()
      .references("id")
      .inTable("room")
      .onDelete("CASCADE"); // assumes you have a 'room' table
    table
      .integer("amenity_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("amenity")
      .onDelete("CASCADE"); // assumes you have an 'amenities' table
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("room_amenities");
};
