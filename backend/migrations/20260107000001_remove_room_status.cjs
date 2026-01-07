const {
  createRoomProcedures,
  dropRoomProcedures,
} = require("../procedures/accommodation/roomProcedures");

exports.up = async function (knex) {
  // Drop existing procedures that reference status
  await dropRoomProcedures(knex);

  // Remove status column from room table
  await knex.schema.table("room", function (table) {
    table.dropColumn("status");
  });

  // Recreate procedures without status field
  await createRoomProcedures(knex);

  console.log("Room status column removed and procedures updated.");
};

exports.down = async function (knex) {
  // Drop procedures
  await dropRoomProcedures(knex);

  // Add status column back
  await knex.schema.table("room", function (table) {
    table
      .enum("status", ["Available", "Occupied", "Maintenance", "Reserved"])
      .notNullable()
      .defaultTo("Available");
  });

  // Recreate procedures with status field
  await createRoomProcedures(knex);

  console.log("Room status column restored.");
};
