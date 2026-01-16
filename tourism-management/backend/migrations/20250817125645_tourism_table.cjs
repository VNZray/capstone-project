const {
  createTourismProcedures,
  dropTourismProcedures,
} = require("../procedures/auth/tourism.procedures.cjs");

exports.up = async function (knex) {
  await knex.schema.createTable("tourism", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.string("first_name", 30).notNullable();
    table.string("middle_name", 20).nullable();
    table.string("last_name", 30).notNullable();
    table.string("position", 20).nullable();
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("user")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });
  await createTourismProcedures(knex);
  console.log("Tourism tables and procedures created.");
};

exports.down = async function (knex) {
  await knex.schema.dropTable("tourism");
  await dropTourismProcedures(knex);
};