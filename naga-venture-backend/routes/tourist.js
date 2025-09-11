import express from "express";
import * as touristController from "../controller/touristController.js"; // Add `.js` extension

const router = express.Router();

router.get("/", touristController.getAllTourists);
router.get("/:id", touristController.getTouristById);
router.post("/", touristController.createTourist);
router.delete("/:id", touristController.deleteTourist);
router.put("/:id", touristController.updateTourist);

export default router;
