import express from "express";
import * as favoriteController from "../controller/FavoriteController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

router.get("/", favoriteController.getAllFavorites);
router.get("/:id", favoriteController.getFavoriteById);
router.get("/tourist/:tourist_id", favoriteController.getFavoritesByTouristId);
router.post("/", favoriteController.addFavorite);
router.put("/:id", favoriteController.updateFavorite);
router.delete("/:id", favoriteController.deleteFavorite);

export default router;
