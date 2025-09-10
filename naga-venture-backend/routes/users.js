import express from 'express';
import * as userController from '../controller/userController.js'; // Add `.js` extension

const router = express.Router();

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.get('/tourism/:id', userController.getUserByTourismId);
router.get('/tourist/:id', userController.getUserByTouristId);
router.get('/owner/:id', userController.getUserByOwnerId);
router.post('/', userController.createUser);
router.put('/tourist/:id', userController.updateTourist);
router.put('/owner/:id', userController.updateOwner);
router.put('/tourism/:id', userController.updateTourism);
router.delete('/:id', userController.deleteUser);
router.post('/login', userController.loginUser);

export default router;