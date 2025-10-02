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
  const user_role_id = Number(payload.user_role_id);
  if (!user_id) throw new Error("User ID not found in token");

  debugLogger({
    title: 'AuthService: Starting parallel data fetch',
    data: { user_id, user_role_id }
  });

  // Step 3: Fetch all data in parallel for much better performance
  const [
    { data: userData },
    { data: userRole },
    ownerResp,
    touristResp
  ] = await Promise.all([
    axios.get<User>(`${api}/users/${user_id}`).catch((err) => {
      debugLogger({
        title: 'AuthService: Fetch user failed',
        error: { message: err?.message, status: err?.response?.status },
        errorCode: err?.response?.status
      });
      throw err;
    }),
    axios.get<UserRoles>(`${api}/user-roles/${user_role_id}`).catch((err) => {
      debugLogger({
        title: 'AuthService: Fetch role failed',
        error: { message: err?.message, status: err?.response?.status },
        errorCode: err?.response?.status
      });
      throw err;
    }),
    // Only fetch owner if user_role_id is 3 (owner)
    user_role_id === 3 
      ? axios.get<Owner>(`${api}/owner/user/${user_id}`).catch(() => ({ data: {} as Owner }))
      : Promise.resolve({ data: {} as Owner }),
    // Only fetch tourist if user_role_id is 2 (tourist)
    user_role_id === 2
      ? axios.get<Tourist>(`${api}/tourist/user/${user_id}`).catch(() => ({ data: {} as Tourist }))
      : Promise.resolve({ data: {} as Tourist })
  ]);

  const ownerData = ownerResp.data as Partial<Owner>;
  const touristData = touristResp.data as Partial<Tourist>;

  debugLogger({
    title: 'AuthService: Core data fetched',
    data: { 
      hasOwner: !!ownerData?.id, 
      hasTourist: !!touristData?.id,
      role: (userRole as any)?.role_name
    }
  });

  // Step 4: Fetch address details if needed (in parallel)
  let ownerBarangay: Barangay = {} as Barangay;
  let ownerMunicipality: Municipality = {} as Municipality;
  let ownerProvince: Province = {} as Province;
  
  let touristBarangay: Barangay = {} as Barangay;
  let touristMunicipality: Municipality = {} as Municipality;
  let touristProvince: Province = {} as Province;

  const addressId = (ownerData as any)?.address_id || (touristData as any)?.address_id;
  
  if (addressId) {
    debugLogger({
      title: 'AuthService: Fetching address details',
      data: { address_id: addressId }
    });

    try {
      const { data: addressData } = await axios.get<Address>(`${api}/address/${addressId}`);

      // Fetch barangay, municipality, province in parallel
      const [barangayData, municipalityData, provinceData] = await Promise.all([
        axios.get<Barangay>(`${api}/barangay/${addressData.barangay_id}`)
          .then(r => r.data)
          .catch(() => ({ barangay: "" } as Barangay)),
        axios.get<Municipality>(`${api}/municipality/${addressData.municipality_id}`)
          .then(r => r.data)
          .catch(() => ({ municipality: "" } as Municipality)),
        axios.get<Province>(`${api}/province/${addressData.province_id}`)
          .then(r => r.data)
          .catch(() => ({ province: "" } as Province))
      ]);

      if (user_role_id === 3) {
        ownerBarangay = barangayData;
        ownerMunicipality = municipalityData;
        ownerProvince = provinceData;
      } else {
        touristBarangay = barangayData;
        touristMunicipality = municipalityData;
        touristProvince = provinceData;
      }

      debugLogger({
        title: 'AuthService: Address details fetched',
        data: { 
          barangay: barangayData.barangay, 
          municipality: municipalityData.municipality,
          province: provinceData.province
        }
      });
    } catch (err: any) {
      debugLogger({
        title: 'AuthService: Address fetch failed',
        error: { message: err?.message, status: err?.response?.status },
        errorCode: err?.response?.status
      });
    }
  }

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