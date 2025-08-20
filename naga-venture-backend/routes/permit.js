import express from "express";
import * as permitController from "../controller/permitController.js"; // Add `.js` extension

const router = express.Router();

router.post("/", permitController.UploadPermit);

export default router;
