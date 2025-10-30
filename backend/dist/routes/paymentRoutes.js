import express from "express";
import * as paymentController from "../controller/paymentController.js";

const router = express.Router();

router.post("/", paymentController.insertPayment);
router.get("/:id", paymentController.getPaymentById);
router.get("/", paymentController.getAllPayments);
router.delete("/:id", paymentController.deletePayment);
router.put("/:id", paymentController.updatePayment);
router.get("/payer/:payer_id", paymentController.getPaymentByPayerId);

export default router;
