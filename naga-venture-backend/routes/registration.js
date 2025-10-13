import express from "express";
import * as businessController from "../controller/businessController.js"; // Add `.js` extension

const router = express.Router();

router.get("/", businessController.getAllBusinessRegistrations);
// business registration routes
router.post("/", businessController.registerBusiness);
router.put("/:id", businessController.updateBusinessRegistration);
router.get("/:id", businessController.getBusinessRegistrationById);
router.delete("/:id", businessController.deleteBusinessRegistration);

export default router;
