import express from "express";
import * as roomAmenityController from "../controller/accommodation/roomAmenityController.js"; // Add `.js` extension
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

router.get("/", roomAmenityController.getAllData);
router.post("/", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), roomAmenityController.insertData);
router.put("/", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), roomAmenityController.updateData);
router.delete("/:id", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), roomAmenityController.deleteData);

export default router;
