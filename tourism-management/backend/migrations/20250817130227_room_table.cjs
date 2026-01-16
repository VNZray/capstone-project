const {
  createRoomProcedures,
  dropRoomProcedures,
} = require("../procedures/accommodation/room.procedures.cjs");

exports.up = async function (knex) {
  await knex.schema.createTable("room", function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table
      .uuid("business_id")
      .notNullable()
      .references("id")
      .inTable("business")
      .onDelete("CASCADE");
    table.string("room_number", 20).notNullable();
    table.string("room_type", 20).notNullable();
    table.text("description").nullable();
    table.float("room_price").notNullable();
    table.float("per_hour_rate").notNullable();
    table.integer("room_size").notNullable();
    table.string("room_image", 255).nullable();
    table.integer("floor").notNullable();
    table.integer("capacity").unsigned().notNullable();
  });

  await createRoomProcedures(knex);

  console.log("Room table and procedures created.");
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("room");
  await dropRoomProcedures(knex);
};
