import knex from "knex";
import dotenv from "dotenv";

dotenv.config();

const db = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  },
});

async function clearDatabase() {
  try {
    // Get all table names
    const tables = await db.raw("SHOW TABLES");
    const tableKey = Object.keys(tables[0][0])[0];

    for (let row of tables[0]) {
      const tableName = row[tableKey];
      await db.raw(`TRUNCATE TABLE \`${tableName}\``);
      console.log(`Cleared: ${tableName}`);
    }

    console.log("✅ All tables have been cleared!");
  } catch (error) {
    console.error("❌ Error clearing database:", error);
  } finally {
    await db.destroy();
  }
}

clearDatabase();


