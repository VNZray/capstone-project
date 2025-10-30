const { createProductReviewProcedures, dropProductReviewProcedures } = require("../procedures/productReviewProcedures.js");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  console.log("Creating product review stored procedures...");
  
  try {
    await createProductReviewProcedures(knex);
    console.log("✅ Product review stored procedures created successfully");
  } catch (error) {
    console.error("❌ Error creating product review stored procedures:", error);
    throw error;
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  console.log("Dropping product review stored procedures...");
  
  try {
    await dropProductReviewProcedures(knex);
    console.log("✅ Product review stored procedures dropped successfully");
  } catch (error) {
    console.error("❌ Error dropping product review stored procedures:", error);
    throw error;
  }
};
