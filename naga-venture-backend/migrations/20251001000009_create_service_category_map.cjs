exports.up = async function (knex) {
  // Service-to-Category mapping table
  // Allows a single service to be associated with multiple categories
  // For display-only services: services show under their primary category (shop_category_id)
  // but can be filtered/searched across multiple categories via this table
  const tableExists = await knex.schema.hasTable("service_category_map");
  if (!tableExists) {
    await knex.schema.createTable("service_category_map", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
      table.uuid("service_id").notNullable()
        .references("id")
        .inTable("service")
        .onDelete("CASCADE");
      table.uuid("category_id").notNullable()
        .references("id")
        .inTable("shop_category")  // Reference unified shop_category table
        .onDelete("CASCADE");
      table.boolean("is_primary").defaultTo(false); // true for the main category (same as shop_category_id)
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());

      // Prevent duplicate category associations
      table.unique(["service_id", "category_id"], "uq_service_category_map_pair");
      table.index("category_id", "idx_service_category_map_category");
      table.index("service_id", "idx_service_category_map_service");
    });
  }

  // Backfill existing service-category relationships
  // Ensures all services have at least their primary category mapped
  await knex.raw(`
    INSERT INTO service_category_map (id, service_id, category_id, is_primary)
    SELECT UUID(), id, shop_category_id, 1
    FROM service
    WHERE shop_category_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM service_category_map scm
        WHERE scm.service_id = service.id AND scm.category_id = service.shop_category_id
      );
  `);
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("service_category_map");
};
