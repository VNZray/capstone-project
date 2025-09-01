import axios from 'axios';
import api from '@/src/services/api';
import type {
  Business,
  BusinessListItem,
  BusinessFilters,
  TypeOption,
  CategoryOption,
} from '@/src/types/Business';

// Shape returned by backend (raw business row)
interface JoinedBusinessRow extends Business {
  category_name?: string;
  type_name?: string;
  province?: string;
  municipality?: string;
  barangay?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number; // total BEFORE pagination
  page: number;
  pageSize: number;
}

// Client-side pagination & filtering for MVP
function applyClientFilters(
  items: BusinessListItem[],
  { q, status, type_id, category_id }: BusinessFilters,
): BusinessListItem[] {
  return items.filter((b) => {
    if (q && !b.business_name.toLowerCase().includes(q.toLowerCase())) return false;
    if (status && status !== 'All' && b.status !== status) return false;
    if (type_id && type_id !== 'All' && b.business_type_id !== type_id) return false;
    if (category_id && category_id !== 'All' && b.business_category_id !== category_id) return false;
    return true;
  });
}

async function fetchRawBusinesses(): Promise<BusinessListItem[]> {
  const { data } = await axios.get<{ success: boolean; data: JoinedBusinessRow[] }>(`${api}/business/joined/list`);
  return (data.data || []).map((r) => ({
    ...r,
    category: r.category_name,
    type: r.type_name,
  }));
}

export const BusinessService = {
  async list(options: {
    page?: number;
    pageSize?: number;
    filters?: BusinessFilters;
  } = {}): Promise<PaginatedResult<BusinessListItem>> {
    const { page = 1, pageSize = 10, filters = {} } = options;
  const raw = await fetchRawBusinesses();
  const filtered = applyClientFilters(raw, filters);
    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);
    return {
      data: paged,
      total: filtered.length,
      page,
      pageSize,
    };
  },

  async get(id: string): Promise<Business> {
    const { data } = await axios.get<Business>(`${api}/business/${id}`);
    return data;
  },

  async create(payload: Partial<Business>): Promise<Business> {
    const { data } = await axios.post(`${api}/business`, payload);
    return data;
  },

  async update(id: string, patch: Partial<Business>): Promise<Business> {
    const { data } = await axios.put(`${api}/business/${id}`, patch);
    return data;
  },

  // Placeholder for soft delete (will become status change or deleted_at when backend supports)
  async remove(id: string, hard = false): Promise<void> {
    if (hard) {
      await axios.delete(`${api}/business/${id}`);
    } else {
      // Soft delete fallback: set status Inactive
      await axios.put(`${api}/business/${id}`, { status: 'Inactive' });
    }
  },

  // Types (Shop + Accommodation)
  async getBusinessTypes(): Promise<TypeOption[]> {
  // Correct path: /api/category-and-type/business-type
  const { data } = await axios.get<TypeOption[]>(`${api}/category-and-type/business-type`);
    return data;
  },

  async getCategoriesByTypeId(typeId: number): Promise<CategoryOption[]> {
  // Correct path: /api/category-and-type/category/:id
  const { data } = await axios.get<CategoryOption[]>(`${api}/category-and-type/category/${typeId}`);
    return data.map((c) => ({ ...c, type_id: typeId }));
  },

  // Location endpoints
  async getProvinces() {
  const { data } = await axios.get<{ id: number; province: string }[]>(`${api}/address/provinces`); // trailing slash not required
    return data;
  },
  async getMunicipalitiesByProvince(provinceId: number) {
    const { data } = await axios.get<{ id: number; municipality: string; province_id: number }[]>(`${api}/address/municipalities/${provinceId}`);
    return data;
  },
  async getBarangaysByMunicipality(municipalityId: number) {
    const { data } = await axios.get<{ id: number; barangay: string; municipality_id: number }[]>(`${api}/address/barangays/${municipalityId}`);
    return data;
  },
};

export default BusinessService;
