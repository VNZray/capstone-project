import express from 'express';
import * as touristController from '../controller/TouristController.js'; // Add `.js` extension

const router = express.Router();

router.get('/', touristController.getAllTourists);
router.get('/:id', touristController.getTouristById);
router.post('/', touristController.createTourist);


export default router;