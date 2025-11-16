import type { Permit } from "@/src/types/Permit";
import axios from "axios";
import api from "../api";

export const getPermitsByBusiness = async (business_id: string): Promise<Permit[]> => {
  const { data } = await axios.get(`${api}/permit/business/${business_id}`);
  return Array.isArray(data) ? data : [data]; // ensure it's always an array
};

export const getAllPermits = async (): Promise<Permit[]> => {
  const { data } = await axios.get(`${api}/permit`);
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
  const { data } = await axios.post(`${api}/permit`, permitData);
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
  const { data } = await axios.put(`${api}/permit/${permit_id}`, permitData);
  return data;
};

export const deletePermit = async (permit_id: string): Promise<void> => {
  await axios.delete(`${api}/permit/${permit_id}`);
};
