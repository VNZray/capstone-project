import express from "express";
import * as ownerController from "../controller/ownerController.js";

const router = express.Router();

router.post("/", ownerController.insertOwner);
router.get("/:id", ownerController.getOwnerById);
router.get("/", ownerController.getAllOwners);

export default router;
