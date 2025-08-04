// db.js
import { createConnection } from 'mysql2';

const db = createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // default XAMPP
  database: 'tourism_db'
});

db.connect((err) => {
  if (err) throw err;
  console.log('✅ Connected to MariaDB');
});

export default db;
