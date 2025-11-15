import axios from "axios";

import api from "@/services/api";
import debugLogger from '@/utils/debugLogger';
import type {
  Address,
  Barangay,
  Municipality,
  Province,
} from "../types/Address";
import type { Owner } from "../types/Owner";
import type { Tourist } from "../types/Tourist";
import type { TokenPayload, User, UserDetails, UserRoles } from "../types/User";
import {
  saveToken,
  getToken,
  saveUserData,
  getUserData,
  clearAllAuthData,
  saveLastLogin,
  getLastLogin,
} from "@/utils/secureStorage";
import { handleNetworkError, formatErrorMessage } from "@/utils/networkHandler";

interface LoginResponse {
  token: string;
  refreshToken?: string;
}

interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
}

// Token refresh threshold - refresh 5 minutes before expiration
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Decode JWT token safely
 */
const decodeToken = (token: string): TokenPayload | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch (error) {
    console.error('[AuthService] Failed to decode token:', error);
    return null;
  }
};

/**
 * Check if token is expired or will expire soon
 */
export const isTokenExpired = (token: string, thresholdMs: number = 0): boolean => {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const expirationTime = payload.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  
  return currentTime >= (expirationTime - thresholdMs);
};

/**
 * Refresh authentication token
 * NOTE: This requires your backend to support a refresh token endpoint
 */
export const refreshAuthToken = async (): Promise<string | null> => {
  try {
    const currentToken = await getToken();
    if (!currentToken) {
      return null;
    }

    debugLogger({
      title: 'AuthService: Attempting token refresh',
      data: { hasToken: !!currentToken }
    });

    // Make refresh token request
    // NOTE: Adjust endpoint based on your backend implementation
    const { data } = await axios.post<RefreshTokenResponse>(
      `${api}/users/refresh-token`,
      { token: currentToken }
    ).catch((err) => {
      debugLogger({
        title: 'AuthService: Token refresh failed',
        error: {
          message: err?.message,
          status: err?.response?.status,
        },
        errorCode: err?.response?.status
      });
      throw err;
    });

    const { token: newToken } = data;
    
    // Save new token
    await saveToken(newToken);
    
    debugLogger({
      title: 'AuthService: Token refreshed successfully',
      data: { tokenReceived: !!newToken }
    });

    return newToken;
  } catch (error) {
    console.error('[AuthService] Token refresh error:', error);
    return null;
  }
};

/**
 * Check token validity and refresh if needed
 */
export const ensureValidToken = async (): Promise<string | null> => {
  try {
    const token = await getToken();
    if (!token) {
      return null;
    }

    // Check if token will expire soon
    if (isTokenExpired(token, TOKEN_REFRESH_THRESHOLD)) {
      debugLogger({
        title: 'AuthService: Token expiring soon, refreshing...',
      });
      
      const newToken = await refreshAuthToken();
      return newToken;
    }

    return token;
  } catch (error) {
    console.error('[AuthService] Token validation error:', error);
    return null;
  }
};

