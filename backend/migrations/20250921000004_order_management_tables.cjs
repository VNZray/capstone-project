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
    table.timestamp("pickup_datetime").notNullable();
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
    table.enu("payment_status", ["pending", "paid", "failed", "refunded"]).defaultTo("pending");
    table.enu("payment_method", ["cash_on_pickup", "paymongo"]).defaultTo("cash_on_pickup");
    table.string("payment_method_type", 50).nullable(); // gcash, card, paymaya, grab_pay, qrph when paymongo
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    
    table.index("business_id", "idx_order_business");
    table.index("user_id", "idx_order_user");
    table.index("status", "idx_order_status");
    table.index("pickup_datetime", "idx_order_pickup");
    table.index("order_number", "idx_order_number");
    // Performance indices for queries with time filtering
    table.index(["business_id", "created_at"], "idx_order_business_created");
    table.index(["user_id", "created_at"], "idx_order_user_created");
    table.index("payment_method", "idx_order_payment_method");
    table.index("payment_status", "idx_order_payment_status");
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
