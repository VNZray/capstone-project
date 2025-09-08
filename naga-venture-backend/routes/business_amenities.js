import express from "express";
import * as businessAmenityController from "../controller/businessAmenityController.js"; // Add `.js` extension

const router = express.Router();

router.get("/", businessAmenityController.getAllData);
router.post("/", businessAmenityController.insertData);
router.put("/", businessAmenityController.updateData);
router.delete("/:id", businessAmenityController.deleteData);

export default router;

