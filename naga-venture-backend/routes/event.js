import express from "express";
import * as eventController from "../controller/eventController.js";

const router = express.Router();

router.post("/", eventController.insertData);
router.post("/debug", eventController.debugEventCreation);
router.get("/", eventController.getAllData);
router.get("/categories", eventController.getEventCategories);
router.get("/:id", eventController.getDataById);
router.put("/:id", eventController.updateData);
router.delete("/:id", eventController.deleteData);

export default router;

