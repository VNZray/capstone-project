exports.up = function (knex) {
  return knex.schema.createTable("promotion", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));

    table
      .uuid("business_id")
      .references("id")
      .inTable("business")
      .onDelete("CASCADE")
      .nullable();

    table
      .uuid("room_id")
      .references("id")
      .inTable("room")
      .onDelete("CASCADE")
      .nullable();

    table.string("title", 100).notNullable();
    table.text("description");

    table
      .enu("discount_type", ["PERCENTAGE", "FIXED"], {
        useNative: true,
        enumName: "promotion_discount_type",
      })
      .notNullable();

  table.decimal("discount_value", 10, 2).notNullable();
  // Start date defaults to now; end date is provided by app and allowed to be NULL until set
  table.timestamp("start_date").notNullable().defaultTo(knex.fn.now());
  table.timestamp("end_date").nullable().defaultTo(null);
    table.boolean("is_active").defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    // Ensure at least one target is set (business OR room)
    table.check(
      "(business_id IS NOT NULL OR room_id IS NOT NULL)",
      [],
      "promotion_target_check"
    );
  });
};

exports.down = function (knex) {
  // On MySQL/MariaDB, ENUM is per-column; there is no named TYPE to drop
  return knex.schema.dropTableIfExists("promotion");
};
