import apiClient from '@/services/apiClient';
import axios from 'axios';

export const insertData = async (data: any, table: string) => {
  try {
    const response = await apiClient.post(`/${table}`, data);
    return response.data;
  } catch (error) {
    console.error('Insert failed:', error);
    throw error;
  }
};

export const updateData = async (
  id: string | number,
  data: any,
  table: string
) => {
  try {
    const response = await apiClient.put(`${table}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Update failed:', error);
    throw error;
  }
};

export const deleteData = async (id: string | number, table: string) => {
  try {
    const response = await apiClient.delete(`${table}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete failed:', error);
    throw error;
  }
};

export const getData = async (table: string) => {
  try {
    const response = await axios.get(`${table}`);
    return response.data;
  } catch (error) {
    console.error('Get all failed:', error);
    throw error;
  }
};

export const getJoinedData = async (directory: string, table: string) => {
  try {
    const response = await axios.get(`{${directory}}/${table}`);
    return response.data;
  } catch (error) {
    console.error('Get all failed:', error);
    throw error;
  }
};

export const getDataById = async (table: string, id: string | number) => {
  try {
    const response = await axios.get(`${table}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get by ID failed:', error);
    throw error;
  }
};
