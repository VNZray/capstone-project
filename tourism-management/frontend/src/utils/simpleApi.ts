// Simplified API service that follows the team's pattern
import apiClient from "@/src/services/apiClient";

// Generic CRUD operations
export const apiService = {
  getTouristSpots: () => apiClient.get('/tourist-spots'),
  getTouristSpotById: (id: string) => apiClient.get(`/tourist-spots/${id}`),
  createTouristSpot: (data: Record<string, unknown>) => apiClient.post('/tourist-spots', data),
  updateTouristSpot: (id: string, data: Record<string, unknown>) => apiClient.put(`/tourist-spots/${id}`, data),
  deleteTouristSpot: (id: string) => apiClient.delete(`/tourist-spots/${id}`),
  getTouristSpotSchedules: (id: string) => apiClient.get(`/tourist-spots/${id}/schedules`),
  saveTouristSpotSchedules: (id: string, schedules: unknown[]) => 
    apiClient.put(`/tourist-spots/${id}/schedules`, { schedules }),
  getCategoriesAndTypes: () => apiClient.get('/tourist-spots/categories-types'),
  getLocationData: () => apiClient.get('/tourist-spots/location-data'),
  getMunicipalitiesByProvince: (provinceId: number) => apiClient.get(`/tourist-spots/municipalities/${provinceId}`),
  getBarangaysByMunicipality: (municipalityId: number) => apiClient.get(`/tourist-spots/barangays/${municipalityId}`),
  getTouristSpotImages: (touristSpotId: string) => apiClient.get(`/tourist-spots/${touristSpotId}/images`),
  addTouristSpotImage: (touristSpotId: string, imageData: Record<string, unknown>) => 
    apiClient.post(`/tourist-spots/${touristSpotId}/images`, imageData),
  updateTouristSpotImage: (touristSpotId: string, imageId: string, data: Record<string, unknown>) => 
    apiClient.put(`/tourist-spots/${touristSpotId}/images/${imageId}`, data),
  deleteTouristSpotImage: (touristSpotId: string, imageId: string) => 
    apiClient.delete(`/tourist-spots/${touristSpotId}/images/${imageId}`),
  setPrimaryTouristSpotImage: (touristSpotId: string, imageId: string) => 
    apiClient.put(`/tourist-spots/${touristSpotId}/images/${imageId}/set-primary`),
};

export default apiService;
