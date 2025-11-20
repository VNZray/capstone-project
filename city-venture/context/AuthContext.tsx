import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import {
  loginUser,
  logoutUser,
  getStoredUser,
  ensureValidToken,
  isSessionValid,
} from "@/services/AuthService";
import type { UserDetails } from "../types/User";
import debugLogger from "@/utils/debugLogger";

interface AuthContextType {
  user: UserDetails | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Session timeout - 30 minutes
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const tokenRefreshInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Load user from secure storage and check session validity */
  useEffect(() => {
    const loadUser = async () => {
      try {
        debugLogger({
          title: 'AuthContext: Loading stored user',
        });

        const storedUser = await getStoredUser();
        if (!storedUser) {
          debugLogger({
            title: 'AuthContext: No stored user found',
          });
          setLoading(false);
          return;
        }

        // Check session validity
        const sessionValid = await isSessionValid();
        if (!sessionValid) {
          debugLogger({
            title: 'AuthContext: Session expired',
          });
          await logoutUser();
          setUser(null);
          setLoading(false);
          return;
        }

        debugLogger({
          title: 'AuthContext: User loaded from storage',
          data: {
            user_id: storedUser.user_id,
            role: storedUser.role_name,
          }
        });

        setUser(storedUser);
      } catch (error) {
        console.error('[AuthContext] Failed to load user:', error);
        await logoutUser();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /** Setup session timeout checker */
  useEffect(() => {
    if (!user) {
      // Clear intervals if user is logged out
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
        sessionCheckInterval.current = null;
      }
      if (tokenRefreshInterval.current) {
        clearInterval(tokenRefreshInterval.current);
        tokenRefreshInterval.current = null;
      }
      return;
    }

    // Check session validity every minute
    sessionCheckInterval.current = setInterval(async () => {
      const sessionValid = await isSessionValid();
      if (!sessionValid) {
        debugLogger({
          title: 'AuthContext: Session timeout detected',
        });
        await logout();
      }
    }, 60 * 1000); // Check every minute

    // Cleanup on unmount
    return () => {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
      }
    };
  }, [user]);

  /** Setup auto token refresh */
  useEffect(() => {
    if (!user) return;

    // Check and refresh token every 4 minutes
    tokenRefreshInterval.current = setInterval(async () => {
      try {
        await ensureValidToken();
      } catch (error) {
        console.error('[AuthContext] Token refresh failed:', error);
      }
    }, 4 * 60 * 1000); // Every 4 minutes

    return () => {
      if (tokenRefreshInterval.current) {
        clearInterval(tokenRefreshInterval.current);
      }
    };
  }, [user]);

  /** LOGIN */
  const login = useCallback(async (email: string, password: string) => {
    try {
      debugLogger({
        title: 'AuthContext: Login started',
        data: { email }
      });

      const loggedInUser = await loginUser(email, password);
      setUser(loggedInUser);

      debugLogger({
        title: 'AuthContext: ✅ Login successful',
        data: {
          user_id: loggedInUser.user_id,
          role: loggedInUser.role_name,
        }
      });
    } catch (error) {
      debugLogger({
        title: 'AuthContext: ❌ Login failed',
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }, []);

  /** LOGOUT */
  const logout = useCallback(async () => {
    try {
      debugLogger({
        title: 'AuthContext: Logout started',
      });

      await logoutUser();
      setUser(null);

      debugLogger({
        title: 'AuthContext: ✅ Logout successful',
      });
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
      // Still clear user state even if logout fails
      setUser(null);
    }
  }, []);

  /** REFRESH TOKEN */
  const refreshToken = useCallback(async () => {
    try {
      await ensureValidToken();
    } catch (error) {
      console.error('[AuthContext] Token refresh error:', error);
    }
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated, 
      login, 
      logout,
      refreshToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};