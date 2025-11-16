import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeAny } from "../middleware/authorize.js";
import {
  listTourismStaff,
  getTourismStaffById,
  createTourismStaff,
  updateTourismStaff,
  changeTourismStaffStatus,
  resetTourismStaffPassword,
} from "../controller/admin/TourismStaffManagementController.js";

const router = express.Router();

// All endpoints require authentication and manage_users permission (super admin / tourism head)
router.use(authenticate, authorizeAny('manage_users', 'manage_tourism_staff'));

router.get('/', listTourismStaff);
router.get('/:id', getTourismStaffById);
router.post('/', createTourismStaff);
router.put('/:id', updateTourismStaff);
router.patch('/:id/status', changeTourismStaffStatus);
router.post('/:id/reset-password', resetTourismStaffPassword);

export default router;
