const {
  createPaymentProcedures,
  dropPaymentProcedures,
} = require("../procedures/paymentProcedures");

exports.up = async function (knex) {
  await knex.schema.createTable("payment", function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("(uuid())"));
    table.enu("payer_type", ["Tourist", "Owner"]).notNullable();
    table.enu("payment_type", ["Full Payment", "Partial Payment"]).nullable(); // For bookings: full vs partial payment
    table
      .enu("payment_method", ["gcash", "paymaya", "card", "cash_on_pickup"])
      .notNullable(); // The actual payment method used
    table.decimal("amount", 10, 2).notNullable();
    table.enu("status", ["pending", "paid", "failed", "refunded"]).defaultTo("pending");
    table
      .enu("payment_for", ["order", "booking", "reservation", "subscription"])
      .nullable();
    table.uuid("payer_id").notNullable();
    table.uuid("payment_for_id").notNullable();
    table.string("payment_intent_id", 100).nullable(); // PayMongo Payment Intent ID for PIPM workflow
    table.string("payment_method_id", 100).nullable(); // PayMongo Payment Method ID for PIPM workflow
    table.string("client_key", 255).nullable(); // PayMongo client key for 3DS authentication
    table.string("paymongo_payment_id", 100).nullable(); // PayMongo payment ID once payment is completed
    table.string("refund_reference", 100).nullable(); // PayMongo refund ID
    table.string("currency", 3).defaultTo("PHP");
    table.json("metadata").nullable(); // Additional provider data
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();

    table.index(["payer_id", "payment_for_id"], "idx_payer_paymentfor");
    table.index("payment_for_id", "idx_payment_for_id");
    table.index("payment_intent_id", "idx_payment_intent_id");
    table.index("payment_method_id", "idx_payment_method_id");
    table.index("paymongo_payment_id", "idx_payment_paymongo_payment_id");
    table.index("status", "idx_payment_status");
    table.index("created_at", "idx_payment_created");
  });

  await createPaymentProcedures(knex);

  console.log("Payment table and procedures created.");
};

exports.down = async function (knex) {
  await dropPaymentProcedures(knex);
  await knex.schema.dropTable("payment");
};
