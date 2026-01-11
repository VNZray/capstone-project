const {
  createProcedures,
  dropProcedures,
} = require("../procedures/accommodation/guest.procedures.cjs");

/**
 * Guest table migration
 * Creates guest table for storing walk-in guest information
 * Must be created before booking table
 */
exports.up = async function (knex) {
  await knex.schema.createTable("guest", function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("(uuid())"));
    table.string("first_name", 100).notNullable();
    table.string("middle_name", 100).nullable();
    table.string("last_name", 100).notNullable();
    table.enum("gender", ["Male", "Female", "Other", "Prefer not to say"]).nullable();
    table.string("ethnicity", 50).nullable();
    table.string("email", 100).nullable();
    table.string("phone_number", 20).nullable();

    // Timestamps
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));

    // Indexes for searching
    table.index(["first_name", "last_name"], "idx_guest_name");
    table.index("phone_number", "idx_guest_phone");
    table.index("email", "idx_guest_email");
  });

  await createProcedures(knex);

  console.log("Guest table and procedures created.");
};

exports.down = async function (knex) {
  await dropProcedures(knex);
  await knex.schema.dropTable("guest");
};
