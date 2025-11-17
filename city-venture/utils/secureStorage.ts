
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Secure Storage Utility
 * Uses expo-secure-store for sensitive data (tokens)
 * Falls back to AsyncStorage for non-sensitive data or web platform
 */

const SECURE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  LAST_LOGIN: 'last_login',
} as const;

/**
 * Check if secure storage is available (not available on web)
 */
const isSecureStoreAvailable = Platform.OS !== 'web';

/**
 * Save token securely
 */
export const saveToken = async (token: string): Promise<void> => {
  try {
    if (isSecureStoreAvailable) {
      await SecureStore.setItemAsync(SECURE_KEYS.TOKEN, token);
    } else {
      await AsyncStorage.setItem(SECURE_KEYS.TOKEN, token);
    }
  } catch (error) {
    console.error('[SecureStorage] Failed to save token:', error);
    throw new Error('Failed to save authentication token');
  }
};

/**
 * Get token from secure storage
 */
export const getToken = async (): Promise<string | null> => {
  try {
    if (isSecureStoreAvailable) {
      return await SecureStore.getItemAsync(SECURE_KEYS.TOKEN);
    } else {
      return await AsyncStorage.getItem(SECURE_KEYS.TOKEN);
    }
  } catch (error) {
    console.error('[SecureStorage] Failed to get token:', error);
    return null;
  }
};

/**
 * Delete token from secure storage
 */
export const deleteToken = async (): Promise<void> => {
  try {
    if (isSecureStoreAvailable) {
      await SecureStore.deleteItemAsync(SECURE_KEYS.TOKEN);
    } else {
      await AsyncStorage.removeItem(SECURE_KEYS.TOKEN);
    }
  } catch (error) {
    console.error('[SecureStorage] Failed to delete token:', error);
  }
};

/**
 * Save refresh token securely (if your backend supports it)
 */
export const saveRefreshToken = async (refreshToken: string): Promise<void> => {
  try {
    if (isSecureStoreAvailable) {
      await SecureStore.setItemAsync(SECURE_KEYS.REFRESH_TOKEN, refreshToken);
    } else {
      await AsyncStorage.setItem(SECURE_KEYS.REFRESH_TOKEN, refreshToken);
    }
  } catch (error) {
    console.error('[SecureStorage] Failed to save refresh token:', error);
  }
};

/**
 * Get refresh token from secure storage
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    if (isSecureStoreAvailable) {
      return await SecureStore.getItemAsync(SECURE_KEYS.REFRESH_TOKEN);
    } else {
      return await AsyncStorage.getItem(SECURE_KEYS.REFRESH_TOKEN);
    }
  } catch (error) {
    console.error('[SecureStorage] Failed to get refresh token:', error);
    return null;
  }
};

/**
 * Delete refresh token
 */
export const deleteRefreshToken = async (): Promise<void> => {
  try {
    if (isSecureStoreAvailable) {
      await SecureStore.deleteItemAsync(SECURE_KEYS.REFRESH_TOKEN);
    } else {
      await AsyncStorage.removeItem(SECURE_KEYS.REFRESH_TOKEN);
    }
  } catch (error) {
    console.error('[SecureStorage] Failed to delete refresh token:', error);
  }
};

/**
 * Save user data (less sensitive, can use AsyncStorage)
 */
export const saveUserData = async (userData: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(SECURE_KEYS.USER_DATA, userData);
  } catch (error) {
    console.error('[SecureStorage] Failed to save user data:', error);
    throw new Error('Failed to save user data');
  }
};

/**
 * Get user data
 */
export const getUserData = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(SECURE_KEYS.USER_DATA);
  } catch (error) {
    console.error('[SecureStorage] Failed to get user data:', error);
    return null;
  }
};

/**
 * Delete user data
 */
export const deleteUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SECURE_KEYS.USER_DATA);
  } catch (error) {
    console.error('[SecureStorage] Failed to delete user data:', error);
  }
};

/**
 * Save last login timestamp
 */
export const saveLastLogin = async (): Promise<void> => {
  try {
    const timestamp = new Date().toISOString();
    await AsyncStorage.setItem(SECURE_KEYS.LAST_LOGIN, timestamp);
  } catch (error) {
    console.error('[SecureStorage] Failed to save last login:', error);
  }
};

/**
 * Get last login timestamp
 */
export const getLastLogin = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(SECURE_KEYS.LAST_LOGIN);
  } catch (error) {
    console.error('[SecureStorage] Failed to get last login:', error);
    return null;
  }
};

/**
 * Clear all authentication data (logout)
 */
export const clearAllAuthData = async (): Promise<void> => {
  try {
    await Promise.all([
      deleteToken(),
      deleteRefreshToken(),
      deleteUserData(),
      AsyncStorage.removeItem(SECURE_KEYS.LAST_LOGIN),
    ]);
  } catch (error) {
    console.error('[SecureStorage] Failed to clear auth data:', error);
    throw new Error('Failed to clear authentication data');
  }
};

/**
 * Check if user has valid stored credentials
 */
export const hasStoredCredentials = async (): Promise<boolean> => {
  try {
    const token = await getToken();
    const userData = await getUserData();
    return !!(token && userData);
  } catch (error) {
    console.error('[SecureStorage] Failed to check credentials:', error);
    return false;
  }
};
