import axios from 'axios';
import api from '@/services/api';
import type { Service, ServiceCategory } from '@/types/Service';

/** Fetch Services by Business ID */
export const fetchServicesByBusinessId = async (
  businessId: string
): Promise<Service[]> => {
  const { data } = await axios.get<Service[]>(`${api}/services/business/${businessId}`);
  return data;
};

/** Fetch Service Categories by Business ID */
export const fetchServiceCategoriesByBusinessId = async (
  businessId: string
): Promise<ServiceCategory[]> => {
  const { data } = await axios.get<ServiceCategory[]>(
    `${api}/service-categories/business/${businessId}`
  );
  return data;
};

/** Fetch Single Service */
export const fetchServiceById = async (serviceId: string): Promise<Service> => {
  const { data } = await axios.get<Service>(`${api}/services/${serviceId}`);
  return data;
};
