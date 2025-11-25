exports.up = async function (knex) {
  await knex.schema.createTable("business_hours", function (table) {
    table.increments("id").primary();
    table
      .uuid("business_id")
      .notNullable()
      .references("id")
      .inTable("business")
      .onDelete("CASCADE");
    table
      .enu("day_of_week", [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ])
      .notNullable();
    table.time("open_time").nullable();
    table.time("close_time").nullable();
    table.boolean("is_open").defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .timestamp("updated_at")
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));

    // indexes
    table.index("business_id", "idx_business");
  });

  console.log("Business hours table created.");
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("business_hours");
};
