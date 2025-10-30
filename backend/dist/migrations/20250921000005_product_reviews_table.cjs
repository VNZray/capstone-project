exports.up = async function (knex) {
  // Create product_review table (separate from existing review_and_rating table)
  // This provides more specific product review functionality alongside the existing polymorphic review system
  await knex.schema.createTable("product_review", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("product_id").notNullable()
      .references("id")
      .inTable("product")
      .onDelete("CASCADE");
    table.uuid("user_id").notNullable()
      .references("id")
      .inTable("user")  // Reference existing 'user' table
      .onDelete("CASCADE");
    table.uuid("order_id").nullable()  // reference to order (optional)
      .references("id")
      .inTable("order")
      .onDelete("SET NULL");
    table.tinyint("rating").notNullable(); // rating between 1 and 5
    table.string("review_title", 255).nullable();
    table.text("review_text").nullable();
    table.boolean("is_verified_purchase").defaultTo(false);
    table.enu("status", ["active", "hidden", "flagged"]).defaultTo("active");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    
    // Add check constraint for rating (MySQL/MariaDB syntax)
    table.check("rating >= 1 AND rating <= 5", [], "product_review_rating_check");
    
    table.index("product_id", "idx_product_review_product");
    table.index("user_id", "idx_product_review_user");
    table.index("rating", "idx_product_review_rating");
    table.index("status", "idx_product_review_status");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("product_review");
};
