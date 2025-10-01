/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  console.log("Creating notification stored procedures...");

  try {
    const { createNotificationProcedures } = await import("../procedures/notificationProcedures.js");
    await createNotificationProcedures(knex);
    console.log("✅ Notification stored procedures created successfully");
  } catch (error) {
    console.error("❌ Error creating notification stored procedures:", error);
    throw error;
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  console.log("Dropping notification stored procedures...");

  try {
    const { dropNotificationProcedures } = await import("../procedures/notificationProcedures.js");
    await dropNotificationProcedures(knex);
    console.log("✅ Notification stored procedures dropped successfully");
  } catch (error) {
    console.error("❌ Error dropping notification stored procedures:", error);
    throw error;
  }
};
