import db from "../db.js";

/**
 * Test script to verify all stored procedures are created and working
 */
async function testStoredProcedures() {
  console.log('Testing stored procedures...\n');

  try {
    // Test 1: Check if procedures exist
    console.log('1. Checking if stored procedures exist...');
    const [procedures] = await db.execute(`
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
    console.log('');

    // Test 2: Test basic tourist spot procedures
    console.log('2. Testing tourist spot procedures...');
    
    try {
      const [spots] = await db.execute('CALL GetAllTouristSpots()');
      console.log(`   ✓ GetAllTouristSpots() - returned ${spots.length} spots`);
    } catch (error) {
      console.log(`   ✗ GetAllTouristSpots() - Error: ${error.message}`);
    }

    // Test 3: Test validation procedures
    console.log('3. Testing validation procedures...');
    
    try {
      await db.execute('CALL ValidateLocationIds(1, 1, 1, 1, @type_valid, @province_valid, @municipality_valid, @barangay_valid)');
      const [validation] = await db.execute('SELECT @type_valid as type_valid, @province_valid as province_valid, @municipality_valid as municipality_valid, @barangay_valid as barangay_valid');
      console.log(`   ✓ ValidateLocationIds() - validation results:`, validation[0]);
    } catch (error) {
      console.log(`   ✗ ValidateLocationIds() - Error: ${error.message}`);
    }

    // Test 4: Test approval procedures
    console.log('4. Testing approval procedures...');
    
    try {
      const [pending] = await db.execute('CALL GetPendingTouristSpots()');
      console.log(`   ✓ GetPendingTouristSpots() - returned ${pending.length} pending spots`);
    } catch (error) {
      console.log(`   ✗ GetPendingTouristSpots() - Error: ${error.message}`);
    }

    try {
      const [editRequests] = await db.execute('CALL GetPendingEditRequests()');
      console.log(`   ✓ GetPendingEditRequests() - returned ${editRequests.length} pending edit requests`);
    } catch (error) {
      console.log(`   ✗ GetPendingEditRequests() - Error: ${error.message}`);
    }

    // Test 5: Test report procedures
    console.log('5. Testing report procedures...');
    
    try {
      const [reports] = await db.execute('CALL GetAllReports()');
      console.log(`   ✓ GetAllReports() - returned ${reports.length} reports`);
    } catch (error) {
      console.log(`   ✗ GetAllReports() - Error: ${error.message}`);
    }

    console.log('\n✅ Stored procedure testing completed!');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    // Close database connection
    await db.end();
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testStoredProcedures();
}

export { testStoredProcedures };
