/**
 * Address Routes (Mobile Backend)
 * Handles province, municipality, and barangay lookups for profile editing
 */

import express from "express";
import * as addressController from "../controller/address/addressController.js";

const router = express.Router();

// Provinces
router.get("/provinces/", addressController.getAllProvinces);
router.get("/province/:id", addressController.getProvinceById);

// Municipalities
router.get("/municipalities", addressController.getAllMunicipalities);
router.get("/municipality/:id", addressController.getMunicipalityById);
router.get("/municipalities/:id", addressController.getMunicipalitiesByProvinceId);

// Barangays
router.get("/barangays", addressController.getAllBarangays);
router.get("/barangay/:id", addressController.getBarangayById);
router.get("/barangays/:id", addressController.getBarangaysByMunicipalityId);

// Full address lookup
router.get("/:id", addressController.GetFullAddressByBarangayId);

export default router;
