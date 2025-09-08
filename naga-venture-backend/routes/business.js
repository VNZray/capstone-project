import express from "express";
import * as businessController from "../controller/businessController.js"; // Add `.js` extension

const router = express.Router();

router.get("/", businessController.getAllBusiness);
router.post("/", businessController.insertBusiness);
router.get("/:id", businessController.getBusinessId);
router.put("/:id", businessController.updateBusiness);
router.get("/owner/:id", businessController.getBusinessByOwnerId);
router.delete("/:id", businessController.deleteBusiness);
router.post("/hours", businessController.insertBusinessHours);
router.get("/hours", businessController.getBusinessHours);
router.put("/hours/:id", businessController.updateBusinessHours);

export default router;
