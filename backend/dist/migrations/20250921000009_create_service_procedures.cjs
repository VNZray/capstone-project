const { createServiceProcedures, dropServiceProcedures } = require("../procedures/serviceProcedures.js");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  console.log("Creating service stored procedures...");
  
  try {
    await createServiceProcedures(knex);
    console.log("✅ Service stored procedures created successfully");
  } catch (error) {
    console.error("❌ Error creating service stored procedures:", error);
    throw error;
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  console.log("Dropping service stored procedures...");
  
  try {
    await dropServiceProcedures(knex);
    console.log("✅ Service stored procedures dropped successfully");
  } catch (error) {
    console.error("❌ Error dropping service stored procedures:", error);
    throw error;
  }
};
