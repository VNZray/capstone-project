exports.up = function (knex) {
  return knex.schema.alterTable("event", (table) => {
    // Add category_id referencing the existing `category` table (20250817125523_category_table.cjs)
    table
      .integer("category_id")
      .unsigned()
      .references("id")
      .inTable("category")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    // Add event_photos as JSON where supported, fallback to TEXT for MySQL
    if (knex.client && (knex.client.config.client === "mysql" || knex.client.config.client === "mysql2")) {
      table.text("event_photos");
    } else {
      table.json("event_photos");
    }
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("event", (table) => {
    // Drop foreign key then the column
    try {
      table.dropForeign("category_id");
    } catch (e) {
      // ignore if constraint does not exist
    }
    table.dropColumn("category_id");
    table.dropColumn("event_photos");
  });
};
