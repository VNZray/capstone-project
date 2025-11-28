import express from "express";
import * as roomController from "../controller/accommodation/roomController.js"; // Add `.js` extension
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

router.post("/", roomController.insertRoom);
router.get("/", roomController.getAllRoom);
router.get("/profile/:id", roomController.getRoomById);
router.get("/:id", roomController.getRoomByBusinessId);
router.put("/:id", roomController.updateRoom);
router.delete("/:id", roomController.deleteRoom);

export default router;
