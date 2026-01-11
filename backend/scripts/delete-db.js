// scripts/delete-db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

async function deleteDB() {
  try {
    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      port: DB_PORT || 3306,
      connectTimeout: 60000, // 60 seconds
    });

    await connection.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);
    console.log(`Database ${DB_NAME} deleted successfully`);

    await connection.end();
  } catch (error) {
    console.error("Error deleting database:", error.message);
  }
}

deleteDB();
