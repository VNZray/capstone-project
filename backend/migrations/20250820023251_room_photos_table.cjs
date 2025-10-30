// migrations/20250818120000_create_permit_table.js
exports.up = function (knex) {
  return knex.schema.createTable("room_photos", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table
      .uuid("room_id")
      .notNullable()
      .references("id")
      .inTable("room")
      .onDelete("CASCADE");
    table.text("file_url").notNullable(); // Supabase/Cloud storage file path
    table.string("file_format", 10).notNullable(); // e.g. pdf, jpg, png
    table.bigInteger("file_size"); // in bytes
    table.timestamp("uploaded_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("room_photos");
};
