const { createOrderProcedures, dropOrderProcedures } = require("../procedures/orderProcedures.js");

exports.up = async function (knex) {
  // Create order table
  await knex.schema.createTable("order", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("business_id").notNullable()
      .references("id")
      .inTable("business")
      .onDelete("CASCADE");
    table.uuid("user_id").notNullable()
      .references("id")
      .inTable("user")  // Reference existing 'user' table
      .onDelete("CASCADE");
    table.string("order_number", 50).unique().notNullable();
    table.decimal("subtotal", 10, 2).notNullable();
    table.decimal("discount_amount", 10, 2).defaultTo(0);
    table.decimal("tax_amount", 10, 2).defaultTo(0);
    table.decimal("total_amount", 10, 2).notNullable();
    table.uuid("discount_id").nullable()  // applied discount
      .references("id")
      .inTable("discount")
      .onDelete("SET NULL");
    // Use datetime instead of timestamp to avoid DEFAULT current_timestamp()
    // and ON UPDATE current_timestamp() behaviors that cause bugs
    table.datetime("pickup_datetime").notNullable();
    table.text("special_instructions").nullable();
    table.enu("status", [
      "pending", 
      "accepted", 
      "preparing", 
      "ready_for_pickup", 
      "picked_up", 
      "cancelled_by_user", 
      "cancelled_by_business", 
      "failed_payment"
    ]).defaultTo("pending");
    // Payment info is in the payment table (single source of truth)
    // Query via: SELECT * FROM payment WHERE payment_for = 'order' AND payment_for_id = order.id
    
    // Customer arrival tracking
    table.string("arrival_code", 10).notNullable().defaultTo("000000"); // 6-digit code for customer to show on arrival
    table.timestamp("customer_arrived_at").nullable();
    
    // Order lifecycle tracking
    table.timestamp("confirmed_at").nullable();
    table.timestamp("preparation_started_at").nullable();
    table.timestamp("ready_at").nullable();
    table.timestamp("picked_up_at").nullable();
    
    // Cancellation details
    table.timestamp("cancelled_at").nullable();
    table.text("cancellation_reason").nullable();
    table.enu("cancelled_by", ["user", "business", "system"]).nullable();
    table.decimal("refund_amount", 10, 2).nullable();
    table.boolean("no_show").defaultTo(false);
    
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    
    table.index("business_id", "idx_order_business");
    table.index("arrival_code", "idx_order_arrival_code");
    table.index("user_id", "idx_order_user");
    table.index("status", "idx_order_status");
    table.index("pickup_datetime", "idx_order_pickup");
    table.index("order_number", "idx_order_number");
    // Performance indices for queries with time filtering
    table.index(["business_id", "created_at"], "idx_order_business_created");
    table.index(["user_id", "created_at"], "idx_order_user_created");
  });

  // Create order_item table
  await knex.schema.createTable("order_item", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("order_id").notNullable()
      .references("id")
      .inTable("order")
      .onDelete("CASCADE");
    table.uuid("product_id").notNullable()
      .references("id")
      .inTable("product")
      .onDelete("CASCADE");
    table.integer("quantity").notNullable();
    table.decimal("unit_price", 10, 2).notNullable(); // price at time of order
    table.decimal("total_price", 10, 2).notNullable();
    table.text("special_requests").nullable();
    
    table.index("order_id", "idx_order_items_order");
    table.index("product_id", "idx_order_items_product");
  });

  // Create stored procedures
  console.log("Creating order stored procedures...");
  try {
    await createOrderProcedures(knex);
    console.log("✅ Order stored procedures created successfully");
  } catch (error) {
    console.error("❌ Error creating order stored procedures:", error);
    throw error;
  }
};

exports.down = async function (knex) {
  // Drop stored procedures first
  console.log("Dropping order stored procedures...");
  try {
    await dropOrderProcedures(knex);
    console.log("✅ Order stored procedures dropped successfully");
  } catch (error) {
    console.error("❌ Error dropping order stored procedures:", error);
    throw error;
  }

  // Drop tables
  await knex.schema.dropTableIfExists("order_item");
  await knex.schema.dropTableIfExists("order");
};
