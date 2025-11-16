const { createProcedures, dropProcedures } = require("../procedures/auth/staffProcedures.js");

exports.up = async function (knex) {
  await knex.schema.createTable("staff", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.string("first_name").notNullable();
    table.string("middle_name").nullable();
    table.string("last_name").notNullable();

    table.string("business_id")
      .notNullable()
      .references("id")
      .inTable("business")
      .onDelete("CASCADE");
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("user")
      .onDelete("CASCADE");

    table.index(["user_id"], "idx_user_id");
    table.index(["business_id"], "idx_business_id");
  });

  await createProcedures(knex);
};

exports.down = async function (knex) {
  await dropProcedures(knex);
  await knex.schema.dropTableIfExists("staff");
};
