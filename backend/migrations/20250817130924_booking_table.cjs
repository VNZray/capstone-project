const {
  createProcedures,
  dropProcedures,
} = require("../procedures/accommodation/booking.procedures.cjs");

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
    table.enum('booking_type', ['overnight', 'short-stay']).defaultTo('overnight');
    table.date("check_in_date").notNullable();
    table.date("check_out_date").notNullable();
    table.time("check_in_time").notNullable();
    table.time("check_out_time").notNullable();
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

    // Booking source tracking (online vs walk-in)
    table
      .enum("booking_source", ["online", "walk-in"])
      .notNullable()
      .defaultTo("online");

    // Guest info for walk-in guests who may not have tourist account
    table.string("guest_name", 100).nullable();
    table.string("guest_phone", 20).nullable();
    table.string("guest_email", 100).nullable();

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

  console.log("Booking table and procedures created.");
};

exports.down = async function (knex) {
  await dropProcedures(knex);
  await knex.schema.dropTable("booking");
};
