import apiClient, { setAccessToken, clearApiClientState } from './apiClient';
import debugLogger from '@/utils/debugLogger';
import type {
  Address,
  Barangay,
  Municipality,
  Province,
} from '../types/Address';
import type { Owner } from '../types/Owner';
import type { Tourist } from '../types/Tourist';
import type { TokenPayload, User, UserDetails, UserRoles } from '../types/User';
import {
  saveRefreshToken,
  getRefreshToken,
  saveUserData,
  getUserData,
  clearAllAuthData,
  saveLastLogin,
  getLastLogin,
} from '@/utils/secureStorage';
import { handleNetworkError } from '@/utils/networkHandler';

interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: any; // minimal user from login
}

/**
 * Decode JWT token safely
 */
const decodeToken = (token: string): TokenPayload | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('[AuthService] Failed to decode token:', error);
    return null;
  }
};

/** LOGIN */
export const loginUser = async (
  email: string,
  password: string
): Promise<UserDetails> => {
  try {
    // Step 1: Login request
    debugLogger({
      title: 'AuthService: POST /auth/login',
      data: { email, client: 'mobile' },
    });

    const { data } = await apiClient
      .post<LoginResponse>(`/auth/login`, {
        email,
        password,
        client: 'mobile',
      })
      .catch((err) => {
        debugLogger({
          title: 'AuthService: Login request failed',
          error: {
            message: err?.message,
            status: err?.response?.status,
            data: err?.response?.data,
          },
          errorCode: err?.response?.status,
        });

        const formattedError = handleNetworkError(err);
        const error = new Error(formattedError.message);
        (error as any).code = formattedError.code;
        (error as any).status = formattedError.status;
        throw error;
      });

    const { accessToken, refreshToken, user: loginUserSummary } = data;

    debugLogger({
      title: 'AuthService: Received tokens',
      data: {
        accessToken: accessToken ? 'present' : 'missing',
        refreshToken: refreshToken ? 'present' : 'missing',
        loginUserSummary: loginUserSummary ? JSON.stringify(loginUserSummary) : 'missing',
      },
    });

    // Validate tokens are present
    if (!accessToken || !refreshToken) {
      throw new Error('Login response missing tokens');
    }

    // Store tokens - MUST happen before any subsequent API calls
    setAccessToken(accessToken);
    await saveRefreshToken(refreshToken);

    // Validate user ID from login response
    const user_id = loginUserSummary?.id;
    
    if (!user_id) {
      debugLogger({
        title: 'AuthService: ❌ Login response missing user ID',
        error: {
          loginUserSummary,
          keys: loginUserSummary ? Object.keys(loginUserSummary) : [],
        },
        errorCode: 'MISSING_USER_ID',
      });
      throw new Error('Login response missing user ID - please contact support');
    }

    debugLogger({
      title: 'AuthService: User ID validated',
      data: { 
        user_id, 
        user_id_type: typeof user_id,
        user_id_length: typeof user_id === 'string' ? user_id.length : 'N/A',
      },
    });

    // Step 3: Fetch user details
    debugLogger({
      title: 'AuthService: GET /users/:id',
      data: user_id,
    });
    const { data: userData } = await apiClient
      .get<User>(`/users/${user_id}`)
      .catch((err) => {
        debugLogger({
          title: 'AuthService: Fetch user failed',
          error: {
            user_id,
            message: err?.message,
            status: err?.response?.status,
            responseData: err?.response?.data,
          },
          errorCode: err?.response?.status,
        });
        
        // Provide more helpful error message for 404
        if (err?.response?.status === 404) {
          const error = new Error(`User account not found. Please try logging in again or contact support.`);
          (error as any).code = 'USER_NOT_FOUND';
          (error as any).status = 404;
          throw error;
        }
        
        throw err;
      });

    const { data: userRole } = await apiClient.get<UserRoles>(
      `/user-roles/${userData.user_role_id}`
    );

    // Step 4: Fetch role-specific user details
    const isTourist = userRole.role_name === 'Tourist';
    const isOwner =
      userRole.role_name === 'Owner' || userRole.role_name === 'Business Owner';

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
      const ownerResp = await apiClient
        .get<Owner>(`/owner/user/${user_id}`)
        .catch(() => ({ data: {} as Owner }));
      ownerData = ownerResp.data;

      if ((ownerData as any).barangay_id) {
        const ownerAddressData = await apiClient
          .get<Address>(`/address/${(ownerData as any).barangay_id}`)
          .then((r) => r.data)
          .catch(() => null);

        if (ownerAddressData) {
          ownerBarangay = {
            id: ownerAddressData.barangay_id,
            barangay_id: ownerAddressData.barangay_id,
            municipality_id: ownerAddressData.municipality_id,
            barangay: ownerAddressData.barangay_name || '',
          } as Barangay;

          ownerMunicipality = {
            id: ownerAddressData.municipality_id,
            municipality_id: ownerAddressData.municipality_id,
            province_id: ownerAddressData.province_id,
            municipality: ownerAddressData.municipality_name || '',
          } as Municipality;

          ownerProvince = {
            id: ownerAddressData.province_id,
            province: ownerAddressData.province_name || '',
          } as Province;
        }
      }
    }

    // Only fetch Tourist data if user is a Tourist
    if (isTourist) {
      const touristResp = await apiClient
        .get<Tourist>(`/tourist/user/${user_id}`)
        .catch(() => ({ data: {} as Tourist }));
      touristData = touristResp.data;

      const touristBarangayId =
        userData.barangay_id || (touristData as any).barangay_id;
      if (touristBarangayId) {
        const touristAddressData = await apiClient
          .get<Address>(`/address/${touristBarangayId}`)
          .then((r) => r.data)
          .catch(() => null);

        if (touristAddressData) {
          touristBarangay = {
            id: touristAddressData.barangay_id,
            barangay_id: touristAddressData.barangay_id,
            municipality_id: touristAddressData.municipality_id,
            barangay: touristAddressData.barangay_name || '',
          } as Barangay;

          touristMunicipality = {
            id: touristAddressData.municipality_id,
            municipality_id: touristAddressData.municipality_id,
            province_id: touristAddressData.province_id,
            municipality: touristAddressData.municipality_name || '',
          } as Municipality;

          touristProvince = {
            id: touristAddressData.province_id,
            province: touristAddressData.province_name || '',
          } as Province;
        }
      }
    }

    // Step 4: Build user object
    const loggedInUser: UserDetails = {
      id: ownerData.id || touristData.id,
      email,
      // SECURITY: password intentionally omitted - never store passwords in client state
      age: (touristData as any).age || ownerData.age || null,
      phone_number: userData.phone_number,
      role_name: (userRole as any)?.role_name,
      first_name:
        (ownerData as any).first_name || (touristData as any).first_name || '',
      middle_name:
        (ownerData as any).middle_name ||
        (touristData as any).middle_name ||
        '',
      last_name:
        (ownerData as any).last_name || (touristData as any).last_name || '',
      gender: (ownerData as any).gender || (touristData as any).gender || '',
      birthdate:
        (ownerData as any).birthdate || (touristData as any).birthdate || '',
      nationality: (touristData as any).nationality || '',
      ethnicity: (touristData as any).ethnicity || '',
      category: (touristData as any).category || '',
      user_profile: userData.user_profile,
      is_active: userData.is_active!,
      is_verified: userData.is_verified!,
      created_at: userData.created_at!,
      updated_at: userData.updated_at!,
      last_login: userData.last_login,
      user_role_id: userData.user_role_id,
      description: (userRole as any)?.description,
      barangay_id:
        (ownerData as any).barangay_id ||
        (touristData as any).barangay_id ||
        '',
      municipality_name:
        (ownerMunicipality as any).municipality ||
        (touristMunicipality as any).municipality ||
        '',
      barangay_name:
        (ownerBarangay as any).barangay ||
        (touristBarangay as any).barangay ||
        '',
      province_name:
        (ownerProvince as any).province ||
        (touristProvince as any).province ||
        '',
      user_id: userData.id || '',
    };

    // Save to Secure Storage
    await saveUserData(JSON.stringify(loggedInUser));
    await saveLastLogin();

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
      title: 'AuthService: Logout - clearing all auth state',
    });

    // IMPORTANT: Clear API client state FIRST to invalidate any in-flight operations
    // This increments the sessionId, causing any pending refresh operations to abort
    clearApiClientState();

    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      // Attempt server-side logout (non-blocking - don't wait for response)
      apiClient.post('/auth/logout', { refreshToken }).catch((err) => {
        debugLogger({
          title: 'AuthService: Server logout failed (non-critical)',
          error: err?.message || 'Unknown error',
        });
      });
    }

    // Clear all stored auth data
    await clearAllAuthData();

    debugLogger({
      title: 'AuthService: ✅ Logout successful - all state cleared',
    });
  } catch (error) {
    console.error('[AuthService] Logout error:', error);
    // Even if logout fails, ensure local state is cleared
    clearApiClientState();
    await clearAllAuthData();
  }
};

