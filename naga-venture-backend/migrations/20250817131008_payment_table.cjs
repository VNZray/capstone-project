// migrations/xxxx_create_payment.js
exports.up = function (knex) {
  return knex.schema.createTable("payment", function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("(uuid())"));
    table
      .enu("payment_type", ["Full Payment", "Partial Payment"])
      .notNullable();
    table
      .enu("payment_method", ["Gcash", "Paymaya", "Credit Card"])
      .notNullable();
    table.float("amount").notNullable();
    table.enu("status", ["Paid", "Pending Balance"]).defaultTo(null);

    // Foreign keys
    table
      .uuid("tourist_id")
      .notNullable()
      .references("id")
      .inTable("tourist")
      .onDelete("CASCADE");
    table
      .uuid("booking_id")
      .notNullable()
      .references("id")
      .inTable("booking")
      .onDelete("CASCADE");

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("payment");
};
