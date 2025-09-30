exports.up = async function (knex) {
  await knex.schema.createTable("amenity", function (table) {
    table.increments("id").primary(); // int(11) AUTO_INCREMENT PRIMARY KEY
    table.string("name", 100).notNullable();
    // Add slug, icon, and active flag to support frontend mapping
    table.string("slug", 100).unique().nullable();
    table.string("icon", 60).nullable();
    table.boolean("is_active").notNullable().defaultTo(true);
  });

  await knex.schema.createTable("business_amenities", function (table) {
    table.increments("id").primary(); // int(11) AUTO_INCREMENT PRIMARY KEY
    table
      .uuid("business_id")
      .notNullable()
      .references("id")
      .inTable("business")
      .onDelete("CASCADE");
    table
      .integer("amenity_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("amenity")
      .onDelete("CASCADE");
  });

  await knex.schema.createTable("room_amenities", function (table) {
    table.increments("id").primary(); // int(11) AUTO_INCREMENT PRIMARY KEY
    table
      .uuid("room_id")
      .notNullable()
      .references("id")
      .inTable("room")
      .onDelete("CASCADE");
    table
      .integer("amenity_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("amenity")
      .onDelete("CASCADE");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("business_amenities");
  await knex.schema.dropTableIfExists("amenity");
  await knex.schema.dropTableIfExists("room_amenities");
};
