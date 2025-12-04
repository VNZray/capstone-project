
import express from 'express';
import * as approvalController from '../controller/approvalController.js';
import { getApprovalRecords } from '../controller/approvalRecordController.js';

const router = express.Router();

// Tourist spot specific endpoints
router.get('/pending-spots', approvalController.getPendingTouristSpots);
router.put('/approve-spot/:id', approvalController.approveTouristSpot);
router.put('/reject-spot/:id', approvalController.rejectTouristSpot);

// Business approval endpoints
router.get('/pending-businesses', approvalController.getPendingBusinesses);
router.put('/approve-business/:id', approvalController.approveBusiness);
router.put('/reject-business/:id', approvalController.rejectBusiness);

// Event approval endpoints
router.get('/pending-events', approvalController.getPendingEvents);
router.put('/approve-event/:id', approvalController.approveEvent);
router.put('/reject-event/:id', approvalController.rejectEvent);

// Tourist spot edit request endpoints
router.get('/pending-edits', approvalController.getPendingEditRequests);
router.put('/approve-edit/:id', approvalController.approveEditRequest);
router.put('/reject-edit/:id', approvalController.rejectEditRequest);


// Approval records log endpoint
router.get('/records', getApprovalRecords);

export default router;
