import express from "express";
import * as categoryAndTypeController from "../controller/categoryAndTypeController.js"; // Add `.js` extension

const router = express.Router();

router.get("/all-type", categoryAndTypeController.getAllTypes);
router.get(
  "/business-type",
  categoryAndTypeController.getAccommodationAndShopTypes
);
router.get("/category/:id", categoryAndTypeController.getCategory);

export default router;
