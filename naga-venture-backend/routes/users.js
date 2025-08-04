import express from 'express';
import * as userController from '../controller/userController.js'; // Add `.js` extension

const router = express.Router();

router.get('/', userController.getAllUsers);
router.get('/tourism/:id', userController.getTourismId);
router.get('/tourist/:id', userController.getTouristId);
router.get('/owner/:id', userController.getOwnerId);
router.post('/', userController.createUser);
router.put('/tourist/:id', userController.updateTourist);
router.put('/owner/:id', userController.updateOwner);
router.put('/tourism/:id', userController.updateTourism);
router.delete('/:id', userController.deleteUser);

export default router;