import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import {
  loginUser,
  logoutUser,
  getStoredUser,
  getToken,
} from "@/src/services/AuthService";
import axios from "axios";
import type { UserDetails } from "@/src/types/User";
import api from "@/src/services/api";
interface AuthContextType {
  user: UserDetails | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  /** Load user from localStorage */
  useEffect(() => {
    (async () => {
      const storedUser = getStoredUser();
      if (storedUser) setUser(storedUser);
      // Ensure axios Authorization header is set on app load if token exists
      const token = getToken();
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      // If we have a user but no permissions cached (e.g., from older login), fetch them
      if (storedUser && (!storedUser.permissions || storedUser.permissions.length === 0) && token) {
        try {
          const { data } = await axios.get<{ permissions: string[] }>(`${api}/permissions/me`);
          const updatedUser: UserDetails = { ...storedUser, permissions: data?.permissions || [] };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch (err) {
          // Non-fatal: keep going without permissions; UI will hide items
          // console.warn("[AuthContext] Failed to refresh permissions on load", err);
        }
      }

      setLoading(false);
    })();
  }, []);

  /** LOGIN */
  const login = useCallback(async (email: string, password: string) => {
    const loggedInUser = await loginUser(email, password);
    setUser(loggedInUser);
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
