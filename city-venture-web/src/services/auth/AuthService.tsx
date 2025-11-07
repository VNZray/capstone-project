import axios from "axios";

import api from "@/src/services/api";
import type { TokenPayload, User, UserDetails, UserRoles } from "../../types/User";
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

/** LOGIN */
export const loginUser = async (
  email: string,
  password: string
): Promise<UserDetails> => {
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

  // Set Authorization header for subsequent requests (matches backend RBAC)
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

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
      // Fallback: map from seeded role ids
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

  // Step 3.5: Fetch permissions for the authenticated user (RBAC)
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
  // Optional: parse user_profile for basic info if present (fallback when no owner/tourist/tourism records)
  type ProfileInfo = Partial<{
    first_name: string;
    middle_name: string;
    last_name: string;
    gender: string;
    birthdate: string;
  }>;
  let profileInfo: ProfileInfo = {};
  if (userData.user_profile) {
    try {
      const parsed = JSON.parse(userData.user_profile as unknown as string);
      if (parsed && typeof parsed === "object")
        profileInfo = parsed as ProfileInfo;
    } catch {
      // ignore non-JSON profiles
    }
  }

  // Step 4: Fetch user details
  console.debug("[AuthService] GET /owner/user/:user_id", user_id);
  const ownerData: Partial<Owner> | null = await axios
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

  // Address is now tied to User (barangay_id moved to User)
  let addressData: Address | null = null;
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
  }

  const barangay: Partial<Barangay> = addressData
    ? await axios
        .get<Barangay>(`${api}/address/barangay/${addressData.barangay_id}`)
        .then((r) => r.data)
        .catch(() => ({ barangay: "" } as Partial<Barangay>))
    : {};

  const municipality: Partial<Municipality> = addressData
    ? await axios
        .get<Municipality>(
          `${api}/address/municipality/${addressData.municipality_id}`
        )
        .then((r) => r.data)
        .catch(() => ({ municipality: "" } as Partial<Municipality>))
    : {};

  const province: Partial<Province> = addressData
    ? await axios
        .get<Province>(`${api}/address/province/${addressData.province_id}`)
        .then((r) => r.data)
        .catch(() => ({ province: "" } as Partial<Province>))
    : {};

  console.debug("[AuthService] GET /tourist/user/:user_id", user_id);
  const touristData: Partial<Tourist> | null = await axios
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

  // Address details already derived from userData.barangay_id above

  console.debug("[AuthService] GET /tourism/user/:user_id", user_id);
  const tourismData: Partial<Tourism> | null = await axios
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

  console.debug("[AuthService] GET /staff/user/:user_id", user_id);
  const staffData: Partial<Staff> | null = await axios
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

  // Address details already derived from userData.barangay_id above

  // Step 4: Build user object
  // Normalize role for UI usage
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

  const loggedInUser: UserDetails = {
    id: ownerData?.id || touristData?.id || tourismData?.id || userData.id,
    email,
    password,
    phone_number: userData.phone_number,
    // Store normalized role aligned with new design
    role_name: normalizedRoleName,
    first_name:
      ownerData?.first_name ||
      touristData?.first_name ||
      tourismData?.first_name ||
      staffData?.first_name ||
      "",
    middle_name:
      ownerData?.middle_name ||
      touristData?.middle_name ||
      tourismData?.middle_name ||
      staffData?.middle_name ||
      "",
    last_name:
      ownerData?.last_name ||
      touristData?.last_name ||
      tourismData?.last_name ||
      staffData?.last_name ||
      "",
    gender:
      ownerData?.gender || touristData?.gender || tourismData?.gender || "",
    birthdate:
      ownerData?.birthdate ||
      touristData?.birthdate ||
      tourismData?.birthdate ||
      "",
    nationality: touristData?.nationality || "",
    ethnicity: touristData?.ethnicity || "",
    category: touristData?.category || "",
    user_profile: userData.user_profile,
    is_active: Boolean(userData.is_active),
    is_verified: Boolean(userData.is_verified),
    created_at: userData.created_at || "",
    updated_at: userData.updated_at || "",
    last_login: userData.last_login || "",
    user_role_id: userData.user_role_id,
    description: userRole?.description || "",
    barangay_id: userData?.barangay_id ?? "",
    municipality_name: municipality?.municipality || "",
    barangay_name: barangay?.barangay || "",
    province_name: province?.province || "",
    user_id: userData.id || "",
    permissions: myPermissions,
    business_id: staffData?.business_id || "",
  };

  // Save to sessionStorage
  sessionStorage.setItem("token", token);
  sessionStorage.setItem("user", JSON.stringify(loggedInUser));

  return loggedInUser;
};

/** LOGOUT */
export const logoutUser = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
};

/** Get Stored User */
export const getStoredUser = (): UserDetails | null => {
  const storedUser = sessionStorage.getItem("user");
  return storedUser ? JSON.parse(storedUser) : null;
};

/** Get Stored Token */
export const getToken = (): string | null => {
  return sessionStorage.getItem("token");
};

export const fetchUserData = async (user_id: string): Promise<User> => {
  const { data } = await axios.get<User>(`${api}/users/${user_id}`);
  return data;
};
