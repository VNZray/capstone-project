import knex from "knex";
import dotenv from "dotenv";

dotenv.config();

const db = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

async function clearDatabase() {
  try {
    // Disable foreign key checks temporarily
    await db.raw("SET FOREIGN_KEY_CHECKS = 0");

    // Delete tables in order of dependencies
    await db("tourist").del();
    await db("owner").del();
    await db("business").del();
    await db("barangay").del();
    await db("municipality").del();
    await db("province").del();
    await db("category").del();
    await db("type").del();

    console.log("✅ All tables have been cleared!");

    // Re-enable foreign key checks
    await db.raw("SET FOREIGN_KEY_CHECKS = 1");
  } catch (error) {
    console.error("❌ Error clearing database:", error);
  } finally {
    await db.destroy();
  }
}

clearDatabase();
