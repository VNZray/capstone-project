import apiClient from './api/apiClient';

export interface UserStatus {
  id: string;
  email: string;
  is_online: boolean;
  is_active: boolean;
  last_seen: string | null;
  last_login: string | null;
  last_activity: string | null;
  status?: 'online' | 'away' | 'idle' | 'offline';
}

export interface OnlineUser extends UserStatus {
  phone_number: string;
  user_profile: string | null;
  role_name: string;
}

/**
 * Update user's online status
 */
export const updateOnlineStatus = async (
  userId: string,
  isOnline: boolean
): Promise<UserStatus> => {
  const { data } = await apiClient.put('/auth/status/online', {
    user_id: userId,
    is_online: isOnline,
  });
  return data.user;
};

/**
 * Send heartbeat to update last_seen timestamp
 * Call this periodically (e.g., every 2-3 minutes) when app is in foreground
 */
export const sendHeartbeat = async (): Promise<UserStatus> => {
  const { data } = await apiClient.post('/auth/status/heartbeat');
  return data.user;
};

/**
 * Update user activity timestamp
 * Call this when user performs meaningful actions
 */
export const updateActivity = async (): Promise<UserStatus> => {
  const { data } = await apiClient.post('/auth/status/activity');
  return data.user;
};

/**
 * Get all online users
 */
export const getOnlineUsers = async (): Promise<OnlineUser[]> => {
  const { data } = await apiClient.get('/auth/status/online-users');
  return data.users;
};

/**
 * Get specific user's online status
 */
export const getUserStatus = async (userId: string): Promise<UserStatus> => {
  const { data } = await apiClient.get(`/auth/status/${userId}`);
  return data.user;
};

/**
 * Set user online on login
 */
export const setUserOnline = async (userId: string) => {
  return updateOnlineStatus(userId, true);
};

/**
 * Set user offline on logout
 */
export const setUserOffline = async (userId: string) => {
  return updateOnlineStatus(userId, false);
};
