import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import type { ReactNode } from 'react';
import {
  loginUser,
  logoutUser,
  getStoredUser,
  initializeAuth,
} from '@/services/AuthService';
import type { UserDetails } from '../types/User';
import debugLogger from '@/utils/debugLogger';

interface AuthContextType {
  user: UserDetails | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<UserDetails>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  /** Initialize Auth on Mount */
  useEffect(() => {
    const init = async () => {
      try {
        debugLogger({
          title: 'AuthContext: Initializing...',
        });

        // Attempt to restore session via refresh token
        const success = await initializeAuth();

        if (success) {
          const storedUser = await getStoredUser();
          if (storedUser) {
            debugLogger({
              title: 'AuthContext: User restored',
              data: { user_id: storedUser.user_id },
            });
            setUser(storedUser);
          } else {
            // If we have token but no user data, maybe fetch /auth/me?
            // For now, simpler to require login if data missing.
            // Or await fetchMe();
          }
        } else {
          debugLogger({
            title: 'AuthContext: No valid session found',
          });
          setUser(null);
        }
      } catch (error) {
        console.error('[AuthContext] Initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  /** LOGIN */
  const login = useCallback(async (email: string, password: string) => {
    try {
      debugLogger({
        title: 'AuthContext: Login started',
        data: { email },
      });

      const loggedInUser = await loginUser(email, password);
      setUser(loggedInUser);

      debugLogger({
        title: 'AuthContext: ✅ Login successful',
        data: {
          user_id: loggedInUser.user_id,
          role: loggedInUser.role_name,
        },
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
      setUser(null);
    }
  }, []);

  /** UPDATE USER */
  const updateUser = useCallback(
    async (updates: Partial<UserDetails>) => {
      if (!user) {
        throw new Error('No user logged in');
      }

      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);

      // Update secure storage
      const { saveUserData } = await import('@/utils/secureStorage');
      await saveUserData(JSON.stringify(updatedUser));

      debugLogger({
        title: 'AuthContext: User updated',
        data: updates,
      });
    },
    [user]
  );

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
