const { createProductProcedures, dropProductProcedures } = require("../procedures/productProcedures.js");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  console.log("Creating product stored procedures...");
  
  try {
    await createProductProcedures(knex);
    console.log("✅ Product stored procedures created successfully");
  } catch (error) {
    console.error("❌ Error creating product stored procedures:", error);
    throw error;
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  console.log("Dropping product stored procedures...");
  
  try {
    await dropProductProcedures(knex);
    console.log("✅ Product stored procedures dropped successfully");
  } catch (error) {
    console.error("❌ Error dropping product stored procedures:", error);
    throw error;
  }
};
