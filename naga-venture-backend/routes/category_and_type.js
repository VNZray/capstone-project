import express from "express";
import * as categoryAndTypeController from "../controller/categoryAndTypeController.js"; // Add `.js` extension

const router = express.Router();

router.get("/all-category", categoryAndTypeController.getAllCategories);
router.get(
  "/business-category",
  categoryAndTypeController.getAccommodationAndShopCategories
);
router.get(
  "/type/:id",
  categoryAndTypeController.getTypes
);

export default router;
