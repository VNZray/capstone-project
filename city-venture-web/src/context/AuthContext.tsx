import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import {
  loginUser,
  logoutUser,
  initializeAuth,
} from "@/src/services/auth/AuthService";
import type { UserDetails } from "@/src/types/User";

interface AuthContextType {
  user: UserDetails | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<UserDetails>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  /** Load user and init session */
  useEffect(() => {
    (async () => {
      // Try to restore session from cookie (refresh token)
      const success = await initializeAuth();

      if (success) {
        try {
          // Fetch fresh user data from API
          const { fetchCurrentUser } = await import(
            "@/src/services/auth/AuthService"
          );
          const user = await fetchCurrentUser();
          setUser(user);
        } catch (error) {
          console.error("[AuthContext] Failed to fetch user profile", error);
          // If fetch fails, maybe logout?
          // logoutUser();
        }
      }
      setLoading(false);
    })();

    // Listen for storage changes to sync auth state across tabs
    const handleStorageChange = async (e: StorageEvent) => {
      // Handle logout from another tab
      if (e.key === "logout-event") {
        console.log("[AuthContext] Logout detected from another tab");
        setUser(null);

        // Clear session storage too just in case
        sessionStorage.clear();

        // Reload to reset state completely
        window.location.href = "/login";
        return;
      }

      // Handle login from another tab
      if (e.key === "login-event") {
        console.log(
          "[AuthContext] Login detected from another tab, syncing..."
        );
        const success = await initializeAuth();
        if (success) {
          try {
            const { fetchCurrentUser } = await import(
              "@/src/services/auth/AuthService"
            );
            const user = await fetchCurrentUser();
            setUser(user);
          } catch (e) {
            console.error("Failed to sync user", e);
          }
        }
      }
    };

    // Monitor tab visibility to ensure session validity
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        // Re-verify session if needed (optional)
        // For now, we rely on apiClient interceptors to catch 401
      }
    };

    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  /** LOGIN */
  const login = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      const loggedInUser = await loginUser(email, password, rememberMe);
      setUser(loggedInUser);
      return loggedInUser;
    },
    []
  );

  /** LOGOUT */
  const logout = useCallback(async () => {
    await logoutUser();
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
