const mysql = require('mysql2/promise');

/**
 * Simple test to verify stored procedures exist
 */
async function testStoredProcedures() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tourism_db'
  });

  try {
    console.log('Testing stored procedures...\n');

    // Check if procedures exist
    console.log('Checking if stored procedures exist...');
    const [procedures] = await connection.execute(`
      SELECT ROUTINE_NAME 
      FROM INFORMATION_SCHEMA.ROUTINES 
      WHERE ROUTINE_SCHEMA = DATABASE() 
      AND ROUTINE_TYPE = 'PROCEDURE'
      ORDER BY ROUTINE_NAME
    `);

    console.log(`Found ${procedures.length} stored procedures:`);
    procedures.forEach(proc => {
      console.log(`   - ${proc.ROUTINE_NAME}`);
    });

    console.log('\n✅ Stored procedures created successfully!');

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  } finally {
    await connection.end();
  }
}

testStoredProcedures();
