import api from "@/src/services/api";

// src/services/AddressService.ts
import axios from "axios";

export async function fetchCategoryAndType(id: number) {
  const response = await axios.get(`${api}/category-and-type/${id}`);
  return response.data;
}
