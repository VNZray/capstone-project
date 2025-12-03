import express from "express";
import * as ownerController from '../controller/auth/OwnerController.js'
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

// Owner registration is public (part of user signup flow)
router.post("/", ownerController.insertOwner);
// All other routes require authentication
router.get("/:id", authenticate, ownerController.getOwnerById);
router.get("/", authenticate, authorizeRole("Admin"), ownerController.getAllOwners);
router.get("/user/:user_id", authenticate, ownerController.getOwnerByUserId);
router.put("/:id", authenticate, ownerController.updateOwnerById);
router.delete("/:id", authenticate, authorizeRole("Admin"), ownerController.deleteOwnerById);

export default router;
