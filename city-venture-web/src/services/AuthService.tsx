import axios from "axios";

import api from "@/src/services/api";
interface LoginResponse {
  token: string;
}

interface UserDetails {
  first_name: string;
  last_name: string;
  id: string;
}

interface User {
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  owner_id?: string;
  tourism_id?: string;
  tourist_id?: string;
}

type TokenPayload = {
  id: string;
  role: string;
  owner_id?: string | null;
  tourism_id?: string | null;
  tourist_id?: string | null;
  exp?: number;
  iat?: number;
};

/** LOGIN */
export const loginUser = async (
  email: string,
  password: string
): Promise<User> => {
  // Step 1: Login request
  const { data } = await axios.post<LoginResponse>(`${api}/users/login`, {
    email,
    password,
  });

  const { token } = data;

  // Step 2: Decode token safely
  let payload: TokenPayload;
  try {
    payload = JSON.parse(atob(token.split(".")[1]));
  } catch {
    throw new Error("Invalid authentication token");
  }

  const ownerId = payload.owner_id;
  if (!ownerId) throw new Error("Owner ID not found in token");

  // Step 3: Fetch owner details
  const { data: ownerData } = await axios.get<UserDetails>(
    `${api}/owner/${ownerId}`
  );

  // Step 4: Build user object
  const loggedInOwner: User = {
    email,
    role: payload.role,
    first_name: ownerData.first_name,
    last_name: ownerData.last_name,
    owner_id: ownerData.id,
  };

  // Save to localStorage
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(loggedInOwner));

  return loggedInOwner;
};

export const loginAdmin = async (
  email: string,
  password: string
): Promise<User> => {
  // Step 1: Login request
  const { data } = await axios.post<LoginResponse>(`${api}/users/login`, {
    email,
    password,
  });

  const { token } = data;

  // Step 2: Decode token safely
  let payload: TokenPayload;
  try {
    payload = JSON.parse(atob(token.split(".")[1]));
  } catch {
    throw new Error("Invalid authentication token");
  }

  const adminId = payload.tourism_id;
  if (!adminId) throw new Error("Admin ID not found in token");

  // Step 3: Fetch tourism details
  const { data: tourismData } = await axios.get<UserDetails>(
    `${api}/tourism/${adminId}`
  );

  // Step 4: Build user object
  const loggedInAdmin: User = {
    email,
    role: payload.role,
    first_name: tourismData.first_name,
    last_name: tourismData.last_name,
    tourism_id: tourismData.id,
  };

  // Save to localStorage
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(loggedInAdmin));

  return loggedInAdmin;
};

export const loginTourist = async (
  email: string,
  password: string
): Promise<User> => {
  // Step 1: Login request
  const { data } = await axios.post<LoginResponse>(`${api}/users/login`, {
    email,
    password,
  });

  const { token } = data;

  // Step 2: Decode token safely
  let payload: TokenPayload;
  try {
    payload = JSON.parse(atob(token.split(".")[1]));
  } catch {
    throw new Error("Invalid authentication token");
  }

  const touristId = payload.tourist_id;
  if (!touristId) throw new Error("Tourist ID not found in token");

  // Step 3: Fetch tourist details
  const { data: touristData } = await axios.get<UserDetails>(
    `${api}/tourist/${touristId}`
  );

  // Step 4: Build user object
  const loggedInTourist: User = {
    email,
    role: payload.role,
    first_name: touristData.first_name,
    last_name: touristData.last_name,
    tourist_id: touristData.id,
  };

  // Save to localStorage
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(loggedInTourist));

  return loggedInTourist;
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

export { api };
