import express from "express";
import {
  insertRoomPhoto,
  getAllRoomPhotos,
  getRoomPhotoById,
  getRoomPhotosByRoomId,
  updateRoomPhotoById,
  deleteRoomPhotoById,
  deleteRoomPhotosByRoomId,
} from "../controller/accommodation/roomPhotosController.js";

const router = express.Router();

// Create a new room photo
router.post("/", insertRoomPhoto);

// Get all room photos
router.get("/", getAllRoomPhotos);

// Get room photo by ID
router.get("/:id", getRoomPhotoById);

// Get all photos for a specific room
router.get("/room/:room_id", getRoomPhotosByRoomId);

// Update room photo by ID
router.put("/:id", updateRoomPhotoById);

// Delete room photo by ID
router.delete("/:id", deleteRoomPhotoById);

// Delete all photos for a specific room
router.delete("/room/:room_id", deleteRoomPhotosByRoomId);

export default router;
