// db.js
/**
 * Database Connection Pool Configuration
 * 
 * TIMEZONE STRATEGY:
 * - MariaDB server uses PHT (Asia/Manila, UTC+08:00)
 * - Node.js driver configured to match: timezone: "+08:00"
 * - All timestamps stored in DB are in PHT
 * - When sending to frontend, convert to ISO string (JS Date handles UTC conversion)
 * 
 * For new explicit UTC timestamps in code, use:
 *   - SQL: UTC_TIMESTAMP() instead of NOW() or CURRENT_TIMESTAMP
 *   - JS: new Date().toISOString() for UTC strings
 * 
 * For displaying to users in PHT:
 *   - Use date-fns-tz or dayjs with 'Asia/Manila' timezone
 */
import mysql from "mysql2/promise";

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const db = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  timezone: "+08:00", // Match MariaDB server timezone (PHT/Asia/Manila)
  dateStrings: false, // Parse date strings to Date objects
});

console.log("✅ Connected to MariaDB (Promise Pool)");

export default db;
