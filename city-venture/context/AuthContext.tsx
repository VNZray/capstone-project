import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import {
  loginUser,
  logoutUser,
  getStoredUser,
  getToken,
} from "@/services/AuthService";
import type { UserDetails } from "../types/User";
import axios from "axios";
import api from "@/services/api";

interface AuthContextType {
  user: UserDetails | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserDetails>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  /** Load user from AsyncStorage and set Authorization header */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await getStoredUser();
        const token = await getToken();
        
        if (storedUser && token) {
          setUser(storedUser);
          // Set Authorization header for subsequent requests
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // If we have a user but no permissions cached, fetch them
          if (!storedUser.permissions || storedUser.permissions.length === 0) {
            try {
              const { data } = await axios.get<{ permissions: string[] }>(`${api}/permissions/me`);
              const updatedUser: UserDetails = { 
                ...storedUser, 
                permissions: data?.permissions || [] 
              };
              setUser(updatedUser);
            } catch (err) {
              // Non-fatal: keep going without permissions
              console.warn("[AuthContext] Failed to refresh permissions on load", err);
            }
          }
        }
      } catch (error) {
        console.error("[AuthContext] Failed to load user:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  /** LOGIN */
  const login = useCallback(async (email: string, password: string) => {
    const loggedInUser = await loginUser(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

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
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
