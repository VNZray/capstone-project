import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";

import api from "@/services/api";
import debugLogger from '@/utils/debugLogger';
import type {
  Address,
  Barangay,
  Municipality,
  Province,
} from "../types/Address";
import type { Tourist } from "../types/Tourist";
import type { TokenPayload, User, UserDetails, UserRoles } from "../types/User";

interface LoginResponse {
  token: string;
}

/**
 * ENCRYPTION UTILITIES
 * Simple encryption for user data in AsyncStorage
 * Using btoa/atob for React Native compatibility
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
    console.error('[AuthService] Failed to decrypt user data:', error);
    return null;
  }
};

/**
 * LOGIN USER
 * Authenticates user credentials and retrieves complete user profile
 * based on their role (Tourist, Owner, Tourism Officer, Staff)
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<UserDetails> => {
  // ============================================
  // STEP 1: Authenticate User & Get Token
  // ============================================
  debugLogger({
    title: 'AuthService: POST /users/login',
    data: { email }
  });
  const { data } = await axios
    .post<LoginResponse>(`${api}/users/login`, {
      email,
      password,
    })
    .catch((err) => {
      debugLogger({
        title: 'AuthService: Login request failed',
        error: {
          message: err?.message,
          status: err?.response?.status,
          data: err?.response?.data,
        },
        errorCode: err?.response?.status
      });
      throw err;
    });

  const { token } = data;
  debugLogger({
    title: 'AuthService: Received token',
    data: token ? '<redacted>' : null
  });

  // Set Authorization header for subsequent requests (required for RBAC)
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  // ============================================
  // STEP 2: Decode & Validate Token
  // ============================================
  let payload: TokenPayload;
  try {
    payload = JSON.parse(atob(token.split(".")[1]));
    debugLogger({
      title: 'AuthService: Decoded token payload',
      data: payload
    });
  } catch {
    throw new Error("Invalid authentication token");
  }

  const user_id = payload.id;
  if (!user_id) throw new Error("User ID not found in token");

  // ============================================
  // STEP 3: Fetch Core User Data
  // ============================================
  debugLogger({
    title: 'AuthService: GET /users/:id',
    data: user_id
  });
  const { data: userData } = await axios
    .get<User>(`${api}/users/${user_id}`)
    .catch((err) => {
      debugLogger({
        title: 'AuthService: Fetch user failed',
        error: {
          user_id,
          message: err?.message,
          status: err?.response?.status,
          data: err?.response?.data,
        },
        errorCode: err?.response?.status
      });
      throw err;
    });
  debugLogger({
    title: 'AuthService: userData',
    data: userData
  });

  // ============================================
  // STEP 4: Fetch User Role & Permissions
  // ============================================
  debugLogger({
    title: 'AuthService: GET /user-roles/:id',
    data: userData.user_role_id
  });
  const { data: userRole } = await axios
    .get<UserRoles>(`${api}/user-roles/${userData.user_role_id}`)
    .catch((err) => {
      debugLogger({
        title: 'AuthService: Fetch role by id failed',
        error: {
          user_role_id: userData.user_role_id,
          message: err?.message,
          status: err?.response?.status,
          data: err?.response?.data,
        },
        errorCode: err?.response?.status
      });
      throw err;
    });
  debugLogger({
    title: 'AuthService: userRole',
    data: userRole
  });

  // Fetch user permissions for RBAC (Role-Based Access Control)
  debugLogger({
    title: 'AuthService: GET /permissions/me'
  });
  const myPermissions: string[] = await axios
    .get<{ permissions: string[] }>(`${api}/permissions/me`)
    .then((r) => r.data?.permissions || [])
    .catch((err) => {
      debugLogger({
        title: 'AuthService: Permissions fetch failed',
        error: err?.response?.status
      });
      return [];
    });

  // Normalize role name for consistent UI usage
  const rawRoleName = (userRole?.role_name ?? "").toString();
  const normalizedRoleName = (() => {
    const lower = rawRoleName.toLowerCase();
    if (lower === "tourist") return "Tourist";
    return rawRoleName;
  })();

  // ============================================
  // STEP 5: Validate Role & Fetch Tourist Data
  // ============================================
  // Mobile app only supports Tourist role
  if (normalizedRoleName !== "Tourist") {
    debugLogger({
      title: 'AuthService: Access Denied',
      error: `Role "${normalizedRoleName}" is not allowed in mobile app`
    });
    throw new Error("Access Denied: This app is only for tourists.");
  }

  // Fetch tourist data
  debugLogger({
    title: 'AuthService: GET /tourist/user/:user_id',
    data: user_id
  });
  const touristData = await axios
    .get<Tourist>(`${api}/tourist/user/${user_id}`)
    .then((r) => r.data)
    .catch((err) => {
      debugLogger({
        title: 'AuthService: Tourist fetch failed',
        error: err?.response?.status
      });
      throw new Error("Failed to fetch tourist profile");
    });

  // ============================================
  // STEP 6: Fetch Address Details
  // ============================================
  let addressData: Address | null = null;
  let barangay: Partial<Barangay> = {};
  let municipality: Partial<Municipality> = {};
  let province: Partial<Province> = {};

  if (userData?.barangay_id != null) {
    debugLogger({
      title: 'AuthService: GET /address/:id',
      data: userData.barangay_id
    });
    addressData = await axios
      .get<Address>(`${api}/address/${userData.barangay_id}`)
      .then((r) => r.data)
      .catch((err) => {
        debugLogger({
          title: 'AuthService: Address fetch failed',
          error: err?.response?.status
        });
        return null;
      });

    if (addressData) {
      barangay = await axios
        .get<Barangay>(`${api}/barangay/${addressData.barangay_id}`)
        .then((r) => r.data)
        .catch(() => ({ barangay: "" } as Barangay));

      municipality = await axios
        .get<Municipality>(`${api}/municipality/${addressData.municipality_id}`)
        .then((r) => r.data)
        .catch(() => ({ municipality: "" } as Municipality));

      province = await axios
        .get<Province>(`${api}/province/${addressData.province_id}`)
        .then((r) => r.data)
        .catch(() => ({ province: "" } as Province));
    }
  }

  // ============================================
  // STEP 7: Build Tourist User Details Object
  // ============================================
  const loggedInUser: UserDetails = {
    // IDs
    id: touristData?.id || userData.id,
    user_id: userData.id || "",
    email,
    password,
    phone_number: userData.phone_number,
    user_role_id: userData.user_role_id,
    role_name: normalizedRoleName,
    description: userRole?.description || "",
    permissions: myPermissions,
    // Personal Info
    first_name: touristData?.first_name || "",
    middle_name: touristData?.middle_name || "",
    last_name: touristData?.last_name || "",
    gender: touristData?.gender || "",
    birthdate: touristData?.birthdate || "",
    age: (touristData as any)?.age || null,
    // Tourist-specific
    nationality: touristData?.nationality || "",
    ethnicity: touristData?.ethnicity || "",
    category: (touristData as any)?.category || "",
    // Staff-specific (not used in mobile)
    business_id: "",
    // Address
    barangay_id: userData?.barangay_id ?? "",
    barangay_name: barangay?.barangay || "",
    municipality_name: municipality?.municipality || "",
    province_name: province?.province || "",
    // Account Status
    user_profile: userData.user_profile,
    is_active: Boolean(userData.is_active),
    is_verified: Boolean(userData.is_verified),
    created_at: userData.created_at || "",
    updated_at: userData.updated_at || "",
    last_login: userData.last_login || "",
  };

  // ============================================
  // STEP 8: Store Auth Data (Encrypted)
  // ============================================
  await AsyncStorage.setItem('token', token);
  
  // Encrypt user data before storing
  const encryptedUser = encryptUserData(loggedInUser);
  await AsyncStorage.setItem('user', encryptedUser);

  debugLogger({
    title: 'AuthService: Login successful',
    data: { user_id: loggedInUser.user_id, role: loggedInUser.role_name }
  });

  return loggedInUser;
};

/**
 * LOGOUT USER
 * Clears all authentication data from AsyncStorage
 */
export const logoutUser = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
  
  // Clear Authorization header
  delete axios.defaults.headers.common["Authorization"];
  
  debugLogger({
    title: 'AuthService: Logout successful'
  });
};

/**
 * GET STORED USER
 * Retrieves and decrypts cached user details from AsyncStorage
 */
export const getStoredUser = async (): Promise<UserDetails | null> => {
  const encryptedUser = await AsyncStorage.getItem('user');
  if (!encryptedUser) return null;
  
  // Try to decrypt user data
  const user = decryptUserData(encryptedUser);
  if (!user) {
    // If decryption fails, try parsing as plain JSON (backward compatibility)
    try {
      return JSON.parse(encryptedUser);
    } catch {
      return null;
    }
  }
  
  return user;
};

/**
 * GET STORED TOKEN
 * Retrieves cached authentication token from AsyncStorage
 */
export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('token');
};

/**
 * FETCH USER DATA
 * Retrieves basic user data by user ID
 * Used for profile updates and data refresh
 */
export const fetchUserData = async (user_id: string): Promise<User> => {
  const { data } = await axios.get<User>(`${api}/users/${user_id}`);
  return data;
};