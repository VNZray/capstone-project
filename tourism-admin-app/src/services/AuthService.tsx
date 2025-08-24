import axios from "axios";

import api from "@/src/services/api";
interface LoginResponse {
  token: string;
}

interface TourismResponse {
  first_name: string;
  last_name: string;
  id: string;
}

interface User {
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  tourism_id?: string;
}

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
  let payload: any;
  try {
    payload = JSON.parse(atob(token.split(".")[1]));
  } catch {
    throw new Error("Invalid authentication token");
  }

  const tourism_id: string = payload.tourism_id;
  if (!tourism_id) throw new Error("Account not found");

  // Step 3: Fetch tourism details
  const { data: tourismData } = await axios.get<TourismResponse>(
    `${api}/tourism/${tourism_id}`
  );

  // Step 4: Build user object
  const loggedInUser: User = {
    email,
    role: payload.role,
    first_name: tourismData.first_name,
    last_name: tourismData.last_name,
    tourism_id: tourismData.id,
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

export { api };