/** LOGIN */
export const loginUser = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    // Step 1: Login request
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
        
        // Throw user-friendly error
        const formattedError = handleNetworkError(err);
        const error = new Error(formattedError.message);
        (error as any).code = formattedError.code;
        (error as any).status = formattedError.status;
        throw error;
      });

    const { token } = data;
    debugLogger({
      title: 'AuthService: Received token',
      data: token ? '<redacted>' : null
    });

    // Step 2: Decode token safely
    const payload = decodeToken(token);
    if (!payload) {
      throw new Error("Invalid authentication token");
    }
    
    debugLogger({
      title: 'AuthService: Decoded token payload',
      data: payload
    });

    const user_id = payload.id;
    if (!user_id) throw new Error("User ID not found in token");

  // Step 3: Fetch user details
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

  // Step 4: Fetch role-specific user details
  const isTourist = userRole.role_name === 'Tourist';
  const isOwner = userRole.role_name === 'Owner' || userRole.role_name === 'Business Owner';
  
  let ownerData: Partial<Owner> = {};
  let ownerBarangay: Partial<Barangay> = {};
  let ownerMunicipality: Partial<Municipality> = {};
  let ownerProvince: Partial<Province> = {};
  
  let touristData: Partial<Tourist> = {};
  let touristBarangay: Partial<Barangay> = {};
  let touristMunicipality: Partial<Municipality> = {};
  let touristProvince: Partial<Province> = {};

  // Only fetch Owner data if user is an Owner
  if (isOwner) {
    debugLogger({
      title: 'AuthService: GET /owner/user/:user_id',
      data: user_id
    });
    const ownerResp = await axios
      .get<Owner>(`${api}/owner/user/${user_id}`)
      .catch((err) => {
        debugLogger({
          title: 'AuthService: Owner fetch failed',
          error: {
            user_id,
            message: err?.message,
            status: err?.response?.status,
          },
          errorCode: err?.response?.status
        });
        return { data: {} as Owner };
      });
    ownerData = ownerResp.data;
    debugLogger({
      title: 'AuthService: ownerData',
      data: ownerData
    });

    // Fetch owner address data if barangay_id exists
    if ((ownerData as any).barangay_id) {
      debugLogger({
        title: 'AuthService: Fetching address for owner',
        data: { barangay_id: (ownerData as any).barangay_id }
      });
      
      // Get full address in one call (includes barangay, municipality, province)
      const ownerAddressData = await axios
        .get<Address>(`${api}/address/${(ownerData as any).barangay_id}`)
        .then((r) => r.data)
        .catch((err) => {
          debugLogger({
            title: 'AuthService: Owner address fetch failed',
            error: {
              barangay_id: (ownerData as any).barangay_id,
              message: err?.message,
              status: err?.response?.status,
            },
            errorCode: err?.response?.status
          });
          return null;
        });

      if (ownerAddressData) {
        // Address endpoint returns full data already
        ownerBarangay = { 
          barangay_id: ownerAddressData.barangay_id,
          barangay: ownerAddressData.barangay_name || ''
        } as Barangay;
        
        ownerMunicipality = { 
          municipality_id: ownerAddressData.municipality_id,
          municipality: ownerAddressData.municipality_name || ''
        } as Municipality;
        
        ownerProvince = { 
          province_id: ownerAddressData.province_id,
          province: ownerAddressData.province_name || ''
        } as Province;

        debugLogger({
          title: 'AuthService: Owner address loaded',
          data: {
            barangay: ownerAddressData.barangay_name,
            municipality: ownerAddressData.municipality_name,
            province: ownerAddressData.province_name
          }
        });
      }
    }
  }

  // Only fetch Tourist data if user is a Tourist
  if (isTourist) {
    debugLogger({
      title: 'AuthService: GET /tourist/user/:user_id',
      data: user_id
    });
    const touristResp = await axios
      .get<Tourist>(`${api}/tourist/user/${user_id}`)
      .catch((err) => {
        debugLogger({
          title: 'AuthService: Tourist fetch failed',
          error: {
            user_id,
            message: err?.message,
            status: err?.response?.status,
          },
          errorCode: err?.response?.status
        });
        return { data: {} as Tourist };
      });
    touristData = touristResp.data;
    debugLogger({
      title: 'AuthService: touristData',
      data: touristData
    });

    // Fetch tourist address data - use userData.barangay_id, not touristData
    const touristBarangayId = userData.barangay_id || (touristData as any).barangay_id;
    if (touristBarangayId) {
      debugLogger({
        title: 'AuthService: Fetching address for tourist',
        data: { barangay_id: touristBarangayId }
      });
      
      // Get full address in one call (includes barangay, municipality, province)
      const touristAddressData = await axios
        .get<Address>(`${api}/address/${touristBarangayId}`)
        .then((r) => r.data)
        .catch((err) => {
          debugLogger({
            title: 'AuthService: Tourist address fetch failed',
            error: {
              barangay_id: touristBarangayId,
              message: err?.message,
              status: err?.response?.status,
            },
            errorCode: err?.response?.status
          });
          return null;
        });

      if (touristAddressData) {
        // Address endpoint returns full data already
        touristBarangay = { 
          barangay_id: touristAddressData.barangay_id,
          barangay: touristAddressData.barangay_name || ''
        } as Barangay;
        
        touristMunicipality = { 
          municipality_id: touristAddressData.municipality_id,
          municipality: touristAddressData.municipality_name || ''
        } as Municipality;
        
        touristProvince = { 
          province_id: touristAddressData.province_id,
          province: touristAddressData.province_name || ''
        } as Province;

        debugLogger({
          title: 'AuthService: Tourist address loaded',
          data: {
            barangay: touristAddressData.barangay_name,
            municipality: touristAddressData.municipality_name,
            province: touristAddressData.province_name
          }
        });
      }
    }
  }

  debugLogger({
    title: 'AuthService: Building user object',
    data: {
      hasOwner: !!ownerData.id,
      hasTourist: !!touristData.id,
      role: userRole.role_name
    }
  });

  // Step 4: Build user object
  const loggedInUser: UserDetails = {
    id:
      ownerData.id ||
      touristData.id,
    email,
    password,
    age: (touristData as any).age || ownerData.age || null,
    phone_number: userData.phone_number,
    role_name: (userRole as any)?.role_name,
    first_name:
      (ownerData as any).first_name ||
      (touristData as any).first_name ||
      "",
    middle_name:
      (ownerData as any).middle_name ||
      (touristData as any).middle_name ||
      "",
    last_name:
      (ownerData as any).last_name ||
      (touristData as any).last_name ||
      "",
    gender:
      (ownerData as any).gender ||
      (touristData as any).gender ||
      "",
    birthdate:
      (ownerData as any).birthdate ||
      (touristData as any).birthdate ||
      "",
    nationality: (touristData as any).nationality || "",
    ethnicity: (touristData as any).ethnicity || "",
    category: (touristData as any).category || "",
    user_profile: userData.user_profile,
    is_active: userData.is_active,
    is_verified: userData.is_verified,
    created_at: userData.created_at,
    updated_at: userData.updated_at,
    last_login: userData.last_login,
    user_role_id: userData.user_role_id,
    description: (userRole as any)?.description,
    barangay_id:
      (ownerData as any).barangay_id ||
      (touristData as any).barangay_id ||
      "",
    municipality_name:
      (ownerMunicipality as any).municipality ||
      (touristMunicipality as any).municipality ||
      "",
    barangay_name:
      (ownerBarangay as any).barangay ||
      (touristBarangay as any).barangay ||
      "",
    province_name:
      (ownerProvince as any).province ||
      (touristProvince as any).province ||
      "",
    user_id: userData.id || "",
  };

  // Save to Secure Storage
    await saveToken(token);
    await saveUserData(JSON.stringify(loggedInUser));
    await saveLastLogin();

    debugLogger({
      title: 'AuthService: ✅ Login successful',
      data: {
        user_id: loggedInUser.user_id,
        role: loggedInUser.role_name,
        name: `${loggedInUser.first_name} ${loggedInUser.last_name}`
      }
    });

    return loggedInUser;
  } catch (error) {
    debugLogger({
      title: 'AuthService: ❌ Login failed',
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

/** LOGOUT */
export const logoutUser = async (): Promise<void> => {
  try {
    debugLogger({
      title: 'AuthService: Logout started',
    });
    
    await clearAllAuthData();
    
    debugLogger({
      title: 'AuthService: ✅ Logout successful',
    });
  } catch (error) {
    console.error('[AuthService] Logout error:', error);
    // Still clear data even if there's an error
    await clearAllAuthData();
  }
};

/** Get Stored User */
export const getStoredUser = async (): Promise<User | null> => {
  try {
    const storedUserData = await getUserData();
    if (!storedUserData) {
      return null;
    }
    
    const user = JSON.parse(storedUserData);
    
    debugLogger({
      title: 'AuthService: Retrieved stored user',
      data: {
        user_id: user?.user_id,
        role: user?.role_name,
      }
    });
    
    return user;
  } catch (error) {
    console.error('[AuthService] Failed to get stored user:', error);
    return null;
  }
};

/** Check session validity */
export const isSessionValid = async (): Promise<boolean> => {
  try {
    const lastLogin = await getLastLogin();
    if (!lastLogin) {
      return false;
    }

    const lastLoginTime = new Date(lastLogin).getTime();
    const currentTime = Date.now();
    const sessionTimeout = 30 * 60 * 1000; // 30 minutes

    return (currentTime - lastLoginTime) < sessionTimeout;
  } catch (error) {
    console.error('[AuthService] Session validity check failed:', error);
    return false;
  }
};