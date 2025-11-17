const {
  createRoomPhotosProcedures,
  dropRoomPhotosProcedures,
} = require("../procedures/accommodation/roomPhotosProcedures").default;

exports.up = async function (knex) {
  await knex.schema.createTable("room_photos", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table
      .uuid("room_id")
      .notNullable()
      .references("id")
      .inTable("room")
      .onDelete("CASCADE");
    table.text("file_url").notNullable(); // Supabase/Cloud storage file path
    table.string("file_format", 10).notNullable(); // e.g. pdf, jpg, png
    table.bigInteger("file_size"); // in bytes
    table.timestamp("uploaded_at").defaultTo(knex.fn.now());
  });

  await createRoomPhotosProcedures(knex);

  console.log("Room photos table and procedures created.");
};

exports.down = async function (knex) {
  await dropRoomPhotosProcedures(knex);
  await knex.schema.dropTableIfExists("room_photos");
};
