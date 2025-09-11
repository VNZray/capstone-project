import axios from "axios";
import api from "@/src/services/api";

export const insertData = async (data: any, table: string) => {
  try {
    const response = await axios.post(`${api}/${table}`, data);
    return response.data;
  } catch (error) {
    console.error("Insert failed:", error);
    throw error;
  }
};

export const updateData = async (id: string | number, data: any, table: string) => {
  try {
    const response = await axios.put(`${api}/${table}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Update failed:", error);
    throw error;
  }
};

export const deleteData = async (id: string | number, table: string) => {
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

export const getJoinedData = async (directory: string, table: string) => {
  try {
    const response = await axios.get(`{${directory}}/${api}/${table}`);
    return response.data;
  } catch (error) {
    console.error("Get all failed:", error);
    throw error;
  }
};

export const getDataById = async (table: string, id: string | number) => {
  try {
    const response = await axios.get(`${api}/${table}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get by ID failed:", error);
    throw error;
  }
};

export const getDataByForeignId = async (table: string, id: string | number) => {
  try {
    const response = await axios.get(`${api}/${table}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get by ID failed:", error);
    throw error;
  }
};
