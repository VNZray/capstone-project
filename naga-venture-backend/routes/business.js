import express from "express";
import * as businessController from "../controller/businessController.js"; // Add `.js` extension

const router = express.Router();

router.get("/", businessController.getAllBusiness);
router.post("/", businessController.insertBusiness);
router.get("/:id", businessController.getBusinessId);

router.get("/owner/:id", businessController.getBusinessByOwnerId);

export default router;
