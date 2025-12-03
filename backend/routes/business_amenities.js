import express from "express";
import * as businessAmenityController from "../controller/businessAmenityController.js"; // Add `.js` extension
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

router.get("/", businessAmenityController.getAllData);
router.post("/", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), businessAmenityController.insertData);
router.put("/", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), businessAmenityController.updateData);
router.delete("/:id", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), businessAmenityController.deleteData);

export default router;

