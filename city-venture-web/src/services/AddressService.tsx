import api from "@/src/services/api";

// src/services/AddressService.ts
import axios from "axios";
import { getData, getDataById } from "./Service";

export type Province = { id: number; province: string };
export type Municipality = { id: number; municipality: string };
export type Barangay = { id: number; barangay: string };

export const AddressService = {
  async getProvinces(): Promise<Province[]> {
    const res = await axios.get(`${api}/address/provinces`);
    return Array.isArray(res.data) ? res.data : [];
  },

  async getMunicipalities(provinceId: number): Promise<Municipality[]> {
    const res = await axios.get(`${api}/address/municipalities/${provinceId}`);
    return Array.isArray(res.data) ? res.data : [];
  },

  async getBarangays(municipalityId: number): Promise<Barangay[]> {
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
    const response = await getDataById("address/province", provinceId);
    return response;
  },

  async fetchAddressById(id: number) {
    const response = await getDataById("address", id);
    return response;
  },

  async fetchAllAddress() {
    const response = await getData("address");
    return response;
  },

  // revised address fetching

  async fetchFullAddress(barangayId: number) {
    const response = await getDataById("address/full-address", barangayId);
    return response;
  },
};
