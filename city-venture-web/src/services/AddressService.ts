/**
 * Address Service
 * Handles province, municipality, and barangay lookups
 * Updated to use new backend v1 API endpoints
 */
import apiClient from "./apiClient";

export type Province = { id: number; province: string };
export type Municipality = { id: number; municipality: string };
export type Barangay = { id: number; barangay: string };

export interface FullAddress {
  barangay: Barangay;
  municipality: Municipality;
  province: Province;
}

export const AddressService = {
  /** Get all provinces */
  async getProvinces(): Promise<Province[]> {
    const res = await apiClient.get(`/addresses/provinces`);
    return Array.isArray(res.data) ? res.data : [];
  },

  /** Get municipalities by province ID */
  async getMunicipalities(provinceId: number): Promise<Municipality[]> {
    const res = await apiClient.get(
      `/addresses/provinces/${provinceId}/municipalities`
    );
    return Array.isArray(res.data) ? res.data : [];
  },

  /** Get barangays by municipality ID */
  async getBarangays(municipalityId: number): Promise<Barangay[]> {
    const res = await apiClient.get(
      `/addresses/municipalities/${municipalityId}/barangays`
    );
    return Array.isArray(res.data) ? res.data : [];
  },

  /** Get barangay by ID */
  async getBarangayById(barangayId: number): Promise<Barangay> {
    const res = await apiClient.get(`/addresses/barangays/${barangayId}`);
    return res.data;
  },

  /** Get municipality by ID */
  async getMunicipalityById(municipalityId: number): Promise<Municipality> {
    const res = await apiClient.get(
      `/addresses/municipalities/${municipalityId}`
    );
    return res.data;
  },

  /** Get province by ID */
  async getProvinceById(provinceId: number): Promise<Province> {
    const res = await apiClient.get(`/addresses/provinces/${provinceId}`);
    return res.data;
  },

  /** Get full address (barangay, municipality, province) by barangay ID */
  async fetchFullAddress(barangayId: number): Promise<FullAddress> {
    const res = await apiClient.get(
      `/addresses/barangays/${barangayId}/full-address`
    );
    return res.data;
  },
};
