// src/services/AddressService.ts
import apiClient from "./apiClient";
import { getData, getDataById } from "./Service";
import type { Municipality, Barangay, Province } from "@/src/types/Address";

export const AddressService = {
  async getProvinces(): Promise<Province[]> {
    const res = await apiClient.get(`/address/provinces`);
    return Array.isArray(res.data) ? res.data : [];
  },

  async getMunicipalities(provinceId: number): Promise<Municipality[]> {
    const res = await apiClient.get(`/address/municipalities/${provinceId}`);
    return Array.isArray(res.data) ? res.data : [];
  },

  async getBarangays(municipalityId: number): Promise<Barangay[]> {
    const res = await apiClient.get(`/address/barangays/${municipalityId}`);
    return Array.isArray(res.data) ? res.data : [];
  },

  async getBarangayById(barangayId: number) {
    const res = await apiClient.get(`/address/barangay/${barangayId}`);
    return res.data;
  },

  async getMunicipalityById(municipalityId: number) {
    const res = await apiClient.get(`/address/municipality/${municipalityId}`);
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
    const response = await getDataById("address", barangayId);
    return response;
  },
};
