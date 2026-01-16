import express from 'express';
import * as tourismController from '../controller/auth/TourismController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRole, authorizeAny } from '../middleware/authorizeRole.js';

const router = express.Router();

// All tourism routes require authentication and admin/tourism role
router.use(authenticate);

// Get all tourism staff (Admin/Tourism Officer only)
router.get('/', authorizeAny('view_all_profiles', 'manage_tourism_staff'), tourismController.getAllTourism);

// Get tourism by ID
router.get('/:id', authorizeAny('view_all_profiles', 'manage_tourism_staff'), tourismController.getTourismById);

// Create tourism staff
router.post('/', authorizeAny('manage_users', 'manage_tourism_staff'), tourismController.createTourism);

// Update tourism staff
router.put('/:id', authorizeAny('manage_users', 'manage_tourism_staff'), tourismController.updateTourism);

// Delete tourism staff
router.delete('/:id', authorizeAny('manage_users', 'manage_tourism_staff'), tourismController.deleteTourism);

// Get tourism by user ID
router.get('/user/:user_id', tourismController.getTourismByUserId);

export default router;
