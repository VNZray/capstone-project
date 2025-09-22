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
import type { Owner } from "../types/Owner";
import type { Tourist } from "../types/Tourist";
import type { TokenPayload, User, UserDetails, UserRoles } from "../types/User";
interface LoginResponse {
  token: string;
}

/** LOGIN */
export const loginUser = async (
  email: string,
  password: string
): Promise<User> => {
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
      throw err;
    });

  const { token } = data;
  debugLogger({
    title: 'AuthService: Received token',
    data: token ? '<redacted>' : null
  });

  // Step 2: Decode token safely
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

  // Step 4: Fetch user details
  debugLogger({
    title: 'AuthService: GET /owner/user/:user_id',
    data: user_id
  });
  const ownerResp = await axios
    .get<Owner>(`${api}/owner/user/${user_id}`)
    .catch((err) => {
      debugLogger({
        title: 'AuthService: Owner by user lookup failed',
        error: {
          user_id,
          message: err?.message,
          status: err?.response?.status,
          data: err?.response?.data,
        },
        errorCode: err?.response?.status
      });
      return { data: {} as Owner };
    });
  const ownerData = ownerResp.data as Partial<Owner> as Owner;
  debugLogger({
    title: 'AuthService: ownerData',
    data: ownerData
  });

  let ownerAddressData: Address | null = null;
  if (ownerData && (ownerData as any).address_id) {
    debugLogger({
      title: 'AuthService: GET /address/:id',
      data: (ownerData as any).address_id
    });
    ownerAddressData = await axios
      .get<Address>(`${api}/address/${(ownerData as any).address_id}`)
      .then((r) => r.data)
      .catch((err) => {
        debugLogger({
          title: 'AuthService: Owner address fetch failed',
          error: {
            address_id: (ownerData as any).address_id,
            message: err?.message,
            status: err?.response?.status,
            data: err?.response?.data,
          },
          errorCode: err?.response?.status
        });
        return null;
      });
  }

  const ownerBarangay = ownerAddressData
    ? await axios
        .get<Barangay>(`${api}/barangay/${ownerAddressData.barangay_id}`)
        .then((r) => r.data)
        .catch((err) => {
          debugLogger({
            title: 'AuthService: Owner barangay fetch failed',
            error: err?.response?.status
          });
          return { barangay: "" } as Barangay;
        })
    : ({} as Barangay);

  const ownerMunicipality = ownerAddressData
    ? await axios
        .get<Municipality>(
          `${api}/municipality/${ownerAddressData.municipality_id}`
        )
        .then((r) => r.data)
        .catch((err) => {
          debugLogger({
            title: 'AuthService: Owner municipality fetch failed',
            error: err?.response?.status
          });
          return { municipality: "" } as Municipality;
        })
    : ({} as Municipality);

  const ownerProvince = ownerAddressData
    ? await axios
        .get<Province>(`${api}/province/${ownerAddressData.province_id}`)
        .then((r) => r.data)
        .catch((err) => {
          debugLogger({
            title: 'AuthService: Owner province fetch failed',
            error: err?.response?.status
          });
          return { province: "" } as Province;
        })
    : ({} as Province);

  debugLogger({
    title: 'AuthService: GET /tourist/user/:user_id',
    data: user_id
  });
  const touristResp = await axios
    .get<Tourist>(`${api}/tourist/user/${user_id}`)
    .catch((err) => {
      debugLogger({
        title: 'AuthService: Tourist by user lookup failed',
        error: {
          user_id,
          message: err?.message,
          status: err?.response?.status,
          data: err?.response?.data,
        },
        errorCode: err?.response?.status
      });
      return { data: {} as Tourist };
    });
  const touristData = touristResp.data as Partial<Tourist> as Tourist;
  debugLogger({
    title: 'AuthService: touristData',
    data: touristData
  });

  const touristAddressData: Address | null = (touristData as any).address_id
    ? await axios
        .get<Address>(`${api}/address/${(touristData as any).address_id}`)
        .then((r) => r.data)
        .catch((err) => {
          debugLogger({
            title: 'AuthService: Tourist address fetch failed',
            error: err?.response?.status
          });
          return null;
        })
    : null;

  const touristBarangay = touristAddressData
    ? await axios
        .get<Barangay>(`${api}/barangay/${touristAddressData.barangay_id}`)
        .then((r) => r.data)
        .catch(() => {
          debugLogger({
            title: 'AuthService: Tourist barangay fetch failed',
            error: 'No barangay found'
          });
          return { barangay: "" } as Barangay;
        })
    : ({} as Barangay);
  const touristMunicipality = touristAddressData
    ? await axios
        .get<Municipality>(
          `${api}/municipality/${touristAddressData.municipality_id}`
        )
        .then((r) => r.data)
        .catch(() => {
          debugLogger({
            title: 'AuthService: Tourist municipality fetch failed',
            error: 'No municipality found'
          });
          return { municipality: "" } as Municipality;
        })
    : ({} as Municipality);
  const touristProvince = touristAddressData
    ? await axios
        .get<Province>(`${api}/province/${touristAddressData.province_id}`)
        .then((r) => r.data)
        .catch(() => {
          debugLogger({
            title: 'AuthService: Tourist province fetch failed',
            error: 'No province found'
          });
          return { province: "" } as Province;
        })
    : ({} as Province);

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
    address_id:
      (ownerData as any).address_id ||
      (touristData as any).address_id ||
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

  // Save to AsyncStorage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(loggedInUser));

  return loggedInUser;
};

/** LOGOUT */
export const logoutUser = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
};

/** Get Stored User */
export const getStoredUser = async (): Promise<User | null> => {
  const storedUser = await AsyncStorage.getItem('user');
  return storedUser ? JSON.parse(storedUser) : null;
};

/** Get Stored Token */
export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('token');
};