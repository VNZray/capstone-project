import express from 'express';
import * as touristSpotController from '../controller/touristSpotController.js';

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

// Create new tourist spot
router.post('/', touristSpotController.createTouristSpot);

// Update tourist spot
router.put('/:id', touristSpotController.updateTouristSpot);

// Delete tourist spot
router.delete('/:id', touristSpotController.deleteTouristSpot);

export default router;