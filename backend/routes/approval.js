import express from 'express';
import * as approvalController from '../controller/approval/approvalController.js';
import { getApprovalRecords } from '../controller/approval/approvalRecordController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRole, authorize, authorizeAny } from '../middleware/authorizeRole.js';

const router = express.Router();

// All approval routes require platform scope (Admin/Tourism roles)
router.use(authenticate, authorizeRole('Admin', 'Tourism Officer'));

// Tourist spot specific endpoints
router.get('/pending-spots', authorizeAny('approve_tourist_spot', 'view_all_profiles'), approvalController.getPendingTouristSpots);
router.put('/approve-spot/:id', authorize('approve_tourist_spot'), approvalController.approveTouristSpot);
router.put('/reject-spot/:id', authorize('approve_tourist_spot'), approvalController.rejectTouristSpot);

// Business approval endpoints
router.get('/pending-businesses', authorizeAny('approve_business', 'view_all_profiles'), approvalController.getPendingBusinesses);
router.put('/approve-business/:id', authorize('approve_business'), approvalController.approveBusiness);
router.put('/reject-business/:id', authorize('approve_business'), approvalController.rejectBusiness);

// Tourist spot edit request endpoints

router.get('/pending-edits', authorizeAny('approve_tourist_spot', 'view_all_profiles'), approvalController.getPendingEditRequests);
router.put('/approve-edit/:id', authorize('approve_tourist_spot'), approvalController.approveEditRequest);
router.put('/reject-edit/:id', authorize('approve_tourist_spot'), approvalController.rejectEditRequest);

// Deletion request endpoints
router.get('/pending-deletions', approvalController.getPendingDeletionRequests);
router.put('/approve-deletion/:id', approvalController.approveDeletionRequest);
router.put('/reject-deletion/:id', approvalController.rejectDeletionRequest);

// Approval records log endpoint
router.get('/records', authorizeAny('view_reports', 'view_all_profiles'), getApprovalRecords);

// Event approval endpoints
router.get('/pending-events', authorizeAny('approve_event', 'view_all_profiles'), approvalController.getPendingEvents);
router.put('/approve-event/:id', authorize('approve_event'), approvalController.approveEvent);
router.put('/reject-event/:id', authorize('approve_event'), approvalController.rejectEvent);

export default router;
