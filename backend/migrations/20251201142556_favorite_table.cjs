const { createProcedures, dropProcedures } = require("../procedures/favoriteProcedure.js");

exports.up = async function (knex) {
  await knex.schema.createTable("favorite", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("tourist_id").notNullable()
      .references("id").inTable("tourist")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.enum("favorite_type", ["accommodation", "room", "shop", "tourist_spot", "event"]).notNullable();
    table.uuid("my_favorite_id").notNullable().unique();
  });

  await createProcedures(knex);

  console.log("Favorite table and procedures created.");
};

exports.down = async function (knex) {
  await dropProcedures(knex);
  await knex.schema.dropTableIfExists("favorite");
};
