import express from "express";
import * as roomAmenityController from "../controller/roomAmenityController.js"; // Add `.js` extension

const router = express.Router();

router.get("/", roomAmenityController.getAllData);
router.post("/", roomAmenityController.insertData);
router.get("/details", roomAmenityController.getRoomAmenities);

export default router;

