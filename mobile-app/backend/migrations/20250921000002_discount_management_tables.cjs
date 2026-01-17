const { createDiscountProcedures, dropDiscountProcedures } = require("../procedures/discount/discount.procedures.cjs");

exports.up = async function (knex) {
  // Create discount table (simplified MVP structure - fixed discount amounts only)
  await knex.schema.createTable("discount", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("business_id").notNullable()
      .references("id")
      .inTable("business")
      .onDelete("CASCADE");
    table.string("name", 255).notNullable();
    table.text("description").nullable();
    // Removed: discount_type, discount_value (individual prices stored in discount_product table)
    // Removed: minimum_order_amount, maximum_discount_amount, usage_limit_per_customer, usage_limit, current_usage_count
    table.timestamp("start_datetime").notNullable();
    table.timestamp("end_datetime").nullable();
    table.enu("status", ["active", "inactive", "expired", "paused"]).defaultTo("active");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index("business_id", "idx_discount_business");
    table.index(["start_datetime", "end_datetime"], "idx_discount_dates");
    table.index("status", "idx_discount_status");
  });

  // Create discount_product table (products eligible for discounts with per-product controls)
  await knex.schema.createTable("discount_product", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("discount_id").notNullable()
      .references("id")
      .inTable("discount")
      .onDelete("CASCADE");
    table.uuid("product_id").notNullable()
      .references("id")
      .inTable("product")
      .onDelete("CASCADE");
    table.decimal("discounted_price", 10, 2).notNullable().comment("Individual discounted price for this product");
    table.integer("stock_limit").nullable().comment("Stock limit for this product. NULL = unlimited");
    table.integer("current_stock_used").defaultTo(0).comment("Current stock used for this product");
    table.integer("purchase_limit").nullable().comment("Max quantity per customer. NULL = unlimited");
    table.timestamp("created_at").defaultTo(knex.fn.now());

    table.unique(["discount_id", "product_id"], "unique_discount_product");
  });

  // Create stored procedures
  console.log("Creating discount stored procedures...");
  try {
    await createDiscountProcedures(knex);
    console.log("✅ Discount stored procedures created successfully");
  } catch (error) {
    console.error("❌ Error creating discount stored procedures:", error);
    throw error;
  }
};

exports.down = async function (knex) {
  // Drop stored procedures first
  console.log("Dropping discount stored procedures...");
  try {
    await dropDiscountProcedures(knex);
    console.log("✅ Discount stored procedures dropped successfully");
  } catch (error) {
    console.error("❌ Error dropping discount stored procedures:", error);
    throw error;
  }

  // Drop tables
  await knex.schema.dropTableIfExists("discount_product");
  await knex.schema.dropTableIfExists("discount");
};
