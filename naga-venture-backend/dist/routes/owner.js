import express from "express";
import * as ownerController from '../controller/ownerController.js'

const router = express.Router();

router.post("/", ownerController.insertOwner);
router.get("/:id", ownerController.getOwnerById);
router.get("/", ownerController.getAllOwners);
router.get("/user/:user_id", ownerController.getOwnerByUserId);
router.put("/:id", ownerController.updateOwnerById);
router.delete("/:id", ownerController.deleteOwnerById);

export default router;
