import apiClient, { setAccessToken, refreshTokens } from "../apiClient";

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
 * ENCRYPTION UTILITIES - REMOVED (Insecure)
 */

/**
 * SESSION MANAGEMENT
 */
const SESSION_KEY = "active_session_id";
const ACTIVE_TAB_KEY = "active_tab_timestamp";

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
      client: "web",
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
  console.debug(
    "[AuthService] Received access token",
    accessToken ? "<redacted>" : null
  );

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
    .catch(() => {
      // Fallback logic preserved...
      const id = userData.user_role_id;
      const fallbackRoleName =
        id === 1 ? "Admin" : id === 4 ? "Owner" : "Tourist"; // Simplified for brevity
      return {
        data: { role_name: fallbackRoleName, description: "", role_type: 'system' as const } as UserRoles,
      };
    });

  const myPermissions: string[] = await apiClient
    .get<{ permissions: string[] }>(`/permissions/me`)
    .then((r) => r.data?.permissions || [])
    .catch(() => []);

  // Get role metadata for proper categorization
  const roleType = userRole?.role_type || 'system';
  const roleFor = userRole?.role_for || null;
  const isCustomRole = userRole?.is_custom || false;
  const rawRoleName = (userRole?.role_name ?? "").toString();

  // Normalize role name - preserve custom role names, normalize known system roles
  const normalizedRoleName = (() => {
    const r = rawRoleName.toLowerCase();
    
    // System roles get normalized to standard names
    if (r.includes("tourism head")) return "Tourism Head";
    if (r.includes("tourism officer")) return "Tourism Officer";
    if (r.includes("admin")) return "Admin";
    if (r.includes("event coordinator")) return "Event Coordinator";
    if (r.includes("owner")) return "Business Owner";
    if (r.includes("manager") && !r.includes("room")) return "Manager";
    if (r.includes("room manager")) return "Room Manager";
    if (r.includes("receptionist")) return "Receptionist";
    if (r.includes("sales associate")) return "Sales Associate";
    if (r.includes("tourist")) return "Tourist";
    
    // For business/custom roles, keep the original name
    // These are custom roles created by business owners
    if (roleType === 'business') {
      return rawRoleName; // Keep original custom role name
    }
    
    // Unknown system roles default to Tourist
    return "Tourist";
  })();

  // ============================================
  // STEP 5: Fetch Role-Specific User Details
  // ============================================
  // RBAC: Role categorization is now data-driven using role_type
  // - Business roles (role_type === 'business') are always staff roles
  // - System roles use hardcoded categorization for backwards compatibility
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

  // Determine role category based on role_type first, then fallback to name matching
  const isBusinessRole = roleType === 'business';
  const isStaffRole = isBusinessRole || staffRoles.includes(normalizedRoleName);
  const isOwnerRole = !isBusinessRole && ownerRoles.includes(normalizedRoleName);
  const isTourismRole = !isBusinessRole && tourismRoles.includes(normalizedRoleName);
  const isTouristRole = !isBusinessRole && !isStaffRole && !isOwnerRole && !isTourismRole;

  let ownerData: Partial<Owner> | null = null;
  let touristData: Partial<Tourist> | null = null;
  let tourismData: Partial<Tourism> | null = null;
  let staffData: Partial<Staff> | null = null;

  if (isOwnerRole) {
    ownerData = await apiClient
      .get<Owner>(`/owner/user/${user_id}`)
      .then((r) => r.data)
      .catch(() => null);
  } else if (isTouristRole) {
    touristData = await apiClient
      .get<Tourist>(`/tourist/user/${user_id}`)
      .then((r) => r.data)
      .catch(() => null);
  } else if (isTourismRole) {
    tourismData = await apiClient
      .get<Tourism>(`/tourism/user/${user_id}`)
      .then((r) => r.data)
      .catch(() => null);
  } else if (isStaffRole) {
    staffData = await apiClient
      .get<Staff>(`/staff/user/${user_id}`)
      .then((r) => r.data)
      .catch(() => null);
  }

  // ============================================
  // STEP 6: Fetch Address Details
  // ============================================
  let addressData: Address | null = null;
  let barangay: Partial<Barangay> = {};
  let municipality: Partial<Municipality> = {};
  let province: Partial<Province> = {};

  if (userData?.barangay_id != null) {
    addressData = await apiClient
      .get<Address>(`/address/${userData.barangay_id}`)
      .then((r) => r.data)
      .catch(() => null);
    if (addressData) {
      barangay = await apiClient
        .get<Barangay>(`/address/barangay/${addressData.barangay_id}`)
        .then((r) => r.data)
        .catch(() => ({}));
      municipality = await apiClient
        .get<Municipality>(
          `/address/municipality/${addressData.municipality_id}`
        )
        .then((r) => r.data)
        .catch(() => ({}));
      province = await apiClient
        .get<Province>(`/address/province/${addressData.province_id}`)
        .then((r) => r.data)
        .catch(() => ({}));
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
    // SECURITY: password intentionally omitted - never store plaintext passwords in client state
    phone_number: userData.phone_number,
    user_role_id: userData.user_role_id,
    role_name: normalizedRoleName,
    description: userRole?.description || userRole?.role_description || "",
    permissions: myPermissions,
    // RBAC: Include role metadata for proper access control
    role_type: roleType,
    role_for: roleFor,
    is_custom_role: isCustomRole || roleType === 'business',
    first_name: roleData?.first_name || "",
    middle_name: roleData?.middle_name || "",
    last_name: roleData?.last_name || "",
    gender: (roleData as any)?.gender || "",
    birthdate: (roleData as any)?.birthdate || "",
    nationality: (touristData as any)?.nationality || "",
    ethnicity: (touristData as any)?.ethnicity || "",
    category: (touristData as any)?.category || "",
    business_id: (staffData as any)?.business_id || roleFor || "",
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
    // Staff onboarding flags from login response
    must_change_password: loginUserSummary?.must_change_password || false,
    profile_completed: loginUserSummary?.profile_completed !== false,
  };

  // ============================================
  // STEP 8: Session & Security Management
  // ============================================
  const sessionId = generateSessionId();
  setActiveSession(sessionId);
  startTabActivityTracking();

  // Save session metadata only
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem("rememberMe", rememberMe.toString());
  storage.setItem("sessionId", sessionId);

  // Notify other tabs of login
  localStorage.setItem("login-event", Date.now().toString());

  // Clean up other storage
  const otherStorage = rememberMe ? sessionStorage : localStorage;
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
    await apiClient.post("/auth/logout");
  } catch (e) {
    console.warn("Logout call failed", e);
  }

  setAccessToken(null);

  stopTabActivityTracking();
  clearActiveSession();

  sessionStorage.removeItem("rememberMe");
  sessionStorage.removeItem("sessionId");
  localStorage.removeItem("rememberMe");
  localStorage.removeItem("sessionId");
  localStorage.removeItem("selectedBusinessId");
  localStorage.removeItem("selectedRoomId");

  localStorage.setItem("logout-event", Date.now().toString());
};

