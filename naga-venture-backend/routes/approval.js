import express from 'express';
import * as approvalController from '../controller/approvalController.js';

const router = express.Router();

// Tourist spot specific endpoints
router.get('/pending-spots', approvalController.getPendingTouristSpots);
router.put('/approve-spot/:id', approvalController.approveTouristSpot);
router.put('/reject-spot/:id', approvalController.rejectTouristSpot);

// Tourist spot edit request endpoints
router.get('/pending-edits', approvalController.getPendingEditRequests);
router.put('/approve-edit/:id', approvalController.approveEditRequest);
router.put('/reject-edit/:id', approvalController.rejectEditRequest);

export default router;
