import mysql from 'mysql2/promise';

async function addMissingColumns() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cityventures_db'
  });

  try {
    // Check if columns exist and add if they don't
    const columns = [
      { name: 'otp_expires_at', type: 'DATETIME DEFAULT NULL' },
      { name: 'password_changed_at', type: 'DATETIME DEFAULT NULL' },
      { name: 'failed_login_attempts', type: 'INT DEFAULT 0' },
      { name: 'locked_until', type: 'DATETIME DEFAULT NULL' },
      { name: 'updated_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
    ];

    for (const col of columns) {
      const [rows] = await connection.query(`SHOW COLUMNS FROM user LIKE '${col.name}'`);
      if (rows.length === 0) {
        await connection.query(`ALTER TABLE user ADD COLUMN ${col.name} ${col.type}`);
        console.log(`✅ Added column: ${col.name}`);
      } else {
        console.log(`⏭️ Column exists: ${col.name}`);
      }
    }
    console.log('\n🎉 Done adding missing columns!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await connection.end();
  }
}

addMissingColumns();
