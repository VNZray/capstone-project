const { createOrderProcedures, dropOrderProcedures } = require("../procedures/orderProcedures.js");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  console.log("Creating order stored procedures...");
  
  try {
    await createOrderProcedures(knex);
    console.log("✅ Order stored procedures created successfully");
  } catch (error) {
    console.error("❌ Error creating order stored procedures:", error);
    throw error;
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  console.log("Dropping order stored procedures...");
  
  try {
    await dropOrderProcedures(knex);
    console.log("✅ Order stored procedures dropped successfully");
  } catch (error) {
    console.error("❌ Error dropping order stored procedures:", error);
    throw error;
  }
};
