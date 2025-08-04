import express from 'express';
import * as touristSpotController from '../controller/touristSpotController'; // Add `.js` extension

const router = express.Router();

router.get('/', touristSpotController.getAllUsers);
router.get('/:id', touristSpotController.getTourismId);
router.post('/', touristSpotController.createUser);
router.put('/:id', touristSpotController.updateTourist);
router.delete('/:id', touristSpotController.deleteUser);

export default router;