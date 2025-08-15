import express from 'express';
import * as addressController from '../controller/addressController.js'; // Add `.js` extension

const router = express.Router();

router.get('/provinces/', addressController.getAllProvinces);
router.get('/province/:id', addressController.getProvinceById);
router.get('/municipalities', addressController.getAllMunicipalities);
router.get('/municipality/:id', addressController.getMunicipalityById);
router.get('/barangays', addressController.getAllBarangays);
router.get('/municipalities/:id', addressController.getMunicipalitiesByProvinceId);
router.get('/barangays/:id', addressController.getBarangaysByMunicipalityId);
router.get('/barangay/:id', addressController.getBarangayById);

export default router;
