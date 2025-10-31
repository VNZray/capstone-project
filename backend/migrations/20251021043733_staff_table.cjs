const { createProcedures, dropProcedures } = require("../procedures/auth/staffProcedures.js");

exports.up = async function (knex) {
  await knex.schema.createTable("staff", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.string("first_name").notNullable();
    table.string("middle_name").notNullable();
    table.string("last_name").notNullable();

    table
      .uuid("user_id")
      .nullable()
      .references("id")
      .inTable("user")
      .onDelete("CASCADE");

    table.index(["user_id"], "idx_user_id");
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();

  });

  await createProcedures(knex);
};

exports.down = async function (knex) {
  await dropProcedures(knex);
  await knex.schema.dropTableIfExists("staff");
};
