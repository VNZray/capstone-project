exports.up = function (knex) {
  return knex.schema
    .createTable("event", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("UUID()")); // event_id
      table.string("event_name", 150).notNullable();
      table.text("description");
      table.dateTime("event_start_date").notNullable();
      table.dateTime("event_end_date").notNullable();
      table.string("address", 255);
      table.decimal("longitude", 10, 7); // e.g. 123.4567890
      table.decimal("latitude", 10, 7);  // e.g. 13.1234567

      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })

    .createTable("event_photos", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("UUID()"));
      table
        .uuid("event_id")
        .notNullable()
        .references("id")
        .inTable("event")
        .onDelete("CASCADE"); // delete photos when event is deleted
      table.text("photo_url").notNullable(); // Supabase/Cloud storage path
      table.string("file_format", 10); // jpg, png, etc.
      table.bigInteger("file_size"); // in bytes (optional)

      table.timestamp("created_at").defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("event_photos")
    .dropTableIfExists("event");
};
