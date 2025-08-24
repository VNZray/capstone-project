// migrations/20250818120000_create_permit_table.js
exports.up = function (knex) {
  return knex.schema.createTable("permit", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table
      .uuid("business_id")
      .notNullable()
      .references("id")
      .inTable("business")
      .onDelete("CASCADE");
    table.string("permit_type", 100).notNullable();
    table.text("file_url").notNullable(); // Supabase/Cloud storage file path
    table.string("file_format", 10).notNullable(); // e.g. pdf, jpg, png
    table.bigInteger("file_size"); // in bytes
    table.string("status", 50).defaultTo("pending"); // pending, approved, rejected
    table.timestamp("submitted_at").defaultTo(knex.fn.now());
    table.timestamp("approved_at");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("permit");
};
