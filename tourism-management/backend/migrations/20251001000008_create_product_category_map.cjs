exports.up = async function (knex) {
  const tableExists = await knex.schema.hasTable("product_category_map");
  if (!tableExists) {
    await knex.schema.createTable("product_category_map", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
      table.uuid("product_id").notNullable()
        .references("id")
        .inTable("product")
        .onDelete("CASCADE");
      table.uuid("category_id").notNullable()
        .references("id")
        .inTable("shop_category")  // Reference unified shop_category table
        .onDelete("CASCADE");
      table.boolean("is_primary").defaultTo(false);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());

      table.unique(["product_id", "category_id"], "uq_product_category_map_pair");
      table.index("category_id", "idx_product_category_map_category");
      table.index("product_id", "idx_product_category_map_product");
    });
  }

  // Backfill existing product-category relationships
  await knex.raw(`
    INSERT INTO product_category_map (id, product_id, category_id, is_primary)
    SELECT UUID(), id, shop_category_id, 1
    FROM product
    WHERE shop_category_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM product_category_map pcm
        WHERE pcm.product_id = product.id AND pcm.category_id = product.shop_category_id
      );
  `);
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("product_category_map");
};
