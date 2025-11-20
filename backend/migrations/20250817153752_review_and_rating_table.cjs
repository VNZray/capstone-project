// migrations/20250817124500_create_review_and_reply.js

const {
  createReviewAndRatingTable,
  dropReviewAndRatingTable,
} = require("../procedures/feedback/reviewAndRatingsProcedures");

const {
  createReplyProcedures,
  dropReplyProcedures,
} = require("../procedures/feedback/replyProcedures"); 

exports.up = async function (knex) {
  await knex.schema
    .createTable("review_and_rating", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
      table
        .enu("review_type", [
          "Accommodation",
          "Room",
          "Shop",
          "Event",
          "Tourist Spot",
          "Product",
          "Service",
        ])
        .notNullable();
      table.uuid("review_type_id").notNullable();
      table.integer("rating", 1).notNullable(); // tinyint(1)
      table.text("message").notNullable();
      table.uuid("tourist_id").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    })
    
    .createTable("reply", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
      table
        .uuid("review_and_rating_id")
        .notNullable()
        .references("id")
        .inTable("review_and_rating")
        .onDelete("CASCADE");
      table.text("message").notNullable();
      table.uuid("responder_id").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    });

      await createReviewAndRatingTable(knex);
      await createReplyProcedures(knex);

      console.log("Review and Rating table and Reply procedures created.");

};

exports.down = async function (knex) {
  await knex.schema
    .dropTableIfExists("reply")
    .dropTableIfExists("review_and_rating");
  await dropReviewAndRatingTable(knex);
  await dropReplyProcedures(knex);
};
