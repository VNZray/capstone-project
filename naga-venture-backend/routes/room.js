import express from "express";
import * as roomController from "../controller/roomController.js"; // Add `.js` extension

const router = express.Router();

router.post("/", roomController.insertRoom);
router.get("/", roomController.getAllRoom);
router.get("/:status", roomController.getAllRoomByStatus);
router.get("/:id", roomController.getRoomByBusinessId);
router.get("/:id/:status", roomController.getRoomByBusinessIdandStatus);
router.put("/:id", roomController.updateRoom);
router.delete("/:id", roomController.deleteRoom);

export default router;
