const { createPromotionProcedures, dropPromotionProcedures } = require("../procedures/promotion/promotion.procedures.cjs");

exports.up = async function (knex) {
  // Create promo_type table
  await knex.schema.createTable("promo_type", (table) => {
    table.increments("id").primary();
    table.enum("promo_name", ["discount_coupon", "promo_code", "room_discount"]).notNullable().unique();
  });

  // Seed promo_type table
  await knex("promo_type").insert([
    { promo_name: "discount_coupon" },
    { promo_name: "room_discount" },
    { promo_name: "promo_code" }
  ]);

  // Create promotion table
  await knex.schema.createTable("promotion", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));

    table
      .uuid("business_id")
      .notNullable()
      .references("id")
      .inTable("business")
      .onDelete("CASCADE");

    table.string("title", 255).notNullable();
    table.text("description").nullable();
    table.string("image_url", 500).nullable();
    table.string("external_link", 500).nullable();
    table.string("promo_code", 50).nullable();
    table.integer("discount_percentage").nullable();
    table.decimal("fixed_discount_amount", 10, 2).nullable();
    table.integer("usage_limit").nullable();
    table.integer("used_count").defaultTo(0);
    table.timestamp("start_date").notNullable();
    table.timestamp("end_date").nullable();
    table.boolean("is_active").defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.integer("promo_type")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("promo_type")
      .onDelete("RESTRICT");

    table.index("business_id", "idx_promotion_business");
    table.index(["start_date", "end_date"], "idx_promotion_dates");
    table.index("is_active", "idx_promotion_active");
    table.index("promo_type", "idx_promotion_type");
  });

  // Create stored procedures
  console.log("Creating promotion stored procedures...");
  try {
    await createPromotionProcedures(knex);
    console.log("✅ Promotion stored procedures created successfully");
  } catch (error) {
    console.error("❌ Error creating promotion stored procedures:", error);
    throw error;
  }
};

exports.down = async function (knex) {
  // Drop stored procedures first
  console.log("Dropping promotion stored procedures...");
  try {
    await dropPromotionProcedures(knex);
    console.log("✅ Promotion stored procedures dropped successfully");
  } catch (error) {
    console.error("❌ Error dropping promotion stored procedures:", error);
    throw error;
  }

  // Drop tables
  await knex.schema.dropTableIfExists("promotion");
  await knex.schema.dropTableIfExists("promo_type");
};
