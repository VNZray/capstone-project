import express from 'express';
import * as touristSpotController from '../controller/touristSpotController.js';
import * as touristSpotCategoryController from '../controller/touristSpotCategoryController.js';

const router = express.Router();

// Get all tourist spots
router.get('/', touristSpotController.getAllTouristSpots);

// Get categories and types
router.get('/categories-types', touristSpotController.getCategoriesAndTypes);

// Get location data
router.get('/location-data', touristSpotController.getLocationData);

// Get municipalities by province
router.get('/municipalities/:province_id', touristSpotController.getMunicipalitiesByProvince);

// Get barangays by municipality
router.get('/barangays/:municipality_id', touristSpotController.getBarangaysByMunicipality);

// Get tourist spot by ID
router.get('/:id', touristSpotController.getTouristSpotById);

// Categories management for tourist spots
router.get('/:id/categories', touristSpotCategoryController.getTouristSpotCategories);
router.put('/:id/categories', touristSpotCategoryController.updateTouristSpotCategories);

// Schedules endpoints
router.get('/:id/schedules', touristSpotController.getTouristSpotSchedules);
router.put('/:id/schedules', touristSpotController.upsertTouristSpotSchedules);

// Image management endpoints
router.get('/:tourist_spot_id/images', touristSpotController.getTouristSpotImages);
router.post('/:tourist_spot_id/images', touristSpotController.addTouristSpotImage);
router.put('/:tourist_spot_id/images/:image_id', touristSpotController.updateTouristSpotImage);
router.delete('/:tourist_spot_id/images/:image_id', touristSpotController.deleteTouristSpotImage);
router.put('/:tourist_spot_id/images/:image_id/set-primary', touristSpotController.setPrimaryTouristSpotImage);

// Create new tourist spot
router.post('/', touristSpotController.createTouristSpot);

// Submit edit request for existing tourist spot
router.put('/:id', touristSpotController.submitEditRequest);

// Update tourist spot directly (admin only)
router.patch('/:id', touristSpotController.updateTouristSpot);

export default router;