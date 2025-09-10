import db from '../db.js';

async function testLogApprovalRecord() {
  try {
    console.log('--- Approval records BEFORE insert ---');
    const [beforeRows] = await db.query('SELECT * FROM approval_records ORDER BY decided_at DESC');
    if (beforeRows.length === 0) {
      console.log('No approval records found.');
    } else {
      beforeRows.forEach((row, i) => console.log(`[${i}]`, row));
    }

    const params = [
      'new', // approval_type
      'tourist_spot', // entity_type
      '00000000-0000-0000-0000-000000000001', // entity_id (dummy)
      'approved', // decision
      null, // decided_by
      'Test log from script' // remarks
    ];
    console.log('\nCalling LogApprovalRecord with params:', params);
    const result = await db.query('CALL LogApprovalRecord(?,?,?,?,?,?)', params);
    console.log('CALL result:', result);

    const [afterRows] = await db.query('SELECT * FROM approval_records ORDER BY decided_at DESC');
    console.log('\n--- Approval records AFTER insert ---');
    if (afterRows.length === 0) {
      console.log('No approval records found.');
    } else {
      afterRows.forEach((row, i) => console.log(`[${i}]`, row));
    }
  } catch (err) {
    console.error('Error testing LogApprovalRecord:', err);
  } finally {
    await db.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testLogApprovalRecord();
}
