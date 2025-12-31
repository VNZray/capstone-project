import apiClient from "./apiClient";
import type {
  Service,
  CreateServicePayload,
  UpdateServicePayload,
} from "@/src/types/Service";

function normalizeArrayResponse<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    if (
      payload.length === 2 &&
      Array.isArray(payload[0]) &&
      typeof payload[1] === "object"
    ) {
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
  return (error as any)?.response?.status === 404;
}

// Service APIs
export const fetchServicesByBusinessId = async (
  businessId: string
): Promise<Service[]> => {
  try {
    const { data } = await apiClient.get<Service[]>(
      `/services/business/${businessId}`
    );
    return normalizeArrayResponse<Service>(data);
  } catch (error) {
    if (isNotFound(error)) {
      return [];
    }
    throw error;
  }
};

export const fetchServiceById = async (id: string): Promise<Service> => {
  const { data } = await apiClient.get<Service>(`/services/${id}`);
  return data;
};

export const createService = async (
  payload: CreateServicePayload
): Promise<Service> => {
  const { data } = await apiClient.post<Service>(`/services`, payload);
  return data;
};

export const updateService = async (
  id: string,
  payload: UpdateServicePayload
): Promise<Service> => {
  const { data } = await apiClient.patch<Service>(`/services/${id}`, payload);
  return data;
};

export const deleteService = async (id: string): Promise<void> => {
  await apiClient.delete(`/services/${id}`);
};
