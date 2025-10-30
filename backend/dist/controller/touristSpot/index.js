// Main tourist spot operations
export {
  getAllTouristSpots,
  getTouristSpotById,
  createTouristSpot,
} from './touristSpotController.js';

// Schedule management
export {
  getTouristSpotSchedules,
  upsertTouristSpotSchedules
} from './scheduleController.js';

// Image management
export {
  getTouristSpotImages,
  addTouristSpotImage,
  updateTouristSpotImage,
  deleteTouristSpotImage,
  setPrimaryTouristSpotImage
} from './imageController.js';

// Categories and types
export {
  getCategoriesAndTypes
} from './categoriesController.js';

// Location data
export {
  getLocationData,
  getMunicipalitiesByProvince,
  getBarangaysByMunicipality,
} from './locationController.js';

// Edit requests
export {
  submitEditRequest
} from './editRequestController.js';

// Categories management for tourist spots
export {
  getTouristSpotCategories,
  updateTouristSpotCategories
} from './touristSpotCategoryController.js';