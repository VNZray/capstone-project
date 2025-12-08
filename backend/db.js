// db.js
import mysql from "mysql2/promise";

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const db = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  timezone: "+00:00", // Use UTC timezone for consistent datetime handling
  dateStrings: false, // Parse date strings to Date objects
});

console.log("✅ Connected to MariaDB (Promise Pool)");

export default db;
