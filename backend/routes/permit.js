import express from "express";
import * as permitController from "../controller/PermitController.js";

const router = express.Router();

router.post("/", permitController.UploadPermit);
router.get("/", permitController.getAllPermits);
router.get("/business/:business_id", permitController.getPermitByBusinessId);
router.put("/:id", permitController.updatePermit);
router.delete("/:id", permitController.deletePermit);

export default router;
