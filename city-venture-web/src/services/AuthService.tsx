import axios from "axios";

import api from "@/src/services/api";
import type { TokenPayload, User, UserDetails, UserRoles } from "../types/User";
import type {
  Address,
  Municipality,
  Barangay,
  Province,
} from "../types/Address";
import type { Owner } from "../types/Owner";
import type { Tourist } from "../types/Tourist";
import type { Tourism } from "../types/Tourism";
interface LoginResponse {
  token: string;
}

/** LOGIN */
export const loginUser = async (
  email: string,
  password: string
): Promise<User> => {
  // Step 1: Login request
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

  // Step 2: Decode token safely
  let payload: TokenPayload;
  try {
    payload = JSON.parse(atob(token.split(".")[1]));
    console.debug("[AuthService] Decoded token payload", payload);
  } catch {
    throw new Error("Invalid authentication token");
  }

  const user_id = payload.id;
  if (!user_id) throw new Error("User ID not found in token");

  // Step 3: Fetch user details
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
      throw err;
    });
  console.debug("[AuthService] userRole", userRole);

  // Step 4: Fetch user details
  console.debug("[AuthService] GET /owner/user/:user_id", user_id);
  const ownerResp = await axios
    .get<Owner>(`${api}/owner/user/${user_id}`)
    .catch((err) => {
      console.warn("[AuthService] Owner by user lookup failed", {
        user_id,
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      return { data: {} as Owner };
    });
  const ownerData = ownerResp.data as Partial<Owner> as Owner;
  console.debug("[AuthService] ownerData", ownerData);

  let ownerAddressData: Address | null = null;
  if (ownerData && (ownerData as any).address_id) {
    console.debug(
      "[AuthService] GET /address/:id",
      (ownerData as any).address_id
    );
    ownerAddressData = await axios
      .get<Address>(`${api}/address/${(ownerData as any).address_id}`)
      .then((r) => r.data)
      .catch((err) => {
        console.warn("[AuthService] Owner address fetch failed", {
          address_id: (ownerData as any).address_id,
          message: err?.message,
          status: err?.response?.status,
          data: err?.response?.data,
        });
        return null;
      });
  }

  const ownerBarangay = ownerAddressData
    ? await axios
        .get<Barangay>(`${api}/barangay/${ownerAddressData.barangay_id}`)
        .then((r) => r.data)
        .catch((err) => {
          console.warn(
            "[AuthService] Owner barangay fetch failed",
            err?.response?.status
          );
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
          console.warn(
            "[AuthService] Owner municipality fetch failed",
            err?.response?.status
          );
          return { municipality: "" } as Municipality;
        })
    : ({} as Municipality);

  const ownerProvince = ownerAddressData
    ? await axios
        .get<Province>(`${api}/province/${ownerAddressData.province_id}`)
        .then((r) => r.data)
        .catch((err) => {
          console.warn(
            "[AuthService] Owner province fetch failed",
            err?.response?.status
          );
          return { province: "" } as Province;
        })
    : ({} as Province);

  console.debug("[AuthService] GET /tourist/user/:user_id", user_id);
  const touristResp = await axios
    .get<Tourist>(`${api}/tourist/user/${user_id}`)
    .catch((err) => {
      console.warn("[AuthService] Tourist by user lookup failed", {
        user_id,
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      return { data: {} as Tourist };
    });
  const touristData = touristResp.data as Partial<Tourist> as Tourist;
  console.debug("[AuthService] touristData", touristData);

  const touristAddressData: Address | null = (touristData as any).address_id
    ? await axios
        .get<Address>(`${api}/address/${(touristData as any).address_id}`)
        .then((r) => r.data)
        .catch((err) => {
          console.warn(
            "[AuthService] Tourist address fetch failed",
            err?.response?.status
          );
          return null;
        })
    : null;

  const touristBarangay = touristAddressData
    ? await axios
        .get<Barangay>(`${api}/barangay/${touristAddressData.barangay_id}`)
        .then((r) => r.data)
        .catch(() => ({ barangay: "" } as Barangay))
    : ({} as Barangay);
  const touristMunicipality = touristAddressData
    ? await axios
        .get<Municipality>(
          `${api}/municipality/${touristAddressData.municipality_id}`
        )
        .then((r) => r.data)
        .catch(() => ({ municipality: "" } as Municipality))
    : ({} as Municipality);
  const touristProvince = touristAddressData
    ? await axios
        .get<Province>(`${api}/province/${touristAddressData.province_id}`)
        .then((r) => r.data)
        .catch(() => ({ province: "" } as Province))
    : ({} as Province);

  console.debug("[AuthService] GET /tourism/user/:user_id", user_id);
  const tourismResp = await axios
    .get<Tourism>(`${api}/tourism/user/${user_id}`)
    .catch((err) => {
      console.warn("[AuthService] Tourism by user lookup failed", {
        user_id,
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      return { data: {} as Tourism };
    });
  const tourismData = tourismResp.data as Partial<Tourism> as Tourism;

  const tourismAddressData: Address | null = (tourismData as any).address_id
    ? await axios
        .get<Address>(`${api}/address/${(tourismData as any).address_id}`)
        .then((r) => r.data)
        .catch(() => null)
    : null;
  const tourismBarangay = tourismAddressData
    ? await axios
        .get<Barangay>(`${api}/barangay/${tourismAddressData.barangay_id}`)
        .then((r) => r.data)
        .catch(() => ({ barangay: "" } as Barangay))
    : ({} as Barangay);
  const tourismMunicipality = tourismAddressData
    ? await axios
        .get<Municipality>(
          `${api}/municipality/${tourismAddressData.municipality_id}`
        )
        .then((r) => r.data)
        .catch(() => ({ municipality: "" } as Municipality))
    : ({} as Municipality);
  const tourismProvince = tourismAddressData
    ? await axios
        .get<Province>(`${api}/province/${tourismAddressData.province_id}`)
        .then((r) => r.data)
        .catch(() => ({ province: "" } as Province))
    : ({} as Province);

  // Step 4: Build user object
  const loggedInUser: UserDetails = {
    id:
      (ownerData as any).id ||
      (touristData as any).id ||
      (tourismData as any).id ||
      userData.id,
    email,
    password,
    phone_number: userData.phone_number,
    role_name: (userRole as any)?.role_name,
    first_name:
      (ownerData as any).first_name ||
      (touristData as any).first_name ||
      (tourismData as any).first_name ||
      "",
    middle_name:
      (ownerData as any).middle_name ||
      (touristData as any).middle_name ||
      (tourismData as any).middle_name ||
      "",
    last_name:
      (ownerData as any).last_name ||
      (touristData as any).last_name ||
      (tourismData as any).last_name ||
      "",
    gender:
      (ownerData as any).gender ||
      (touristData as any).gender ||
      (tourismData as any).gender ||
      "",
    birthdate:
      (ownerData as any).birthdate ||
      (touristData as any).birthdate ||
      (tourismData as any).birthdate ||
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
      (tourismData as any).address_id ||
      (touristData as any).address_id ||
      "",
    municipality_name:
      (ownerMunicipality as any).municipality ||
      (touristMunicipality as any).municipality ||
      (tourismMunicipality as any).municipality ||
      "",
    barangay_name:
      (ownerBarangay as any).barangay ||
      (touristBarangay as any).barangay ||
      (tourismBarangay as any).barangay ||
      "",
    province_name:
      (ownerProvince as any).province ||
      (touristProvince as any).province ||
      (tourismProvince as any).province ||
      "",
    user_id: userData.id || "",
  };

  // Save to localStorage
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(loggedInUser));

  return loggedInUser;
};

/** LOGOUT */
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

/** Get Stored User */
export const getStoredUser = (): User | null => {
  const storedUser = localStorage.getItem("user");
  return storedUser ? JSON.parse(storedUser) : null;
};

/** Get Stored Token */
export const getToken = (): string | null => {
  return localStorage.getItem("token");
};