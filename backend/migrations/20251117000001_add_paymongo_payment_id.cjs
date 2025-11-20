/**
 * Add paymongo_payment_id field to payment table
 * This stores the actual PayMongo payment ID after payment is completed
 * Separate from provider_reference which stores checkout session/source ID
 */

exports.up = async function (knex) {
  await knex.schema.alterTable("payment", (table) => {
    table.string("paymongo_payment_id", 100).nullable()
      .comment("PayMongo payment ID once payment is completed");
    
    table.index("paymongo_payment_id", "idx_payment_paymongo_payment_id");
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("payment", (table) => {
    table.dropIndex("paymongo_payment_id", "idx_payment_paymongo_payment_id");
    table.dropColumn("paymongo_payment_id");
  });
};
