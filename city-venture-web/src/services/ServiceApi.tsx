import axios from "axios";
import api from "@/src/services/api";
import type {
  Service,
  ServiceCategory,
  CreateServicePayload,
  UpdateServicePayload,
  CreateServiceCategoryPayload,
  UpdateServiceCategoryPayload,
  ServiceBooking,
  CreateServiceBookingPayload,
  UpdateServiceBookingPayload,
} from "@/src/types/Service";

function normalizeArrayResponse<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    if (payload.length === 2 && Array.isArray(payload[0]) && typeof payload[1] === "object") {
      return normalizeArrayResponse<T>(payload[0]);
    }
    return payload as T[];
  }

  if (payload && typeof payload === "object") {
    const dataField = (payload as { data?: unknown }).data;
    if (Array.isArray(dataField)) {
      return normalizeArrayResponse<T>(dataField);
    }
    if (dataField && typeof dataField === "object") {
      const rows = (dataField as { rows?: unknown }).rows;
      if (Array.isArray(rows)) {
        return normalizeArrayResponse<T>(rows);
      }
    }
  }

  return [] as T[];
}

function isNotFound(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

// Service Category APIs
export const fetchServiceCategoriesByBusinessId = async (
  businessId: string
): Promise<ServiceCategory[]> => {
  try {
    const { data } = await axios.get<ServiceCategory[]>(
      `${api}/services/categories/business/${businessId}`
    );
    return normalizeArrayResponse<ServiceCategory>(data);
  } catch (error) {
    if (isNotFound(error)) {
      return [];
    }
    throw error;
  }
};

export const fetchServiceCategoryById = async (id: string): Promise<ServiceCategory> => {
  const { data } = await axios.get<ServiceCategory>(`${api}/services/categories/${id}`);
  return data;
};

export const createServiceCategory = async (
  payload: CreateServiceCategoryPayload
): Promise<ServiceCategory> => {
  const { data } = await axios.post<ServiceCategory>(`${api}/services/categories`, payload);
  return data;
};

export const updateServiceCategory = async (
  id: string,
  payload: UpdateServiceCategoryPayload
): Promise<ServiceCategory> => {
  const { data } = await axios.put<ServiceCategory>(`${api}/services/categories/${id}`, payload);
  return data;
};

export const deleteServiceCategory = async (id: string): Promise<void> => {
  await axios.delete(`${api}/services/categories/${id}`);
};

// Service APIs
export const fetchServicesByBusinessId = async (businessId: string): Promise<Service[]> => {
  try {
    const { data } = await axios.get<Service[]>(`${api}/services/business/${businessId}`);
    return normalizeArrayResponse<Service>(data);
  } catch (error) {
    if (isNotFound(error)) {
      return [];
    }
    throw error;
  }
};

export const fetchServiceById = async (id: string): Promise<Service> => {
  const { data } = await axios.get<Service>(`${api}/services/${id}`);
  return data;
};

export const createService = async (payload: CreateServicePayload): Promise<Service> => {
  const { data } = await axios.post<Service>(`${api}/services`, payload);
  return data;
};

export const updateService = async (
  id: string,
  payload: UpdateServicePayload
): Promise<Service> => {
  const { data } = await axios.put<Service>(`${api}/services/${id}`, payload);
  return data;
};

export const deleteService = async (id: string): Promise<void> => {
  await axios.delete(`${api}/services/${id}`);
};

// Service Booking APIs
export const fetchServiceBookingsByBusinessId = async (
  businessId: string
): Promise<ServiceBooking[]> => {
  try {
    const { data } = await axios.get<ServiceBooking[]>(
      `${api}/service-bookings/business/${businessId}`
    );
    return normalizeArrayResponse<ServiceBooking>(data);
  } catch (error) {
    if (isNotFound(error)) {
      return [];
    }
    throw error;
  }
};

export const fetchServiceBookingsByServiceId = async (
  serviceId: string
): Promise<ServiceBooking[]> => {
  try {
    const { data } = await axios.get<ServiceBooking[]>(
      `${api}/service-bookings/service/${serviceId}`
    );
    return normalizeArrayResponse<ServiceBooking>(data);
  } catch (error) {
    if (isNotFound(error)) {
      return [];
    }
    throw error;
  }
};

export const fetchServiceBookingById = async (id: string): Promise<ServiceBooking> => {
  const { data } = await axios.get<ServiceBooking>(`${api}/service-bookings/${id}`);
  return data;
};

export const createServiceBooking = async (
  payload: CreateServiceBookingPayload
): Promise<ServiceBooking> => {
  const { data } = await axios.post<ServiceBooking>(`${api}/service-bookings`, payload);
  return data;
};

export const updateServiceBooking = async (
  id: string,
  payload: UpdateServiceBookingPayload
): Promise<ServiceBooking> => {
  const { data } = await axios.put<ServiceBooking>(`${api}/service-bookings/${id}`, payload);
  return data;
};

export const deleteServiceBooking = async (id: string): Promise<void> => {
  await axios.delete(`${api}/service-bookings/${id}`);
};
