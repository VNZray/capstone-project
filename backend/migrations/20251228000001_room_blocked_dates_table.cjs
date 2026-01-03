const {
  createProcedures,
  dropProcedures,
} = require("../procedures/accommodation/roomBlockedDatesProcedures.cjs");

/**
 * Migration: Room Blocked Dates Table
 *
 * This table allows business owners to block specific date ranges for rooms,
 * marking them as unavailable for maintenance, renovation, or other reasons.
 */
exports.up = async function (knex) {
  await knex.schema.createTable("room_blocked_dates", function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("(uuid())"));

    table
      .uuid("room_id")
      .notNullable()
      .references("id")
      .inTable("room")
      .onDelete("CASCADE");

    table
      .uuid("business_id")
      .notNullable()
      .references("id")
      .inTable("business")
      .onDelete("CASCADE");

    table.date("start_date").notNullable();
    table.date("end_date").notNullable();

    table
      .enum("block_reason", [
        "Maintenance",
        "Renovation",
        "Private",
        "Seasonal",
        "Other"
      ])
      .notNullable()
      .defaultTo("Other");

    table.string("notes", 500).nullable();

    table
      .uuid("created_by")
      .nullable()
      .references("id")
      .inTable("user")
      .onDelete("SET NULL");

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  await createProcedures(knex);

  console.log("Room blocked dates table and procedures created.");
};

exports.down = async function (knex) {
  await dropProcedures(knex);
  await knex.schema.dropTableIfExists("room_blocked_dates");
};
