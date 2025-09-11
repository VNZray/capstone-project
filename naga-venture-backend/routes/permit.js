import express from "express";
import * as permitController from "../controller/permitController.js";

const router = express.Router();

router.post("/", permitController.UploadPermit);
router.get("/:id", permitController.getPermitByBusinessId);

export default router;
