
import { useState, useCallback } from 'react';
import { useAuth as useAuthContext } from '@/context/AuthContext';
import { validateLoginForm } from '@/utils/validation';
import { formatErrorMessage } from '@/utils/networkHandler';
import debugLogger from '@/utils/debugLogger';

/**
 * Enhanced useAuth hook with loading states and error handling
 * Provides a clean API for authentication operations
 */
export const useEnhancedAuth = () => {
  const context = useAuthContext();
  const [loginLoading, setLoginLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { user, loading: contextLoading, isAuthenticated, login: contextLogin, logout: contextLogout, refreshToken } = context;

  /**
   * Login with built-in validation and error handling
   */
  const login = useCallback(async (email: string, password: string) => {
    setLoginLoading(true);
    setError(null);

    try {
      // Validate input
      const validation = validateLoginForm(email.trim(), password);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      debugLogger({
        title: 'useAuth: Login attempt',
        data: { email: email.trim() }
      });

      await contextLogin(email.trim(), password);

      debugLogger({
        title: 'useAuth: ✅ Login successful',
      });

      return { success: true };
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      setError(errorMessage);

      debugLogger({
        title: 'useAuth: ❌ Login failed',
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    } finally {
      setLoginLoading(false);
    }
  }, [contextLogin]);

  /**
   * Logout with loading state
   */
  const logout = useCallback(async () => {
    setLogoutLoading(true);
    setError(null);

    try {
      debugLogger({
        title: 'useAuth: Logout attempt',
      });

      await contextLogout();

      debugLogger({
        title: 'useAuth: ✅ Logout successful',
      });

      return { success: true };
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      setError(errorMessage);

      debugLogger({
        title: 'useAuth: ❌ Logout failed',
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    } finally {
      setLogoutLoading(false);
    }
  }, [contextLogout]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback((role: string): boolean => {
    return user?.role_name === role;
  }, [user]);

  /**
   * Check if user is tourist
   */
  const isTourist = useCallback((): boolean => {
    return hasRole('Tourist');
  }, [hasRole]);

  /**
   * Check if user is owner/business owner
   */
  const isOwner = useCallback((): boolean => {
    return hasRole('Owner') || hasRole('Business Owner');
  }, [hasRole]);

  /**
   * Check if user is admin
   */
  const isAdmin = useCallback((): boolean => {
    return hasRole('Admin') || hasRole('Tourism Admin');
  }, [hasRole]);

  /**
   * Get user's full name
   */
  const getFullName = useCallback((): string => {
    if (!user) return '';
    const { first_name = '', middle_name = '', last_name = '' } = user;
    return `${first_name} ${middle_name} ${last_name}`.trim();
  }, [user]);

  /**
   * Get user's initials
   */
  const getInitials = useCallback((): string => {
    if (!user) return '';
    const { first_name = '', last_name = '' } = user;
    return `${first_name[0] || ''}${last_name[0] || ''}`.toUpperCase();
  }, [user]);

  return {
    // User state
    user,
    isAuthenticated,
    
    // Loading states
    loading: contextLoading,
    loginLoading,
    logoutLoading,
    isLoading: contextLoading || loginLoading || logoutLoading,
    
    // Error state
    error,
    clearError,
    
    // Auth actions
    login,
    logout,
    refreshToken,
    
    // User helpers
    hasRole,
    isTourist,
    isOwner,
    isAdmin,
    getFullName,
    getInitials,
  };
};

export default useEnhancedAuth;
