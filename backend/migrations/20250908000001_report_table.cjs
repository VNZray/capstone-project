const {
  createReportProcedures,
  dropReportProcedures
} = require("../procedures/report/report.procedures.cjs");

exports.up = async function (knex) {
  await knex.schema.createTable("report", function (table) {
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

  // Create stored procedures
  console.log("Creating report stored procedures...");
  try {
    await createReportProcedures(knex);
    console.log("✅ Report stored procedures created successfully");
  } catch (error) {
    console.error("❌ Error creating report stored procedures:", error);
    throw error;
  }
};

exports.down = async function (knex) {
  // Drop stored procedures first
  console.log("Dropping report stored procedures...");
  try {
    await dropReportProcedures(knex);
    console.log("✅ Report stored procedures dropped successfully");
  } catch (error) {
    console.error("❌ Error dropping report stored procedures:", error);
    throw error;
  }

  // Drop tables
  await knex.schema.dropTable("report");
};
