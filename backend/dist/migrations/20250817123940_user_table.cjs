const {
  createUserProcedures,
  dropUserProcedures,
} = require("../procedures/auth/userProcedures");

exports.up = async function (knex) {
  await knex.schema.createTable("user_role", (table) => {
    table.increments("id").primary();
    table.string("role_name", 20).notNullable();
    table.text("description").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("user", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())")); // default UUID
    table.string("email", 40).notNullable().unique();
    table.string("phone_number", 13).notNullable().unique();
    table.text("password").notNullable();
    table.text("user_profile").nullable();
    table.string("otp", 6).nullable();
    table.boolean("is_verified").defaultTo(false);
    table.boolean("is_active").defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("last_login").nullable();
    
    table
      .integer("user_role_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("user_role")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

      table
        .integer("barangay_id")
        .unsigned()
        .nullable()
        .references("id")
        .inTable("barangay")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
  });
  await createUserProcedures(knex);
};

exports.down = async function (knex) {
  await knex.schema.dropTable("user");
  await dropUserProcedures(knex);
};
