import type { Permit } from "@/src/types/Permit";
import apiClient from "../apiClient";

export const getPermitsByBusiness = async (business_id: string): Promise<Permit[]> => {
  const { data } = await apiClient.get(`/permit/business/${business_id}`);
  return Array.isArray(data) ? data : [data]; // ensure it's always an array
};

export const getAllPermits = async (): Promise<Permit[]> => {
  const { data } = await apiClient.get(`/permit`);
  return Array.isArray(data) ? data : [];
};

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
  const { data } = await apiClient.post(`/permit`, permitData);
  return data;
};

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
  const { data } = await apiClient.put(`/permit/${permit_id}`, permitData);
  return data;
};

export const deletePermit = async (permit_id: string): Promise<void> => {
  await apiClient.delete(`/permit/${permit_id}`);
};
