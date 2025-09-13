import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import {
  loginUser,
  loginAdmin,
  logoutUser,
  getStoredUser,
  api,
} from "@/src/services/AuthService";

interface User {
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  owner_id?: string;
  tourism_id?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginOwner: (email: string, password: string) => Promise<void>;
  loginTourism: (email: string, password: string) => Promise<void>;
  logout: () => void;
  api: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /** Load user from localStorage */
  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) setUser(storedUser);
    setLoading(false);
  }, []);

  /** LOGIN */
  const loginOwner = useCallback(async (email: string, password: string) => {
    const loggedInUser = await loginUser(email, password);
    setUser(loggedInUser);
  }, []);

    /** LOGIN */
  const loginTourism = useCallback(async (email: string, password: string) => {
    const loggedInAdmin = await loginAdmin(email, password);
    setUser(loggedInAdmin);
  }, []);

  /** LOGOUT */
  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, loginOwner, loginTourism, logout, api }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
