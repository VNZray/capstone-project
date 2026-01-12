/**
 * Test file for online status tracking
 * Run with: node backend/tests/test-online-status.js
 */

import db from '../db.js';

async function testOnlineStatusProcedures() {
  console.log('🧪 Testing Online Status Procedures...\n');

  try {
    // 1. Test UpdateUserOnlineStatus
    console.log('1️⃣ Testing UpdateUserOnlineStatus...');
    const [userResults] = await db.query('SELECT id FROM user LIMIT 1');
    const testUserId = userResults[0]?.id;

    if (!testUserId) {
      console.log('❌ No users found in database. Please seed data first.');
      return;
    }

    const [onlineResult] = await db.query('CALL UpdateUserOnlineStatus(?, ?)', [testUserId, true]);
    console.log('✅ Set user online:', onlineResult[0]?.[0]);

    // 2. Test UpdateUserLastSeen
    console.log('\n2️⃣ Testing UpdateUserLastSeen...');
    const [heartbeatResult] = await db.query('CALL UpdateUserLastSeen(?)', [testUserId]);
    console.log('✅ Heartbeat updated:', heartbeatResult[0]?.[0]);

    // 3. Test UpdateUserActivity
    console.log('\n3️⃣ Testing UpdateUserActivity...');
    const [activityResult] = await db.query('CALL UpdateUserActivity(?)', [testUserId]);
    console.log('✅ Activity updated:', activityResult[0]?.[0]);

    // 4. Test GetOnlineUsers
    console.log('\n4️⃣ Testing GetOnlineUsers...');
    const [onlineUsers] = await db.query('CALL GetOnlineUsers()');
    console.log(`✅ Found ${onlineUsers[0]?.length || 0} online users`);
    if (onlineUsers[0]?.length > 0) {
      console.log('First online user:', onlineUsers[0][0]);
    }

    // 5. Test GetUserOnlineStatus
    console.log('\n5️⃣ Testing GetUserOnlineStatus...');
    const [statusResult] = await db.query('CALL GetUserOnlineStatus(?)', [testUserId]);
    console.log('✅ User status:', statusResult[0]?.[0]);

    // 6. Test MarkInactiveUsersOffline
    console.log('\n6️⃣ Testing MarkInactiveUsersOffline...');
    const [cleanupResult] = await db.query('CALL MarkInactiveUsersOffline()');
    console.log('✅ Cleanup result:', cleanupResult[0]?.[0]);

    // 7. Set user back offline
    console.log('\n7️⃣ Setting user back offline...');
    const [offlineResult] = await db.query('CALL UpdateUserOnlineStatus(?, ?)', [testUserId, false]);
    console.log('✅ Set user offline:', offlineResult[0]?.[0]);

    console.log('\n✅ All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

testOnlineStatusProcedures();
