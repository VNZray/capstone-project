// migrations/20250818120000_create_permit_table.js
const {
  createPermitProcedures,
  dropPermitProcedures,
} = require("../procedures/permit/permit.procedures.cjs");

exports.up = async function (knex) {
  await knex.schema.createTable("permit", (table) => {
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
    table.date("expiration_date").nullable();
    // approved_at starts NULL and is set only upon approval
    table.timestamp("approved_at").nullable().defaultTo(null);
  });
  await createPermitProcedures(knex);

  console.log("Permit table and procedures created.");
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("permit");
  await dropPermitProcedures(knex);
};
