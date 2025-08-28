import axios from "axios";
import api from "@/src/services/api";
import { supabase } from "@/src/utils/supabase";
export const insertData = async (data: any, table: string) => {
  try {
    const response = await axios.post(`${api}/${table}`, data);
    return response.data;
  } catch (error) {
    console.error("Insert failed:", error);
    throw error;
  }
};

export const updateData = async (id: string, data: any, table: string) => {
  try {
    const response = await axios.put(`${api}/${table}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Update failed:", error);
    throw error;
  }
};

export const deleteData = async (id: string, table: string) => {
  try {
    const response = await axios.delete(`${api}/${table}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete failed:", error);
    throw error;
  }
};

export const getData = async (table: string) => {
  try {
    const response = await axios.get(`${api}/${table}`);
    return response.data;
  } catch (error) {
    console.error("Get all failed:", error);
    throw error;
  }
};

export const getDataByIdAndStatus = async (
  table: string,
  id: string,
  status: string
) => {
  try {
    const response = await axios.get(`${api}/${table}/${id}?status=${status}`);
    return response.data;
  } catch (error) {
    console.error("Get all failed:", error);
    throw error;
  }
};

export const getDataById = async (table: string, id: string) => {
  try {
    const response = await axios.get(`${api}/${table}?id=${id}`);
    return response.data;
  } catch (error) {
    console.error("Get by ID failed:", error);
    throw error;
  }
};

// supabase image upload template
export const imageUpload = async (table: string, id: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(table)
    .upload(`${id}/${file.name}`, file);

  if (error) {
    console.error("Image upload failed:", error);
    throw error;
  }

  return data;
};
