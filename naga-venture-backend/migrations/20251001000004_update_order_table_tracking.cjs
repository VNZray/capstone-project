exports.up = async function (knex) {
  // Add tracking fields to existing order table
  await knex.schema.alterTable("order", (table) => {
    // Customer arrival tracking
    table.string("arrival_code", 10).nullable(); // 6-digit code for customer to show on arrival
    table.timestamp("customer_arrived_at").nullable();
    
    // Order lifecycle tracking
    table.timestamp("confirmed_at").nullable();
    table.timestamp("preparation_started_at").nullable();
    table.timestamp("ready_at").nullable();
    table.timestamp("picked_up_at").nullable();
    
    // Cancellation details
    table.timestamp("cancelled_at").nullable();
    table.text("cancellation_reason").nullable();
    table.decimal("refund_amount", 10, 2).nullable();
    table.boolean("no_show").defaultTo(false);
    
    // Add indexes
    table.index("arrival_code", "idx_order_arrival_code");
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("order", (table) => {
    table.dropColumn("arrival_code");
    table.dropColumn("customer_arrived_at");
    table.dropColumn("confirmed_at");
    table.dropColumn("preparation_started_at");
    table.dropColumn("ready_at");
    table.dropColumn("picked_up_at");
    table.dropColumn("cancelled_at");
    table.dropColumn("cancellation_reason");
    table.dropColumn("refund_amount");
    table.dropColumn("no_show");
    table.dropIndex("arrival_code", "idx_order_arrival_code");
  });
};
