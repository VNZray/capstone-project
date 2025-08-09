// db.js
import mysql from 'mysql2/promise';

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // default XAMPP password
  database: 'tourism_db'
});

console.log('✅ Connected to MariaDB (Promise Pool)');

export default db;
