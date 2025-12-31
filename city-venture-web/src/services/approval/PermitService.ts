/**
 * Permit Service
 * Handles permit management operations
 * Updated to use new backend v1 API endpoints
 */
import type { Permit } from "@/src/types/Permit";
import apiClient from "../apiClient";

/** Get permits by business ID */
export const getPermitsByBusiness = async (
  business_id: string
): Promise<Permit[]> => {
  const { data } = await apiClient.get(`/permits/business/${business_id}`);
  return Array.isArray(data) ? data : [data];
};

/** Get all permits */
export const getAllPermits = async (): Promise<Permit[]> => {
  const { data } = await apiClient.get(`/permits`);
  return Array.isArray(data) ? data : [];
};

/** Get expiring permits */
export const getExpiringPermits = async (
  daysThreshold = 30
): Promise<Permit[]> => {
  const { data } = await apiClient.get(`/permits/expiring`, {
    params: { days: daysThreshold },
  });
  return Array.isArray(data) ? data : [];
};

/** Get expired permits */
export const getExpiredPermits = async (): Promise<Permit[]> => {
  const { data } = await apiClient.get(`/permits/expired`);
  return Array.isArray(data) ? data : [];
};

/** Create a new permit */
export const insertPermit = async (permitData: {
  business_id: string;
  permit_type: string;
  file_url: string;
  file_format: string;
  file_size: number;
  file_name: string;
  expiration_date: string;
  status: string;
}): Promise<Permit> => {
  const { data } = await apiClient.post(`/permits`, permitData);
  return data;
};

/** Update a permit */
export const updatePermit = async (
  permit_id: string,
  permitData: {
    business_id?: string;
    permit_type?: string;
    file_url?: string;
    file_format?: string;
    file_size?: number;
    file_name?: string;
    expiration_date?: string;
    status?: string;
  }
): Promise<Permit> => {
  const { data } = await apiClient.patch(`/permits/${permit_id}`, permitData);
  return data;
};

/** Delete a permit */
export const deletePermit = async (permit_id: string): Promise<void> => {
  await apiClient.delete(`/permits/${permit_id}`);
};
