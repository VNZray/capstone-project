exports.up = async function (knex) {
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
        .inTable("service_category")
        .onDelete("CASCADE");
      table.boolean("is_primary").defaultTo(false);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());

      table.unique(["service_id", "category_id"], "uq_service_category_map_pair");
      table.index("category_id", "idx_service_category_map_category");
      table.index("service_id", "idx_service_category_map_service");
    });
  }

  // Backfill existing service-category relationships
  await knex.raw(`
    INSERT INTO service_category_map (id, service_id, category_id, is_primary)
    SELECT UUID(), id, service_category_id, 1
    FROM service
    WHERE service_category_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM service_category_map scm
        WHERE scm.service_id = service.id AND scm.category_id = service.service_category_id
      );
  `);
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("service_category_map");
};
