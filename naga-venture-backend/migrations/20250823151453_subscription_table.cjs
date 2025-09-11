exports.up = function(knex) {
  return knex.schema.createTable("subscription", function(table) {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("business_id").notNullable()
      .references("id").inTable("business").onDelete("CASCADE");

    table.string("plan_name", 50).notNullable();

    table.boolean("booking_system").notNullable().defaultTo(false);
    table.boolean("promotion_tools").notNullable().defaultTo(false);
    table.boolean("visibility_boost").notNullable().defaultTo(false);
    table.boolean("publication").notNullable().defaultTo(false);

    table.decimal("price", 10, 2).notNullable().defaultTo(0.00);
    table.timestamp("start_date").notNullable().defaultTo(knex.fn.now());
    table.timestamp("end_date").nullable();
    table.string("status", 20).notNullable().defaultTo("active");

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("subscription");
};
