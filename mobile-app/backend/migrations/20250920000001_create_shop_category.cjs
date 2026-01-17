const { createShopCategoryProcedures, dropShopCategoryProcedures } = require("../procedures/shop/shop-category.procedures.cjs");

exports.up = async function (knex) {
  // Create unified shop_category table
  await knex.schema.createTable("shop_category", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("business_id").notNullable()
      .references("id")
      .inTable("business")
      .onDelete("CASCADE");
    table.string("name", 255).notNullable();
    table.text("description").nullable();
    table.enu("category_type", ["product", "service", "both"]).defaultTo("both");
    table.integer("display_order").defaultTo(0);
    table.enu("status", ["active", "inactive"]).defaultTo("active");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index("business_id", "idx_shop_category_business");
    table.index("category_type", "idx_shop_category_type");
    table.index("status", "idx_shop_category_status");
  });

  // Create stored procedures
  console.log("Creating shop category stored procedures...");
  try {
    await createShopCategoryProcedures(knex);
    console.log("✅ Shop category stored procedures created successfully");
  } catch (error) {
    console.error("❌ Error creating shop category stored procedures:", error);
    throw error;
  }
};

exports.down = async function (knex) {
  // Drop stored procedures first
  console.log("Dropping shop category stored procedures...");
  try {
    await dropShopCategoryProcedures(knex);
    console.log("✅ Shop category stored procedures dropped successfully");
  } catch (error) {
    console.error("❌ Error dropping shop category stored procedures:", error);
    throw error;
  }

  // Drop table
  await knex.schema.dropTableIfExists("shop_category");
};
