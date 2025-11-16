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
      .enu("payment_method", ["gcash", "paymaya", "card", "grab_pay", "qrph", "cash_on_pickup"])
      .notNullable();
    table.string("payment_method_type", 50).nullable(); // specific type when using paymongo
    table.decimal("amount", 10, 2).notNullable();
    table.enu("status", ["pending", "paid", "failed", "refunded"]).defaultTo("pending");
    table
      .enu("payment_for", ["order", "booking", "reservation", "subscription"])
      .nullable();
    table.uuid("payer_id").notNullable();
    table.uuid("payment_for_id").notNullable();
    table.string("provider_reference", 100).nullable(); // PayMongo checkout/source ID
    table.string("refund_reference", 100).nullable(); // PayMongo refund ID
    table.string("currency", 3).defaultTo("PHP");
    table.json("metadata").nullable(); // Additional provider data
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();

    table.index(["payer_id", "payment_for_id"], "idx_payer_paymentfor");
    table.index("payment_for_id", "idx_payment_for_id");
    table.index("provider_reference", "idx_payment_provider_ref");
    table.index("status", "idx_payment_status");
    table.index("created_at", "idx_payment_created");
  });

  await createPaymentProcedures(knex);
};

exports.down = async function (knex) {
  await dropPaymentProcedures(knex);
  await knex.schema.dropTable("payment");
};