/** Get Stored User */
export const getStoredUser = async (): Promise<UserDetails | null> => {
  try {
    const storedUserData = await getUserData();
    if (!storedUserData) {
      return null;
    }
    return JSON.parse(storedUserData);
  } catch (error) {
    console.error('[AuthService] Failed to get stored user:', error);
    return null;
  }
};

/** Check session validity */
export const isSessionValid = async (): Promise<boolean> => {
  // Simplified check - if we have refresh token, we assume valid until proven otherwise
  // Actual validity is enforced by apiClient interceptors
  const refreshToken = await getRefreshToken();
  return !!refreshToken;
};

// Singleton promise to prevent concurrent initializeAuth calls
let initPromise: Promise<boolean> | null = null;

// Export helper for initialization
export const initializeAuth = async (): Promise<boolean> => {
  // If initialization is already in progress, return the existing promise
  if (initPromise) {
    debugLogger({
      title: 'AuthService: initializeAuth - returning existing promise',
    });
    return initPromise;
  }

  initPromise = (async () => {
    try {
      debugLogger({
        title: 'AuthService: initializeAuth - starting',
      });

      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        debugLogger({
          title: 'AuthService: initializeAuth - no refresh token found',
        });
        return false;
      }

      // Optimistically try to refresh access token on startup
      const res = await apiClient.post(`/auth/refresh`, { refreshToken });

      setAccessToken(res.data.accessToken);

      if (res.data.refreshToken) {
        await saveRefreshToken(res.data.refreshToken);
      }

      debugLogger({
        title: 'AuthService: initializeAuth - session restored successfully',
      });
      return true;
    } catch (e) {
      debugLogger({
        title: 'AuthService: initializeAuth - failed to restore session',
        error: e instanceof Error ? e.message : String(e),
      });
      // Failed to refresh -> clear state and return false
      clearApiClientState();
      await clearAllAuthData();
      return false;
    }
  })();

  try {
    return await initPromise;
  } finally {
    // Clear the promise so subsequent calls (e.g. after manual logout/login) can run fresh
    initPromise = null;
  }
};
