/**
 * Address Routes
 * Province, Municipality, and Barangay address lookups
 */
import { Router } from 'express';
import * as addressController from '../../controllers/address.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';

const router = Router();

// Provinces
router.get('/provinces', asyncHandler(addressController.getAllProvinces));
router.get('/provinces/:id', asyncHandler(addressController.getProvinceById));
router.get('/provinces/:id/municipalities', asyncHandler(addressController.getMunicipalitiesByProvinceId));

// Municipalities
router.get('/municipalities', asyncHandler(addressController.getAllMunicipalities));
router.get('/municipalities/:id', asyncHandler(addressController.getMunicipalityById));
router.get('/municipalities/:id/barangays', asyncHandler(addressController.getBarangaysByMunicipalityId));

// Barangays
router.get('/barangays', asyncHandler(addressController.getAllBarangays));
router.get('/barangays/:id', asyncHandler(addressController.getBarangayById));
router.get('/barangays/:id/full-address', asyncHandler(addressController.getFullAddressByBarangayId));

export default router;
