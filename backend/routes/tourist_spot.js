import express from 'express';
import * as touristSpotController from '../controller/touristSpot/index.js';
import { authenticate } from '../middleware/authenticate.js';

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

// Featured management
router.get('/featured/list', touristSpotController.getFeaturedTouristSpots);
router.get('/featured/non-featured', touristSpotController.getNonFeaturedTouristSpots);
router.put('/featured/:id', touristSpotController.featureTouristSpot);
router.delete('/featured/:id', touristSpotController.unfeatureTouristSpot);

// My Submissions
router.get('/my-submissions', authenticate, touristSpotController.getMySubmittedTouristSpots);

// Get tourist spot by ID
router.get('/:id', touristSpotController.getTouristSpotById);

// Categories management for tourist spots
router.get('/:id/categories', touristSpotController.getTouristSpotCategories);
router.put('/:id/categories', touristSpotController.updateTouristSpotCategories);

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
router.post('/', authenticate, touristSpotController.createTouristSpot);

// Submit edit request for existing tourist spot
router.put('/:id', authenticate, touristSpotController.submitEditRequest);

// Delete tourist spot
router.delete('/:id', authenticate, touristSpotController.deleteTouristSpot);

export default router;