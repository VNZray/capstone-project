import db from '../../db.js';

/**
 * Update user's online status
 * @route PUT /api/auth/status/online
 */
export async function updateOnlineStatus(req, res) {
  try {
    const { user_id, is_online } = req.body;

    if (!user_id || is_online === undefined) {
      return res.status(400).json({
        message: 'user_id and is_online are required'
      });
    }

    const [results] = await db.query('CALL UpdateUserOnlineStatus(?, ?)', [
      user_id,
      is_online
    ]);

    const user = results[0]?.[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      message: `User status updated to ${is_online ? 'online' : 'offline'}`,
      user
    });
  } catch (error) {
    console.error('Error updating online status:', error);
    return res.status(500).json({
      message: 'Failed to update online status',
      error: error.message
    });
  }
}

/**
 * Send heartbeat to update last_seen timestamp
 * @route POST /api/auth/status/heartbeat
 */
export async function heartbeat(req, res) {
  try {
    const user_id = req.user?.id; // From authenticate middleware

    if (!user_id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const [results] = await db.query('CALL UpdateUserLastSeen(?)', [user_id]);
    const user = results[0]?.[0];

    return res.json({
      message: 'Heartbeat received',
      user
    });
  } catch (error) {
    console.error('Error updating heartbeat:', error);
    return res.status(500).json({
      message: 'Failed to update heartbeat',
      error: error.message
    });
  }
}

/**
 * Update user activity timestamp
 * @route POST /api/auth/status/activity
 */
export async function updateActivity(req, res) {
  try {
    const user_id = req.user?.id; // From authenticate middleware

    if (!user_id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const [results] = await db.query('CALL UpdateUserActivity(?)', [user_id]);
    const user = results[0]?.[0];

    return res.json({
      message: 'Activity updated',
      user
    });
  } catch (error) {
    console.error('Error updating activity:', error);
    return res.status(500).json({
      message: 'Failed to update activity',
      error: error.message
    });
  }
}

/**
 * Get all online users
 * @route GET /api/auth/status/online-users
 */
export async function getOnlineUsers(req, res) {
  try {
    const [results] = await db.query('CALL GetOnlineUsers()');
    const users = results[0] || [];

    return res.json({
      message: 'Online users retrieved',
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error getting online users:', error);
    return res.status(500).json({
      message: 'Failed to get online users',
      error: error.message
    });
  }
}

/**
 * Get specific user's online status
 * @route GET /api/auth/status/:userId
 */
export async function getUserStatus(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const [results] = await db.query('CALL GetUserOnlineStatus(?)', [userId]);
    const user = results[0]?.[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      message: 'User status retrieved',
      user
    });
  } catch (error) {
    console.error('Error getting user status:', error);
    return res.status(500).json({
      message: 'Failed to get user status',
      error: error.message
    });
  }
}

/**
 * Mark inactive users as offline (admin/cron job)
 * @route POST /api/auth/status/cleanup
 */
export async function cleanupInactiveUsers(req, res) {
  try {
    const [results] = await db.query('CALL MarkInactiveUsersOffline()');
    const result = results[0]?.[0];

    return res.json({
      message: 'Inactive users marked offline',
      users_marked_offline: result?.users_marked_offline || 0
    });
  } catch (error) {
    console.error('Error cleaning up inactive users:', error);
    return res.status(500).json({
      message: 'Failed to cleanup inactive users',
      error: error.message
    });
  }
}
