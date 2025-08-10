import axios from "axios";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";

interface User {
  id: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
}

interface LoginResponse {
  token: string;
}

interface TouristResponse {
  first_name: string;
  last_name: string;
}

const API_URL = "http://192.168.1.8:3000/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
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
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  /** LOGIN */
  const login = useCallback(async (email: string, password: string) => {
    try {
      // Step 1: Login request
      const { data } = await axios.post<LoginResponse>(
        `${API_URL}/users/login`,
        { email, password }
      );

      const { token } = data;

      // Step 2: Decode token safely
      let payload: any;
      try {
        payload = JSON.parse(atob(token.split(".")[1]));
      } catch {
        throw new Error("Invalid authentication token");
      }

      const ownerId: string = payload.owner_id;
      if (!ownerId) throw new Error("Tourist ID not found in token");

      // Step 3: Fetch owner details
      const { data: ownerData } = await axios.get<TouristResponse>(
        `${API_URL}/owner/${ownerId}`
      );

      // Step 4: Build user object
      const loggedInUser: User = {
        id: ownerId,
        email,
        role: payload.role,
        first_name: ownerData.first_name,
        last_name: ownerData.last_name,
      };

      // Step 5: Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(loggedInUser));

      setUser(loggedInUser);
    } catch (error: any) {
      console.error(
        "Login error:",
        error.response?.data || error.message || error
      );
      throw error;
    }
  }, []);

  /** LOGOUT */
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/** Hook to use Auth context */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
