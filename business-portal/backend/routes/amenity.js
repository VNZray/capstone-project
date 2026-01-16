import express from "express";
import * as amenityController from "../controller/amenity/amenityController.js"; // Add `.js` extension

const router = express.Router();

router.get("/:id", amenityController.getAmenityById);
router.get("/", amenityController.getAmenities);
router.post("/", amenityController.insertData);

export default router;
