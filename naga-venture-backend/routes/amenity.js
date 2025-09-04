import express from "express";
import * as amenityController from "../controller/amenityController.js"; // Add `.js` extension

const router = express.Router();

router.get("/", amenityController.getAmenities);
router.post("/", amenityController.insertData);

export default router;
