import api from "@/src/services/api";

// src/services/AddressService.ts
import axios from "axios";

export type Province = { id: number; province: string };
export type Municipality = { id: number; municipality: string };
export type Barangay = { id: number; barangay: string };

export const AddressService = {
  async getProvinces(api: string): Promise<Province[]> {
    const res = await axios.get(`${api}/address/provinces`);
    return Array.isArray(res.data) ? res.data : [];
  },

  async getMunicipalities(
    api: string,
    provinceId: number
  ): Promise<Municipality[]> {
    const res = await axios.get(`${api}/address/municipalities/${provinceId}`);
    return Array.isArray(res.data) ? res.data : [];
  },

  async getBarangays(api: string, municipalityId: number): Promise<Barangay[]> {
    const res = await axios.get(`${api}/address/barangays/${municipalityId}`);
    return Array.isArray(res.data) ? res.data : [];
  },

  async getBarangayById(barangayId: number) {
    const res = await axios.get(`${api}/address/barangay/${barangayId}`);
    return res.data;
  },

  async getMunicipalityById(municipalityId: number) {
    const res = await axios.get(
      `${api}/address/municipality/${municipalityId}`
    );
    return res.data;
  },

  async getProvinceById(provinceId: number) {
    const res = await axios.get(`${api}/address/province/${provinceId}`);
    return res.data;
  },
};

export async function fetchAddressById(id: number) {
  const response = await axios.get(`${api}/address/${id}`);
  return response.data;
}

export async function fetchAllAddress() {
  const response = await axios.get(`${api}/address`);
  return response.data;
}
