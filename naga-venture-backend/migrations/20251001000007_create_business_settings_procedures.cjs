/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  console.log("Creating business settings stored procedures...");

  try {
    const { createBusinessSettingsProcedures } = await import("../procedures/businessSettingsProcedures.js");
    await createBusinessSettingsProcedures(knex);
    console.log("✅ Business settings stored procedures created successfully");
  } catch (error) {
    console.error("❌ Error creating business settings stored procedures:", error);
    throw error;
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  console.log("Dropping business settings stored procedures...");

  try {
    const { dropBusinessSettingsProcedures } = await import("../procedures/businessSettingsProcedures.js");
    await dropBusinessSettingsProcedures(knex);
    console.log("✅ Business settings stored procedures dropped successfully");
  } catch (error) {
    console.error("❌ Error dropping business settings stored procedures:", error);
    throw error;
  }
};
