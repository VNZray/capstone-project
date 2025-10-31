import express from "express";
import * as roomAmenityController from "../controller/accommodation/roomAmenityController.js"; // Add `.js` extension

const router = express.Router();

router.get("/", roomAmenityController.getAllData);
router.post("/", roomAmenityController.insertData);
router.put("/", roomAmenityController.updateData);
router.delete("/:id", roomAmenityController.deleteData);

export default router;
