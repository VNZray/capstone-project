// migrations/xxxx_create_room_table.js
exports.up = function (knex) {
  return knex.schema.createTable("room", function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table
      .uuid("business_id")
      .notNullable()
      .references("id")
      .inTable("business")
      .onDelete("CASCADE");
    table.string("room_number", 20).notNullable();
    table.string("room_type", 20).notNullable();
    table.text("description").nullable();
    table.float("room_price").notNullable();
    table.string("room_image", 255).nullable();
    table
      .enum("status", ["Available", "Occupied", "Maintenance", "Reserved"])
      .notNullable();
    table.integer("capacity").unsigned().notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("room");
};
