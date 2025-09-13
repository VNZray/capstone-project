// migrations/xxxx_create_payment.js
exports.up = function (knex) {
  return knex.schema.createTable("payment", function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("(uuid())"));
    table.enu("payer_type", ["Tourist", "Owner"]).notNullable();
    table
      .enu("payment_type", ["Full Payment", "Partial Payment"])
      .notNullable();
    table
      .enu("payment_method", ["Gcash", "Paymaya", "Credit Card"])
      .notNullable();
    table.float("amount").notNullable();
    table.enu("status", ["Paid", "Pending Balance"]).defaultTo(null);
    table
      .enu("payment_for", ["Reservation", "Pending Balance", "Subscription"])
      .nullable();
    table.uuid("payer_id").notNullable();
    table.uuid("payment_for_id").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();

    table.index(["payer_id", "payment_for_id"], "idx_payer_paymentfor");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("payment");
};
