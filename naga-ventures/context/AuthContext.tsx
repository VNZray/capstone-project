import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

interface User {
  id: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
}

// const API_URL = 'http://192.168.1.8:3000/api';
const API_URL = "http://192.168.1.2:3000/api";


interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');

      if (token && userData) {
        setUser(JSON.parse(userData));
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Step 1: Login request
      const res = await axios.post(`${API_URL}/users/login`, { email, password });
      const { token } = res.data;

      // Step 2: Decode token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const touristId = payload.tourist_id;

      console.log('Decoded payload:', payload);

      // Step 3: Fetch tourist details
      const touristRes = await axios.get(`${API_URL}/tourist/${touristId}`);
      const { first_name, last_name } = touristRes.data;

      // Step 4: Build loggedInUser object
      const loggedInUser: User = {
        id: touristId,
        email,
        role: payload.role,
        first_name,
        last_name,
      };

      // Step 5: Save to AsyncStorage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(loggedInUser));

      setUser(loggedInUser);
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
