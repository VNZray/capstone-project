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
  getStoredUser,
  initializeAuth,
} from "@/services/AuthService";
import type { UserDetails } from "../types/User";
import debugLogger from "@/utils/debugLogger";
import PushNotificationService from "@/services/PushNotificationService";
import type * as Notifications from "expo-notifications";
import { saveUserData } from "@/utils/secureStorage";
import apiClient from "@/services/api/apiClient";

interface AuthContextType {
  user: UserDetails | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<UserDetails>) => Promise<void>;
  refreshUserData: () => Promise<UserDetails | undefined>;
  expoPushToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  /** Initialize Push Notification Service */
  const initializeNotifications = useCallback(async (userId?: string) => {
    if (!userId) {
      console.warn(
        "[AuthContext] Cannot initialize notifications without userId",
      );
      return;
    }

    try {
      await PushNotificationService.initialize({
        userId,
        onNotificationReceived: (notification: Notifications.Notification) => {
          console.log(
            "[AuthContext] 📱 Notification received in foreground:",
            notification.request.content.title,
          );
          // Notification is automatically added to the notification list by backend
        },
        onNotificationTapped: (
          response: Notifications.NotificationResponse,
        ) => {
          console.log(
            "[AuthContext] 👆 User tapped notification:",
            response.notification.request.content.title,
          );
          // TODO: Navigate to appropriate screen based on notification type
          const data = response.notification.request.content.data;
          console.log("[AuthContext] Notification data:", data);
        },
      });

      const token = PushNotificationService.getCurrentToken();
      setExpoPushToken(token);

      debugLogger({
        title: "AuthContext: Push notifications initialized",
        data: { userId, hasToken: !!token },
      });
    } catch (error) {
      console.error(
        "[AuthContext] Failed to initialize push notifications:",
        error,
      );
    }
  }, []);

  /** Initialize Auth on Mount */
  useEffect(() => {
    const init = async () => {
      try {
        debugLogger({
          title: "AuthContext: Initializing...",
        });

        // Attempt to restore session via refresh token
        const success = await initializeAuth();

        if (success) {
          const storedUser = await getStoredUser();
          if (storedUser) {
            debugLogger({
              title: "AuthContext: User restored",
              data: { user_id: storedUser.user_id },
            });
            setUser(storedUser);

            // Initialize notifications for restored user
            await initializeNotifications(storedUser.user_id);
          } else {
            // If we have token but no user data, maybe fetch /auth/me?
            // For now, simpler to require login if data missing.
            // Or await fetchMe();
          }
        } else {
          debugLogger({
            title: "AuthContext: No valid session found",
          });
          setUser(null);
        }
      } catch (error) {
        console.error("[AuthContext] Initialization error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [initializeNotifications]);

  /** LOGIN */
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        debugLogger({
          title: "AuthContext: Login started",
          data: { email },
        });

        const loggedInUser = await loginUser(email, password);
        setUser(loggedInUser);

        // Initialize notifications after successful login
        await initializeNotifications(loggedInUser.user_id);

        debugLogger({
          title: "AuthContext: ✅ Login successful",
          data: {
            user_id: loggedInUser.user_id,
            role: loggedInUser.role_name,
          },
        });
      } catch (error) {
        debugLogger({
          title: "AuthContext: ❌ Login failed",
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
    [initializeNotifications],
  );

  /** LOGOUT */
  const logout = useCallback(async () => {
    try {
      debugLogger({
        title: "AuthContext: Logout started",
      });

      await logoutUser();

      // Cleanup push notification service
      PushNotificationService.cleanup();
      setExpoPushToken(null);
      setUser(null);

      debugLogger({
        title: "AuthContext: ✅ Logout successful",
      });
    } catch (error) {
      console.error("[AuthContext] Logout error:", error);
      setUser(null);
    }
  }, []);

  /** UPDATE USER */
  const updateUser = useCallback(
    async (updates: Partial<UserDetails>) => {
      if (!user) {
        throw new Error("No user logged in");
      }

      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);

      // Update secure storage
      await saveUserData(JSON.stringify(updatedUser));

      debugLogger({
        title: "AuthContext: User updated",
        data: updates,
      });
    },
    [user],
  );

  /** REFRESH USER DATA - Fetch latest user info from server */
  const refreshUserData = useCallback(async () => {
    try {
      if (!user?.user_id) {
        throw new Error("No user logged in");
      }

      const response = await apiClient.get("/auth/me");

      if (response.data?.user) {
        const updatedUser = { ...user, ...response.data.user };
        setUser(updatedUser);

        // Update secure storage
        await saveUserData(JSON.stringify(updatedUser));

        debugLogger({
          title: "AuthContext: User data refreshed",
          data: updatedUser,
        });

        return updatedUser;
      }
    } catch (error) {
      console.error("[AuthContext] Failed to refresh user data:", error);
      throw error;
    }
  }, [user]);

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
        refreshUserData,
        expoPushToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
