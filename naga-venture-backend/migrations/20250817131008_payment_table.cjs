const {
  createPaymentProcedures,
  dropPaymentProcedures,
} = require("../procedures/paymentProcedures");

exports.up = async function (knex) {
  await knex.schema.createTable("payment", function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("(uuid())"));
    table.enu("payer_type", ["Tourist", "Owner"]).notNullable();
    table.enu("payment_type", ["Full Payment", "Partial Payment"]).nullable();
    table
      .enu("payment_method", ["Gcash", "Paymaya", "Credit Card", "Cash"])
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

  await createPaymentProcedures(knex);
};

exports.down = async function (knex) {
  await dropPaymentProcedures(knex);
  await knex.schema.dropTable("payment");
};
