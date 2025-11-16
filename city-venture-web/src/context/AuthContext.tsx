import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import {
  loginUser,
  logoutUser,
  getStoredUser,
  getToken,
} from "@/src/services/auth/AuthService";
import axios from "axios";
import type { UserDetails } from "@/src/types/User";
import api from "@/src/services/api";
interface AuthContextType {
  user: UserDetails | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<UserDetails>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  /** Load user from storage and sync across tabs */
  useEffect(() => {
    (async () => {
      const storedUser = getStoredUser();
      const token = getToken();
      
      if (storedUser && token) {
        setUser(storedUser);
        // Ensure axios Authorization header is set on app load if token exists
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // If we have a user but no permissions cached (e.g., from older login), fetch them
        if (!storedUser.permissions || storedUser.permissions.length === 0) {
          try {
            const { data } = await axios.get<{ permissions: string[] }>(`${api}/permissions/me`);
            const updatedUser: UserDetails = { ...storedUser, permissions: data?.permissions || [] };
            setUser(updatedUser);
          } catch (err) {
            // Non-fatal: keep going without permissions; UI will hide items
            console.warn("[AuthContext] Failed to refresh permissions on load", err);
          }
        }
      }

      setLoading(false);
    })();

    // Listen for storage changes to sync auth state across tabs
    const handleStorageChange = (e: StorageEvent) => {
      // Handle logout from another tab - force logout this tab
      if (e.key === "logout-event") {
        console.log('[AuthContext] Logout detected from another tab');
        setUser(null);
        delete axios.defaults.headers.common["Authorization"];
        
        // Clear all auth data
        sessionStorage.clear();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("sessionId");
        
        // Reload page to clear any cached state
        window.location.href = '/login';
        return;
      }

      // Handle session changes - if active session changes, logout this tab
      if (e.key === "active_session_id") {
        const currentSessionId = localStorage.getItem("sessionId") || sessionStorage.getItem("sessionId");
        const newActiveSession = e.newValue;
        
        if (currentSessionId && newActiveSession && currentSessionId !== newActiveSession) {
          console.log('[AuthContext] Session changed in another tab, logging out');
          logoutUser(); // Use imported function instead of context function
          window.location.href = '/login';
        }
      }

      // Handle login from another tab - allow access but keep same session
      if (e.key === "token" && e.newValue) {
        const storedUser = getStoredUser();
        const token = getToken();
        
        if (storedUser && token) {
          console.log('[AuthContext] Login detected from another tab, syncing...');
          setUser(storedUser);
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
      }
    };

    // Monitor tab visibility to prevent background tab issues
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Verify session is still valid when tab becomes visible
        const storedUser = getStoredUser();
        const token = getToken();
        
        // If no stored user/token but page is not login, redirect
        if (!storedUser || !token) {
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/register') {
            console.log('[AuthContext] Session invalid, logging out');
            logoutUser();
            window.location.href = '/login';
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** LOGIN */
  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    const loggedInUser = await loginUser(email, password, rememberMe);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  /** LOGOUT */
  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
