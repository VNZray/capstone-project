const { createDiscountProcedures, dropDiscountProcedures } = require("../procedures/discountProcedures.js");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  console.log("Creating discount stored procedures...");
  
  try {
    await createDiscountProcedures(knex);
    console.log("✅ Discount stored procedures created successfully");
  } catch (error) {
    console.error("❌ Error creating discount stored procedures:", error);
    throw error;
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  console.log("Dropping discount stored procedures...");
  
  try {
    await dropDiscountProcedures(knex);
    console.log("✅ Discount stored procedures dropped successfully");
  } catch (error) {
    console.error("❌ Error dropping discount stored procedures:", error);
    throw error;
  }
};
