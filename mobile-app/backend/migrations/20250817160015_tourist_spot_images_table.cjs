// migrations/20250829160000_tourist_spot_images_table.cjs
exports.up = async function (knex) {
  await knex.schema.createTable("tourist_spot_images", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table
      .uuid("tourist_spot_id")
      .notNullable()
      .references("id")
      .inTable("tourist_spots")
      .onDelete("CASCADE");
    table.text("file_url").notNullable(); // Supabase/Cloud storage file path
    table.string("file_format", 10).notNullable(); // e.g. jpg, png, webp
    table.bigInteger("file_size"); // in bytes
    table.boolean("is_primary").defaultTo(false); // mark primary/featured image
    table.string("alt_text", 255).nullable(); // for accessibility
    table.timestamp("uploaded_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
    
    // Indexes
    table.index("tourist_spot_id", "idx_tourist_spot_images_spot_id");
    table.index("is_primary", "idx_tourist_spot_images_primary");
  });

  console.log("Tourist spot images table created.");
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("tourist_spot_images");
};
