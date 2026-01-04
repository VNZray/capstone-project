import express from "express";
import * as ownerController from '../controller/auth/OwnerController.js'
import { authenticate } from '../middleware/authenticate.js';
import { authorizeScope, authorize } from '../middleware/authorizeRole.js';

const router = express.Router();

// Owner registration is public (part of user signup flow)
router.post("/", ownerController.insertOwner);
// All other routes require authentication
router.get("/:id", authenticate, ownerController.getOwnerById);
// Platform admin access for all owners
router.get("/", authenticate, authorizeScope('platform'), authorize('view_all_profiles'), ownerController.getAllOwners);
router.get("/user/:user_id", authenticate, ownerController.getOwnerByUserId);
router.put("/:id", authenticate, ownerController.updateOwnerById);
// Delete owner - platform admin only
router.delete("/:id", authenticate, authorizeScope('platform'), authorize('manage_users'), ownerController.deleteOwnerById);

export default router;
