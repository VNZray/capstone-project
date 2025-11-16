import express from 'express';
import * as tourismController from '../controller/auth/TourismController.js'; // Add `.js` extension

const router = express.Router();

router.get('/', tourismController.getAllTourism);
router.get('/:id', tourismController.getTourismById);
router.post('/', tourismController.createTourism);
router.put('/:id', tourismController.updateTourism);
router.delete('/:id', tourismController.deleteTourism);
router.get('/user/:user_id', tourismController.getTourismByUserId);

export default router;