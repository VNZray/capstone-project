/**
 * Refund Table Migration
 *
 * Note: Refund tracking columns (refund_id, refund_requested_at) are now part
 * of the original order table migration.
 *
 * This migration creates the refund table and its stored procedures to support:
 * - Full and partial refunds
 * - Refund history and audit trail
 * - Integration with PayMongo refund API
 * - Support for both orders and bookings
 *
 * @see docs/REFUND_CANCELLATION_GUIDE.md
 */

const { createRefundProcedures, dropRefundProcedures } = require("../procedures/shop/refund.procedures.cjs");

exports.up = async function (knex) {
  console.log('Creating refund table and procedures...');

  // Create refund table
  await knex.schema.createTable("refund", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));

    // Reference to order or booking
    table.enu("refund_for", ["order", "booking"]).notNullable();
    table.uuid("refund_for_id").notNullable(); // order_id or booking_id

    // Reference to payment record
    table.uuid("payment_id").notNullable()
      .references("id")
      .inTable("payment")
      .onDelete("CASCADE");

    // User who requested the refund
    table.uuid("requested_by").notNullable()
      .references("id")
      .inTable("user")
      .onDelete("CASCADE");

    // Refund amounts
    table.decimal("amount", 10, 2).notNullable(); // Refund amount in PHP
    table.decimal("original_amount", 10, 2).notNullable(); // Original payment amount
    table.string("currency", 3).defaultTo("PHP");

    // Refund reason and notes
    table.enu("reason", [
      "requested_by_customer",
      "duplicate",
      "fraudulent",
      "changed_mind",
      "wrong_order",
      "product_unavailable",
      "business_issue",
      "others"
    ]).notNullable().defaultTo("requested_by_customer");
    table.text("notes").nullable(); // Optional customer notes
    table.text("admin_notes").nullable(); // Admin/system notes

    // Refund status tracking
    table.enu("status", [
      "pending",        // Request submitted, not yet processed
      "processing",     // PayMongo is processing
      "succeeded",      // Refund completed
      "failed",         // Refund failed
      "cancelled"       // Refund request cancelled
    ]).defaultTo("pending");

    // PayMongo integration
    table.string("paymongo_refund_id", 100).nullable().unique(); // PayMongo refund ID (ref_...)
    table.string("paymongo_payment_id", 100).nullable(); // Original PayMongo payment ID
    table.json("paymongo_response").nullable(); // Full PayMongo refund response

    // Error handling
    table.text("error_message").nullable(); // Error message if failed
    table.integer("retry_count").defaultTo(0); // Number of retry attempts

    // Timestamps
    table.timestamp("requested_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("processed_at").nullable(); // When PayMongo processed it
    table.timestamp("completed_at").nullable(); // When refund was confirmed
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();

    // Indices for efficient queries
    table.index("refund_for_id", "idx_refund_for_id");
    table.index("payment_id", "idx_refund_payment_id");
    table.index("requested_by", "idx_refund_requested_by");
    table.index("paymongo_refund_id", "idx_refund_paymongo_id");
    table.index("status", "idx_refund_status");
    table.index("requested_at", "idx_refund_requested_at");
    table.index(["refund_for", "refund_for_id"], "idx_refund_for_lookup");
  });


  // Create stored procedures for refund operations
  console.log("Creating refund stored procedures...");
  try {
    await createRefundProcedures(knex);
    console.log("✅ Refund stored procedures created successfully");
  } catch (error) {
    console.error("❌ Error creating refund stored procedures:", error);
    throw error;
  }

  console.log("✅ Refund table and procedures created successfully");
};

exports.down = async function (knex) {
  console.log("Dropping refund tables and procedures...");

  // Drop stored procedures first
  try {
    await dropRefundProcedures(knex);
    console.log("✅ Refund stored procedures dropped successfully");
  } catch (error) {
    console.error("❌ Error dropping refund stored procedures:", error);
  }
  // Drop refund table
  await knex.schema.dropTableIfExists("refund");
};
