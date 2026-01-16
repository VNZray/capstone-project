const {
  createOwnerProcedures,
  dropOwnerProcedures,
} = require("../procedures/auth/owner.procedures.cjs");

exports.up = async function (knex) {
  await knex.schema.createTable("owner", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.string("first_name", 30).notNullable();
    table.string("middle_name", 20);
    table.string("last_name", 30).notNullable();
    table.integer("age", 2);
    table.date("birthdate");
    table.enu("gender", ["Male", "Female"]);
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("user")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });

  await createOwnerProcedures(knex);

  console.log("Owner tables and procedures created.");
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("owner");
  await dropOwnerProcedures(knex);
};
