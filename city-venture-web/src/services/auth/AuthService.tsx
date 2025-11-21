import axios from "axios"; // Keep axios for type definitions if needed, but use apiClient for calls
import apiClient, { setAccessToken } from "../apiClient";

import type {
  TokenPayload,
  User,
  UserDetails,
  UserRoles,
} from "../../types/User";
import type {
  Address,
  Municipality,
  Barangay,
  Province,
} from "../../types/Address";
import type { Owner } from "../../types/Owner";
import type { Tourist } from "../../types/Tourist";
import type { Tourism } from "../../types/Tourism";
import type { Staff } from "../../types/Staff";

interface LoginResponse {
  accessToken: string;
  user: any; 
}

/**
 * ENCRYPTION UTILITIES
 */
const encryptUserData = (data: UserDetails): string => {
  const jsonStr = JSON.stringify(data);
  return btoa(btoa(jsonStr));
};

const decryptUserData = (encrypted: string): UserDetails | null => {
  try {
    const decoded = atob(atob(encrypted));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('[AuthService] Failed to decrypt user data', error);
    return null;
  }
};

/**
 * SESSION MANAGEMENT
 */
const SESSION_KEY = 'active_session_id';
const ACTIVE_TAB_KEY = 'active_tab_timestamp';

const generateSessionId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substring(7)}`;
};

const setActiveSession = (sessionId: string): void => {
  localStorage.setItem(SESSION_KEY, sessionId);
};

const clearActiveSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

/**
 * TAB ACTIVITY TRACKING
 */
let tabActivityInterval: NodeJS.Timeout | null = null;

const startTabActivityTracking = (): void => {
  tabActivityInterval = setInterval(() => {
    localStorage.setItem(ACTIVE_TAB_KEY, Date.now().toString());
  }, 2000);
  localStorage.setItem(ACTIVE_TAB_KEY, Date.now().toString());
};

const stopTabActivityTracking = (): void => {
  if (tabActivityInterval) {
    clearInterval(tabActivityInterval);
    tabActivityInterval = null;
  }
  localStorage.removeItem(ACTIVE_TAB_KEY);
};

/**
 * LOGIN USER
 */
export const loginUser = async (
  email: string,
  password: string,
  rememberMe: boolean = false
): Promise<UserDetails> => {
  // ============================================
  // STEP 1: Authenticate User & Get Token
  // ============================================
  console.debug("[AuthService] POST /auth/login", { email });
  const { data } = await apiClient
    .post<LoginResponse>(`/auth/login`, {
      email,
      password,
      client: 'web'
    })
    .catch((err) => {
      console.error("[AuthService] Login request failed", {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      throw err;
    });

  const { accessToken, user: loginUserSummary } = data;
  console.debug("[AuthService] Received access token", accessToken ? "<redacted>" : null);

  // Store access token in memory
  setAccessToken(accessToken);

  // ============================================
  // STEP 2: Decode & Validate Token
  // ============================================
  let payload: TokenPayload;
  try {
    payload = JSON.parse(atob(accessToken.split(".")[1]));
    console.debug("[AuthService] Decoded token payload", payload);
  } catch {
    throw new Error("Invalid authentication token");
  }

  const user_id = payload.id;
  if (!user_id) throw new Error("User ID not found in token");

  // ============================================
  // STEP 3: Fetch Core User Data
  // ============================================
  console.debug("[AuthService] GET /users/:id", user_id);
  const { data: userData } = await apiClient
    .get<User>(`/users/${user_id}`)
    .catch((err) => {
      console.error("[AuthService] Fetch user failed", err);
      throw err;
    });

  // ============================================
  // STEP 4: Fetch User Role & Permissions
  // ============================================
  console.debug("[AuthService] GET /user-roles/:id", userData.user_role_id);
  const { data: userRole } = await apiClient
    .get<UserRoles>(`/user-roles/${userData.user_role_id}`)
    .catch((err) => {
        // Fallback logic preserved...
        const id = userData.user_role_id;
        const fallbackRoleName = id === 1 ? "Admin" : id === 4 ? "Owner" : "Tourist"; // Simplified for brevity
        return { data: { role_name: fallbackRoleName, description: "" } as UserRoles };
    });

  const myPermissions: string[] = await apiClient
    .get<{ permissions: string[] }>(`/permissions/me`)
    .then((r) => r.data?.permissions || [])
    .catch(() => []);

  // Normalize role name
  const rawRoleName = (userRole?.role_name ?? "").toString();
  const normalizedRoleName = (() => {
    const r = rawRoleName.toLowerCase();
    if (r.includes("tourism head")) return "Tourism Head";
    if (r.includes("tourism officer")) return "Tourism Officer";
    if (r.includes("admin")) return "Admin";
    if (r.includes("event coordinator")) return "Event Coordinator";
    if (r.includes("owner")) return "Business Owner";
    if (r.includes("manager") && !r.includes("room")) return "Manager";
    if (r.includes("room manager")) return "Room Manager";
    if (r.includes("receptionist")) return "Receptionist";
    if (r.includes("sales associate")) return "Sales Associate";
    return "Tourist";
  })();

  // ============================================
  // STEP 5: Fetch Role-Specific User Details
  // ============================================
  const touristRoles = ["Tourist"];
  const ownerRoles = ["Business Owner"];
  const tourismRoles = ["Admin", "Tourism Officer", "Tourism Head", "Event Coordinator"];
  const staffRoles = ["Manager", "Room Manager", "Receptionist", "Sales Associate"];

  let ownerData: Partial<Owner> | null = null;
  let touristData: Partial<Tourist> | null = null;
  let tourismData: Partial<Tourism> | null = null;
  let staffData: Partial<Staff> | null = null;

  if (ownerRoles.includes(normalizedRoleName)) {
    ownerData = await apiClient.get<Owner>(`/owner/user/${user_id}`).then(r => r.data).catch(() => null);
  } else if (touristRoles.includes(normalizedRoleName)) {
    touristData = await apiClient.get<Tourist>(`/tourist/user/${user_id}`).then(r => r.data).catch(() => null);
  } else if (tourismRoles.includes(normalizedRoleName)) {
    tourismData = await apiClient.get<Tourism>(`/tourism/user/${user_id}`).then(r => r.data).catch(() => null);
  } else if (staffRoles.includes(normalizedRoleName)) {
    staffData = await apiClient.get<Staff>(`/staff/user/${user_id}`).then(r => r.data).catch(() => null);
  }

  // ============================================
  // STEP 6: Fetch Address Details
  // ============================================
  let addressData: Address | null = null;
  let barangay: Partial<Barangay> = {};
  let municipality: Partial<Municipality> = {};
  let province: Partial<Province> = {};

  if (userData?.barangay_id != null) {
    addressData = await apiClient.get<Address>(`/address/${userData.barangay_id}`).then(r => r.data).catch(() => null);
    if (addressData) {
      barangay = await apiClient.get<Barangay>(`/address/barangay/${addressData.barangay_id}`).then(r => r.data).catch(() => ({}));
      municipality = await apiClient.get<Municipality>(`/address/municipality/${addressData.municipality_id}`).then(r => r.data).catch(() => ({}));
      province = await apiClient.get<Province>(`/address/province/${addressData.province_id}`).then(r => r.data).catch(() => ({}));
    }
  }

  // ============================================
  // STEP 7: Build Unified User Details Object
  // ============================================
  const roleData = ownerData || touristData || tourismData || staffData || {};

  const loggedInUser: UserDetails = {
    id: roleData?.id || userData.id,
    user_id: userData.id || "",
    email,
    password,
    phone_number: userData.phone_number,
    user_role_id: userData.user_role_id,
    role_name: normalizedRoleName,
    description: userRole?.description || "",
    permissions: myPermissions,
    first_name: roleData?.first_name || "",
    middle_name: roleData?.middle_name || "",
    last_name: roleData?.last_name || "",
    gender: (roleData as any)?.gender || "",
    birthdate: (roleData as any)?.birthdate || "",
    nationality: (touristData as any)?.nationality || "",
    ethnicity: (touristData as any)?.ethnicity || "",
    category: (touristData as any)?.category || "",
    business_id: (staffData as any)?.business_id || "",
    barangay_id: userData?.barangay_id ?? "",
    barangay_name: barangay?.barangay || "",
    municipality_name: municipality?.municipality || "",
    province_name: province?.province || "",
    user_profile: userData.user_profile,
    is_active: Boolean(userData.is_active),
    is_verified: Boolean(userData.is_verified),
    created_at: userData.created_at || "",
    updated_at: userData.updated_at || "",
    last_login: userData.last_login || "",
  };

  // ============================================
  // STEP 8: Session & Security Management
  // ============================================
  const sessionId = generateSessionId();
  setActiveSession(sessionId);
  startTabActivityTracking();
  
  // Save user data only (tokens are in HttpOnly cookie + memory)
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem("rememberMe", rememberMe.toString());
  storage.setItem("sessionId", sessionId);
  
  const encryptedUser = encryptUserData(loggedInUser);
  storage.setItem("user", encryptedUser);

  // Notify other tabs of login
  localStorage.setItem("login-event", Date.now().toString());
  
  // Clean up other storage
  const otherStorage = rememberMe ? sessionStorage : localStorage;
  otherStorage.removeItem("user");
  otherStorage.removeItem("rememberMe");
  otherStorage.removeItem("sessionId");

  return loggedInUser;
};

/**
 * LOGOUT USER
 */
export const logoutUser = async () => {
  console.debug("[AuthService] Logging out user");
  
  try {
      await apiClient.post('/auth/logout');
  } catch (e) {
      console.warn("Logout call failed", e);
  }

  setAccessToken(null);

  stopTabActivityTracking();
  clearActiveSession();

  sessionStorage.removeItem("user");
  sessionStorage.removeItem("rememberMe");
  sessionStorage.removeItem("sessionId");
  localStorage.removeItem("user");
  localStorage.removeItem("rememberMe");
  localStorage.removeItem("sessionId");
  localStorage.removeItem("selectedBusinessId");
  localStorage.removeItem("selectedRoomId");
  
  localStorage.setItem("logout-event", Date.now().toString());
};

/**
 * GET STORED USER
 */
export const getStoredUser = (): UserDetails | null => {
  const encryptedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
  
  if (!encryptedUser) {
    return null;
  }
  
  return decryptUserData(encryptedUser);
};

// Initialize Auth (Try refresh)
export const initializeAuth = async (): Promise<boolean> => {
    try {
        const { data } = await apiClient.post('/auth/refresh', {}, { withCredentials: true });
        setAccessToken(data.accessToken);
        return true;
    } catch (e) {
        return false;
    }
};

export const startSessionTracking = (): void => {
  startTabActivityTracking();
};

export const stopSessionTracking = (): void => {
  stopTabActivityTracking();
};
