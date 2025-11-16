import express from "express";
import * as businessController from "../controller/BusinessController.js"; // Add `.js` extension

const router = express.Router();

router.post("/", businessController.insertBusinessHours);
router.get("/", businessController.getBusinessHours);
router.put("/:id", businessController.updateBusinessHours);

export default router;
