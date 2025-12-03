/**
 * Migration: Add paymongo_payment_intent_id to order table
 * 
 * This column stores the PayMongo Payment Intent ID for orders
 * using the Payment Intent workflow (as opposed to Checkout Sessions).
 * 
 * @see docs/ORDERING_SYSTEM_AUDIT.md - Phase 4
 */

exports.up = function(knex) {
  return knex.schema.alterTable('order', function(table) {
    // Add Payment Intent ID column (nullable, for Payment Intent workflow)
    table.string('paymongo_payment_intent_id', 255)
      .nullable()
      .after('paymongo_checkout_id')
      .comment('PayMongo Payment Intent ID for Payment Intent workflow');
    
    // Add index for faster lookups
    table.index('paymongo_payment_intent_id', 'idx_order_payment_intent_id');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('order', function(table) {
    table.dropIndex('paymongo_payment_intent_id', 'idx_order_payment_intent_id');
    table.dropColumn('paymongo_payment_intent_id');
  });
};
