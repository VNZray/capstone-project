import express from 'express';
import * as approvalController from '../controller/approvalController.js';

const router = express.Router();

// Get approval statistics for all content types
router.get('/stats', approvalController.getApprovalStats);

// Generic endpoints for all content types
router.get('/pending/:contentType', approvalController.getPendingItemsByType);
router.put('/approve/:contentType/:id', approvalController.approveItemByType);

// Backward compatibility endpoints (keeping existing functionality)
router.get('/pending-spots', approvalController.getPendingTouristSpots);
router.put('/approve-spot/:id', approvalController.approveTouristSpot);

// Tourist spot specific endpoints (edit requests)
router.get('/pending-edits', approvalController.getPendingEditRequests);
router.put('/approve-edit/:id', approvalController.approveEditRequest);
router.put('/reject-edit/:id', approvalController.rejectEditRequest);

export default router;
