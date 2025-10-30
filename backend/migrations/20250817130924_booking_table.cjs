const {
  createProcedures,
  dropProcedures,
} = require("../procedures/bookingProcedures");

exports.up = async function (knex) {
  await knex.schema.createTable("booking", function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("(uuid())"));
    table.integer("pax", 3).notNullable();
    table.integer("num_children", 3).notNullable().defaultTo(0);
    table.integer("num_adults", 3).notNullable().defaultTo(0);
    table.integer("num_infants", 3).notNullable().defaultTo(0);
    table.integer("foreign_counts", 3).notNullable().defaultTo(0);
    table.integer("domestic_counts", 3).notNullable().defaultTo(0);
    table.integer("overseas_counts", 3).notNullable().defaultTo(0);
    table.integer("local_counts", 3).notNullable().defaultTo(0);
    table.string("trip_purpose", 30).notNullable();
    table.date("check_in_date").notNullable();
    table.date("check_out_date").notNullable();
    table.float("total_price").notNullable();
    table.float("balance").nullable();
    table
      .enu("booking_status", [
        "Pending",
        "Reserved",
        "Checked-In",
        "Checked-Out",
        "Canceled",
      ])
      .notNullable()
      .defaultTo("Pending");

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
    table
      .uuid("tourist_id")
      .notNullable()
      .references("id")
      .inTable("tourist")
      .onDelete("CASCADE");

    // Timestamps
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  await createProcedures(knex);
};

exports.down = async function (knex) {
  await dropProcedures(knex);
  await knex.schema.dropTable("booking");
};
