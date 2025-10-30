exports.up = function (knex) {
  return knex.schema.createTable("report_attachment", function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())")); // MariaDB's UUID()
    
    // Report reference
    table
      .uuid("report_id")
      .notNullable()
      .references("id")
      .inTable("report")
      .onDelete("CASCADE");
    
    // File information
    table.text("file_url").notNullable(); // Supabase bucket URL
    table.string("file_name", 255).notNullable();
    table.string("file_type", 50).nullable(); // image/jpeg, image/png, etc.
    table.integer("file_size").nullable(); // in bytes
    
    // Timestamp
    table.timestamp("uploaded_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("report_attachment");
};
