import businessApiClient from '@/services/api/businessApiClient';
import type { Service, ServiceCategory } from '@/types/Service';

/** Fetch Services by Business ID */
export const fetchServicesByBusinessId = async (
  businessId: string
): Promise<Service[]> => {
  const { data } = await businessApiClient.get<Service[]>(`/services/business/${businessId}`);
  return data;
};

/** Fetch Service Categories by Business ID */
export const fetchServiceCategoriesByBusinessId = async (
  businessId: string
): Promise<ServiceCategory[]> => {
  const { data } = await businessApiClient.get<ServiceCategory[]>(
    `/service-categories/business/${businessId}`
  );
  return data;
};

/** Fetch Single Service */
export const fetchServiceById = async (serviceId: string): Promise<Service> => {
  const { data } = await businessApiClient.get<Service>(`/services/${serviceId}`);
  return data;
};
