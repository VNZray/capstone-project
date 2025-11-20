const {
  createAddressProcedures,
  dropAddressProcedures,
} = require("../procedures/addressProcedures");

exports.up = async function (knex) {
  // Province
  await knex.schema.createTable("province", function (table) {
    table.increments("id").primary();
    table.string("province", 100).notNullable();
  });

  // Municipality
  await knex.schema.createTable("municipality", function (table) {
    table.increments("id").primary();
    table.string("municipality", 100).notNullable();
    table
      .integer("province_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("province")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });

  // Barangay
  await knex.schema.createTable("barangay", function (table) {
    table.increments("id").primary();
    table.string("barangay", 100).notNullable();
    table
      .integer("municipality_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("municipality")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });

  // Address
  await knex.schema.createTable("address", function (table) {
    table.increments("id").primary();

    table
      .integer("province_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("province")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .integer("municipality_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("municipality")
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

  await createAddressProcedures(knex);

  console.log("Address tables and procedures created.");
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("address");
  await knex.schema.dropTableIfExists("barangay");
  await knex.schema.dropTableIfExists("municipality");
  await knex.schema.dropTableIfExists("province");
  await dropAddressProcedures(knex);
};
