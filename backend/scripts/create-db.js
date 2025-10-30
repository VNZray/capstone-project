// scripts/create-db.js
import knex from "knex";
import dotenv from "dotenv";

dotenv.config();

const dbName = process.env.DB_NAME; // change to your db name

// Temporary connection without database selected
const connection = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
});

async function createDatabase() {
  try {
    await connection.raw(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`✅ Database "${dbName}" created or already exists.`);
  } catch (err) {
    console.error("❌ Error creating database:", err.message);
  } finally {
    await connection.destroy();
  }
}

createDatabase();
