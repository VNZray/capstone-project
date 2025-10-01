import express from "express";
import * as permitController from "../controller/permitController.js";

const router = express.Router();

router.post("/", permitController.UploadPermit);
router.get("/:id", permitController.getPermitByBusinessId);
router.get("/", permitController.getAllPermits);
router.delete("/:id", permitController.deletePermit);
router.put("/:id", permitController.updatePermit);

export default router;
