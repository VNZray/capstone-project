exports.up = function (knex) {
  return knex.schema.createTable("report", function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())")); // MariaDB's UUID()
    
    // Reporter information
    table.uuid("reporter_id").references("id").inTable("user").onDelete("CASCADE");
    // Target entity (polymorphic association)
    table.enu("target_type", ["business", "event", "tourist_spot", "accommodation"],
        {useNative: true,enumName: "report_target_type",}).notNullable();
    table.string("target_id").notNullable(); // Cannot be FK due to polymorphic nature    
    // Report details
    table.string("title", 100).notNullable();
    table.text("description").notNullable();
    
    // Status tracking
    table
      .enu("status", ["submitted", "under_review", "in_progress", "resolved", "rejected"], {
        useNative: true,
        enumName: "report_status",
      })
      .notNullable()
      .defaultTo("submitted");
    
    table.timestamps(true, true); // created_at, updated_at
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("report");
};
