// migrations/20250817124500_create_review_and_reply.js
exports.up = function (knex) {
  return knex.schema
    .createTable("review_and_rating", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
      table
        .enu("reviewable_type", [
          "Accommodation",
          "Room",
          "Shop",
          "Event",
          "Tourist Spot",
        ])
        .notNullable();
      table.uuid("reviewable_id").notNullable();
      table.integer("rating", 1).notNullable(); // tinyint(1)
      table.text("comment").notNullable();
      table.uuid("touriat_id").notNullable();
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
      table.text("reply").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("reply")
    .dropTableIfExists("review_and_rating");
};
