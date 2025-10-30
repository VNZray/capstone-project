const { createPromotionProcedures, dropPromotionProcedures } = require("../procedures/promotionProcedures.js");

exports.up = async function (knex) {
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
    
    table.timestamp("start_date").notNullable().defaultTo(knex.fn.now());
    table.timestamp("end_date").nullable();
    table.boolean("is_active").defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index("business_id", "idx_promotion_business");
    table.index(["start_date", "end_date"], "idx_promotion_dates");
    table.index("is_active", "idx_promotion_active");
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

  // Drop table
  await knex.schema.dropTableIfExists("promotion");
};
