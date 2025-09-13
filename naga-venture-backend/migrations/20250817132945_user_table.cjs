const {
  createUserProcedures,
  dropUserProcedures,
} = require("../procedures/userProcedures");

exports.up = async function (knex) {
  await knex.schema.createTable("user", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())")); // default UUID
    table
      .enu("role", ["Tourist", "Owner", "Tourism", " Event Manager"], {
        useNative: true,
        enumName: "user_role",
      })
      .notNullable();

    table.string("email", 40).notNullable().unique();
    table.string("phone_number", 13).notNullable().unique();
    table.text("password").notNullable();
    table.text("user_profile").nullable();
    table
      .uuid("tourist_id")
      .nullable()
      .references("id")
      .inTable("tourist")
      .onDelete("CASCADE");
    table
      .uuid("owner_id")
      .nullable()
      .references("id")
      .inTable("owner")
      .onDelete("CASCADE");

    table
      .uuid("tourism_id")
      .nullable()
      .references("id")
      .inTable("tourism")
      .onDelete("CASCADE");
  });
  await createUserProcedures(knex);
};

exports.down = async function (knex) {
  await knex.schema.dropTable("user");
  await dropUserProcedures(knex);
};