/**
 * FETCH CURRENT USER (New Method)
 * Fetches the current user profile from the API.
 * Used for re-hydrating the session on page reload.
 */
export const fetchCurrentUser = async (): Promise<UserDetails> => {
  // Get the token from the apiClient (it should be set by initializeAuth)
  const { getAccessToken } = await import("../apiClient");
  const token = getAccessToken();

  if (!token) throw new Error("No access token available");

  // ============================================
  // STEP 1: Decode Token
  // ============================================
  let payload: TokenPayload;
  try {
    payload = JSON.parse(atob(token.split(".")[1]));
  } catch {
    throw new Error("Invalid authentication token");
  }

  const user_id = payload.id;
  if (!user_id) throw new Error("User ID not found in token");

  // ============================================
  // STEP 2: Fetch Core User Data
  // ============================================
  const { data: userData } = await apiClient.get<User>(`/users/${user_id}`);

  // ============================================
  // STEP 3: Fetch User Role & Permissions
  // ============================================
  const { data: userRole } = await apiClient
    .get<UserRoles>(`/user-roles/${userData.user_role_id}`)
    .catch(() => {
      const id = userData.user_role_id;
      const fallbackRoleName =
        id === 1 ? "Admin" : id === 4 ? "Owner" : "Tourist";
      return {
        data: { role_name: fallbackRoleName, description: "", role_type: 'system' as const } as UserRoles,
      };
    });

  const myPermissions: string[] = await apiClient
    .get<{ permissions: string[] }>(`/permissions/me`)
    .then((r) => r.data?.permissions || [])
    .catch(() => []);

  // Get role metadata for proper categorization
  const roleType = userRole?.role_type || 'system';
  const roleFor = userRole?.role_for || null;
  const isCustomRole = userRole?.is_custom || false;
  const rawRoleName = (userRole?.role_name ?? "").toString();

  // Normalize role name - preserve custom role names, normalize known system roles
  const normalizedRoleName = (() => {
    const r = rawRoleName.toLowerCase();
    
    // System roles get normalized to standard names
    if (r.includes("tourism head")) return "Tourism Head";
    if (r.includes("tourism officer")) return "Tourism Officer";
    if (r.includes("admin")) return "Admin";
    if (r.includes("event coordinator")) return "Event Coordinator";
    if (r.includes("owner")) return "Business Owner";
    if (r.includes("manager") && !r.includes("room")) return "Manager";
    if (r.includes("room manager")) return "Room Manager";
    if (r.includes("receptionist")) return "Receptionist";
    if (r.includes("sales associate")) return "Sales Associate";
    if (r.includes("tourist")) return "Tourist";
    
    // For business/custom roles, keep the original name
    // These are custom roles created by business owners
    if (roleType === 'business') {
      return rawRoleName; // Keep original custom role name
    }
    
    // Unknown system roles default to Tourist
    return "Tourist";
  })();

  // ============================================
  // STEP 4: Fetch Role-Specific User Details
  // ============================================
  // RBAC: Role categorization is now data-driven using role_type
  // - Business roles (role_type === 'business') are always staff roles
  // - System roles use hardcoded categorization for backwards compatibility
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

  // Determine role category based on role_type first, then fallback to name matching
  const isBusinessRole = roleType === 'business';
  const isStaffRole = isBusinessRole || staffRoles.includes(normalizedRoleName);
  const isOwnerRole = !isBusinessRole && ownerRoles.includes(normalizedRoleName);
  const isTourismRole = !isBusinessRole && tourismRoles.includes(normalizedRoleName);
  const isTouristRole = !isBusinessRole && !isStaffRole && !isOwnerRole && !isTourismRole;

  let ownerData: Partial<Owner> | null = null;
  let touristData: Partial<Tourist> | null = null;
  let tourismData: Partial<Tourism> | null = null;
  let staffData: Partial<Staff> | null = null;

  if (isOwnerRole) {
    ownerData = await apiClient
      .get<Owner>(`/owner/user/${user_id}`)
      .then((r) => r.data)
      .catch(() => null);
  } else if (isTouristRole) {
    touristData = await apiClient
      .get<Tourist>(`/tourist/user/${user_id}`)
      .then((r) => r.data)
      .catch(() => null);
  } else if (isTourismRole) {
    tourismData = await apiClient
      .get<Tourism>(`/tourism/user/${user_id}`)
      .then((r) => r.data)
      .catch(() => null);
  } else if (isStaffRole) {
    staffData = await apiClient
      .get<Staff>(`/staff/user/${user_id}`)
      .then((r) => r.data)
      .catch(() => null);
  }

  // ============================================
  // STEP 5: Fetch Address Details
  // ============================================
  let addressData: Address | null = null;
  let barangay: Partial<Barangay> = {};
  let municipality: Partial<Municipality> = {};
  let province: Partial<Province> = {};

  if (userData?.barangay_id != null) {
    addressData = await apiClient
      .get<Address>(`/address/${userData.barangay_id}`)
      .then((r) => r.data)
      .catch(() => null);
    if (addressData) {
      barangay = await apiClient
        .get<Barangay>(`/address/barangay/${addressData.barangay_id}`)
        .then((r) => r.data)
        .catch(() => ({}));
      municipality = await apiClient
        .get<Municipality>(
          `/address/municipality/${addressData.municipality_id}`
        )
        .then((r) => r.data)
        .catch(() => ({}));
      province = await apiClient
        .get<Province>(`/address/province/${addressData.province_id}`)
        .then((r) => r.data)
        .catch(() => ({}));
    }
  }

  // ============================================
  // STEP 6: Build Unified User Details Object
  // ============================================
  const roleData = ownerData || touristData || tourismData || staffData || {};

  return {
    id: roleData?.id || userData.id,
    user_id: userData.id || "",
    email: userData.email || "",
    // SECURITY: password intentionally omitted - never store plaintext passwords in client state
    phone_number: userData.phone_number,
    user_role_id: userData.user_role_id,
    role_name: normalizedRoleName,
    description: userRole?.description || userRole?.role_description || "",
    permissions: myPermissions,
    // RBAC: Include role metadata for proper access control
    role_type: roleType,
    role_for: roleFor,
    is_custom_role: isCustomRole || roleType === 'business',
    first_name: roleData?.first_name || "",
    middle_name: roleData?.middle_name || "",
    last_name: roleData?.last_name || "",
    gender: (roleData as any)?.gender || "",
    birthdate: (roleData as any)?.birthdate || "",
    nationality: (touristData as any)?.nationality || "",
    ethnicity: (touristData as any)?.ethnicity || "",
    category: (touristData as any)?.category || "",
    business_id: (staffData as any)?.business_id || roleFor || "",
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
};

// Initialize Auth (Try refresh) - Uses centralized refresh with lock
export const initializeAuth = async (): Promise<boolean> => {
  try {
    const accessToken = await refreshTokens();
    return accessToken !== null;
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

/**
 * CHANGE PASSWORD (First Login Flow)
 * Called when must_change_password is true
 * Clears the must_change_password flag on success
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = await apiClient.post(`/users/change-password`, {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return { success: true, message: data.message || "Password changed successfully" };
  } catch (error: any) {
    const message = error?.response?.data?.message || "Failed to change password";
    return { success: false, message };
  }
};

/**
 * COMPLETE STAFF PROFILE
 * Called after password change to mark profile as completed
 */
export const completeStaffProfile = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = await apiClient.post(`/users/complete-profile`);
    return { success: true, message: data.message || "Profile completed successfully" };
  } catch (error: any) {
    const message = error?.response?.data?.message || "Failed to complete profile";
    return { success: false, message };
  }
};
