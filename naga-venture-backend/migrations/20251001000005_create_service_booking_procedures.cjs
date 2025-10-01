/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  console.log("Creating service booking stored procedures...");

  try {
    const { createServiceBookingProcedures } = await import("../procedures/serviceBookingProcedures.js");
    await createServiceBookingProcedures(knex);
    console.log("✅ Service booking stored procedures created successfully");
  } catch (error) {
    console.error("❌ Error creating service booking stored procedures:", error);
    throw error;
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  console.log("Dropping service booking stored procedures...");

  try {
    const { dropServiceBookingProcedures } = await import("../procedures/serviceBookingProcedures.js");
    await dropServiceBookingProcedures(knex);
    console.log("✅ Service booking stored procedures dropped successfully");
  } catch (error) {
    console.error("❌ Error dropping service booking stored procedures:", error);
    throw error;
  }
};
