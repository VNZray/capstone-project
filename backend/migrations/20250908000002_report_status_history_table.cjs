exports.up = function (knex) {
  return knex.schema.createTable("report_status_history", function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())")); // MariaDB's UUID()
    
    // Report reference
    table
      .uuid("report_id")
      .notNullable()
      .references("id")
      .inTable("report")
      .onDelete("CASCADE");
    
    // Status information
    table
      .enu("status", ["submitted", "under_review", "in_progress", "resolved", "rejected"], {
        useNative: true,
        enumName: "report_status_history_status",
      })
      .notNullable();
    
    // Remarks from tourism staff
    table.text("remarks").nullable();
    
    // Who updated (nullable as requested)
    table
      .uuid("updated_by")
      .nullable()
      .references("id")
      .inTable("user")
      .onDelete("SET NULL");
    
    // Timestamp for this status change
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("report_status_history");
};
