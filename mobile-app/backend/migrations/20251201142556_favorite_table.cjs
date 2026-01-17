const { createProcedures, dropProcedures } = require("../procedures/favorite/favorite.procedures.cjs");

exports.up = async function (knex) {
  await knex.schema.createTable("favorite", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("tourist_id").notNullable()
      .references("id").inTable("tourist")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.enum("favorite_type", ["accommodation", "room", "shop", "tourist_spot", "event"]).notNullable();
    table.uuid("my_favorite_id").notNullable();

    // Composite unique constraint: allows multiple users to favorite the same item,
    // but prevents duplicate favorites for the same user
    table.unique(["tourist_id", "favorite_type", "my_favorite_id"], {
      indexName: "favorite_unique_user_item",
    });
  });

  await createProcedures(knex);

  console.log("Favorite table and procedures created.");
};

exports.down = async function (knex) {
  await dropProcedures(knex);
  await knex.schema.dropTableIfExists("favorite");
};
