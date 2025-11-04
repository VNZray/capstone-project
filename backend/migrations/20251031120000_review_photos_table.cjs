// migrations/20251031120000_review_photos_table.cjs
// Adds a table to store photo URLs attached to reviews
const {
  createProcedures,
  dropProcedures,
} = require("../procedures/feedback/reviewPhotoProcedures.js");

exports.up = async function (knex) {
  await knex.schema.createTable("review_photo", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table
      .uuid("review_and_rating_id")
      .notNullable()
      .references("id")
      .inTable("review_and_rating")
      .onDelete("CASCADE");
    table.text("photo_url").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
  });

    await createProcedures(knex);

};

exports.down = async function (knex) {
  await dropProcedures(knex);
  await knex.schema.dropTableIfExists("review_photo");
};
