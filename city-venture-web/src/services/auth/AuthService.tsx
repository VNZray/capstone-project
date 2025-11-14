import axios from "axios";

import api from "@/src/services/api";
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
  token: string;
}

/**
 * ENCRYPTION UTILITIES
 * Encrypt/decrypt user data using base64 encoding
 * Simple obfuscation to prevent casual inspection in DevTools
 */
const encryptUserData = (data: UserDetails): string => {
  const jsonStr = JSON.stringify(data);
  // Double encode for simple obfuscation
  return btoa(btoa(jsonStr));
};

const decryptUserData = (encrypted: string): UserDetails | null => {
  try {
    // Double decode
    const decoded = atob(atob(encrypted));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('[AuthService] Failed to decrypt user data', error);
    return null;
  }
};

/**
 * SESSION MANAGEMENT
 * Prevent multiple logins and manage active sessions
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
 * Track active tab to prevent multiple simultaneous sessions
 */
let tabActivityInterval: NodeJS.Timeout | null = null;

const startTabActivityTracking = (): void => {
  // Update timestamp every 2 seconds to indicate this tab is active
  tabActivityInterval = setInterval(() => {
    localStorage.setItem(ACTIVE_TAB_KEY, Date.now().toString());
  }, 2000);
  
  // Set initial timestamp
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
 * Authenticates user credentials and retrieves complete user profile
 * based on their role (Tourist, Owner, Tourism Officer, Staff)
 */
export const loginUser = async (
  email: string,
  password: string,
  rememberMe: boolean = false
): Promise<UserDetails> => {
  // ============================================
  // STEP 1: Authenticate User & Get Token
  // ============================================
  console.debug("[AuthService] POST /users/login", { email });
  const { data } = await axios
    .post<LoginResponse>(`${api}/users/login`, {
      email,
      password,
    })
    .catch((err) => {
      console.error("[AuthService] Login request failed", {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      throw err;
    });

  const { token } = data;
  console.debug("[AuthService] Received token", token ? "<redacted>" : null);

  // Set Authorization header for subsequent requests (required for RBAC)
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  // ============================================
  // STEP 2: Decode & Validate Token
  // ============================================
  let payload: TokenPayload;
  try {
    payload = JSON.parse(atob(token.split(".")[1]));
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
  const { data: userData } = await axios
    .get<User>(`${api}/users/${user_id}`)
    .catch((err) => {
      console.error("[AuthService] Fetch user failed", {
        user_id,
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      throw err;
    });
  console.debug("[AuthService] userData", userData);

  // ============================================
  // STEP 4: Fetch User Role & Permissions
  // ============================================
  console.debug("[AuthService] GET /user-roles/:id", userData.user_role_id);
  const { data: userRole } = await axios
    .get<UserRoles>(`${api}/user-roles/${userData.user_role_id}`)
    .catch((err) => {
      console.error("[AuthService] Fetch role by id failed", {
        user_role_id: userData.user_role_id,
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      // Fallback: Map from seeded role IDs
      console.warn(
        "[AuthService] Using fallback role mapping based on user_role_id"
      );
      const id = userData.user_role_id;
      const fallbackRoleName =
        id === 1
          ? "Admin"
          : id === 2
          ? "Tourism Officer"
          : id === 3
          ? "Event Coordinator"
          : id === 4
          ? "Owner"
          : id === 5
          ? "Manager"
          : id === 6
          ? "Room Manager"
          : id === 7
          ? "Receptionist"
          : id === 8
          ? "Sales Associate"
          : "Tourist";
      return { data: { role_name: fallbackRoleName, description: "" } };
    });
  console.debug("[AuthService] userRole", userRole);

  // Fetch user permissions for RBAC (Role-Based Access Control)
  console.debug("[AuthService] GET /permissions/me");
  const myPermissions: string[] = await axios
    .get<{ permissions: string[] }>(`${api}/permissions/me`)
    .then((r) => r.data?.permissions || [])
    .catch((err) => {
      console.warn("[AuthService] Fetch my permissions failed", {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      return [] as string[];
    });

  // Normalize role name for consistent UI usage
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
  // Define role categories for efficient fetching
  const touristRoles = ["Tourist"];
  const ownerRoles = ["Business Owner"];
  const tourismRoles = [
    "Admin",
    "Tourism Officer",
    "Tourism Head",
    "Event Coordinator",
  ];
  const staffRoles = [
    "Manager",
    "Room Manager",
    "Receptionist",
    "Sales Associate",
  ];

  let ownerData: Partial<Owner> | null = null;
  let touristData: Partial<Tourist> | null = null;
  let tourismData: Partial<Tourism> | null = null;
  let staffData: Partial<Staff> | null = null;

  // Fetch data based on normalized role
  if (ownerRoles.includes(normalizedRoleName)) {
    // Fetch Owner data
    console.debug("[AuthService] GET /owner/user/:user_id", user_id);
    ownerData = await axios
      .get<Owner>(`${api}/owner/user/${user_id}`)
      .then((r) => r.data as Partial<Owner>)
      .catch((err) => {
        console.warn("[AuthService] Owner by user lookup failed", {
          user_id,
          message: err?.message,
          status: err?.response?.status,
          data: err?.response?.data,
        });
        return null;
      });
    console.debug("[AuthService] ownerData", ownerData);
  } else if (touristRoles.includes(normalizedRoleName)) {
    // Fetch Tourist data
    console.debug("[AuthService] GET /tourist/user/:user_id", user_id);
    touristData = await axios
      .get<Tourist>(`${api}/tourist/user/${user_id}`)
      .then((r) => r.data as Partial<Tourist>)
      .catch((err) => {
        console.warn("[AuthService] Tourist by user lookup failed", {
          user_id,
          message: err?.message,
          status: err?.response?.status,
          data: err?.response?.data,
        });
        return null;
      });
    console.debug("[AuthService] touristData", touristData);
  } else if (tourismRoles.includes(normalizedRoleName)) {
    // Fetch Tourism Officer data
    console.debug("[AuthService] GET /tourism/user/:user_id", user_id);
    tourismData = await axios
      .get<Tourism>(`${api}/tourism/user/${user_id}`)
      .then((r) => r.data as Partial<Tourism>)
      .catch((err) => {
        console.warn("[AuthService] Tourism by user lookup failed", {
          user_id,
          message: err?.message,
          status: err?.response?.status,
          data: err?.response?.data,
        });
        return null;
      });
    console.debug("[AuthService] tourismData", tourismData);
  } else if (staffRoles.includes(normalizedRoleName)) {
    // Fetch Staff data
    console.debug("[AuthService] GET /staff/user/:user_id", user_id);
    staffData = await axios
      .get<Staff>(`${api}/staff/user/${user_id}`)
      .then((r) => r.data as Partial<Staff>)
      .catch((err) => {
        console.warn("[AuthService] Staff by user lookup failed", {
          user_id,
          message: err?.message,
          status: err?.response?.status,
          data: err?.response?.data,
        });
        return null;
      });
    console.debug("[AuthService] staffData", staffData);
  }

  // ============================================
  // STEP 6: Fetch Address Details
  // ============================================
  let addressData: Address | null = null;
  let barangay: Partial<Barangay> = {};
  let municipality: Partial<Municipality> = {};
  let province: Partial<Province> = {};

  if (userData?.barangay_id != null) {
    console.debug("[AuthService] GET /address/:id", userData.barangay_id);
    addressData = await axios
      .get<Address>(`${api}/address/${userData.barangay_id}`)
      .then((r) => r.data)
      .catch((err) => {
        console.warn("[AuthService] Address fetch failed", {
          barangay_id: userData.barangay_id,
          message: err?.message,
          status: err?.response?.status,
          data: err?.response?.data,
        });
        return null;
      });

    // Fetch address components if address exists
    if (addressData) {
      barangay = await axios
        .get<Barangay>(`${api}/address/barangay/${addressData.barangay_id}`)
        .then((r) => r.data)
        .catch(() => ({ barangay: "" } as Partial<Barangay>));

      municipality = await axios
        .get<Municipality>(
          `${api}/address/municipality/${addressData.municipality_id}`
        )
        .then((r) => r.data)
        .catch(() => ({ municipality: "" } as Partial<Municipality>));

      province = await axios
        .get<Province>(`${api}/address/province/${addressData.province_id}`)
        .then((r) => r.data)
        .catch(() => ({ province: "" } as Partial<Province>));
    }
  }

  // ============================================
  // STEP 7: Build Unified User Details Object
  // ============================================
  // Aggregate data from role-specific sources
  const roleData = ownerData || touristData || tourismData || staffData || {};

  const loggedInUser: UserDetails = {
    // Core identifiers
    id: roleData?.id || userData.id,
    user_id: userData.id || "",
    email,
    password,
    phone_number: userData.phone_number,
    user_role_id: userData.user_role_id,
    role_name: normalizedRoleName,
    description: userRole?.description || "",
    permissions: myPermissions,

    // Personal information (from role-specific data)
    first_name: roleData?.first_name || "",
    middle_name: roleData?.middle_name || "",
    last_name: roleData?.last_name || "",
    gender: (roleData as any)?.gender || "",
    birthdate: (roleData as any)?.birthdate || "",

    // Tourist-specific fields
    nationality: touristData?.nationality || "",
    ethnicity: touristData?.ethnicity || "",
    category: touristData?.category || "",

    // Staff-specific fields
    business_id: staffData?.business_id || "",

    // Address information
    barangay_id: userData?.barangay_id ?? "",
    barangay_name: barangay?.barangay || "",
    municipality_name: municipality?.municipality || "",
    province_name: province?.province || "",

    // Account metadata
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
  
  // Generate unique session ID for this login
  const sessionId = generateSessionId();
  
  // Set active session (overwrite any existing)
  setActiveSession(sessionId);
  
  // Start tracking tab activity
  startTabActivityTracking();
  
  // ============================================
  // STEP 9: Persist User Session Securely
  // ============================================
  // Save to localStorage (persistent) or sessionStorage (temporary) based on rememberMe
  const storage = rememberMe ? localStorage : sessionStorage;
  
  // Store token
  storage.setItem("token", token);
  storage.setItem("rememberMe", rememberMe.toString());
  storage.setItem("sessionId", sessionId);
  
  // Encrypt and store user data (obfuscated from casual inspection)
  const encryptedUser = encryptUserData(loggedInUser);
  storage.setItem("user", encryptedUser);
  
  // Clear opposite storage to avoid conflicts
  if (rememberMe) {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("rememberMe");
    sessionStorage.removeItem("sessionId");
  } else {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("sessionId");
  }

  console.debug("[AuthService] Login successful", {
    role: loggedInUser.role_name,
    user_id: loggedInUser.user_id,
    sessionId: sessionId,
  });

  return loggedInUser;
};

/**
 * LOGOUT USER
 * Clears all authentication data from both local and session storage
 * and notifies other tabs to sync logout state
 */
export const logoutUser = () => {
  console.debug("[AuthService] Logging out user");
  
  // Stop tab activity tracking
  stopTabActivityTracking();
  
  // Clear active session
  clearActiveSession();

  // Clear both storage types to ensure complete logout
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("rememberMe");
  sessionStorage.removeItem("sessionId");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("rememberMe");
  localStorage.removeItem("sessionId");
  localStorage.removeItem("selectedBusinessId");
  localStorage.removeItem("selectedRoomId");
  
  // Clear Authorization header
  delete axios.defaults.headers.common["Authorization"];

  // Notify other browser tabs to logout (cross-tab communication)
  localStorage.setItem("logout-event", Date.now().toString());

  console.debug("[AuthService] Logout complete");
};

/**
 * GET STORED USER
 * Retrieves and decrypts cached user details from storage
 * Checks localStorage first (remember me), then sessionStorage
 */
export const getStoredUser = (): UserDetails | null => {
  const encryptedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
  const token = getToken();
  
  if (!encryptedUser || !token) {
    return null;
  }
  
  // Decrypt user data
  const userData = decryptUserData(encryptedUser);
  
  if (!userData) {
    console.error('[AuthService] Failed to decrypt user data');
    return null;
  }
  
  return userData;
};

/**
 * GET STORED TOKEN
 * Retrieves cached authentication token from storage
 * Checks localStorage first (remember me), then sessionStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

/**
 * FETCH USER DATA
 * Retrieves basic user data by user ID
 * Used for profile updates and data refresh
 */
export const fetchUserData = async (user_id: string): Promise<User> => {
  console.debug("[AuthService] GET /users/:id", user_id);
  const { data } = await axios.get<User>(`${api}/users/${user_id}`);
  return data;
};

/**
 * START SESSION TRACKING
 * Export for use in AuthContext to track active session
 */
export const startSessionTracking = (): void => {
  startTabActivityTracking();
};

/**
 * STOP SESSION TRACKING
 * Export for use in AuthContext to stop tracking
 */
export const stopSessionTracking = (): void => {
  stopTabActivityTracking();
};
