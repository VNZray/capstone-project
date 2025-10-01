import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../utils/errorHandler.js";

// Get all payments
export async function getAllPayments(req, res) {
  try {
    const [data] = await db.query("CALL GetAllPayments()");
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get payment by payer ID
export async function getPaymentByPayerId(req, res) {
  const { payer_id } = req.params;
  try {
    const [data] = await db.query("CALL GetPaymentByPayerId(?)", [payer_id]);
    if (!data[0] || data[0].length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get payment by ID
export async function getPaymentById(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL GetPaymentById(?)", [id]);
    if (!data[0] || data[0].length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json(data[0][0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Insert a new payment
export async function insertPayment(req, res) {
  try {
    const id = uuidv4();
    const created_at = new Date();
    const {
      payer_type,
      payment_type,
      payment_method,
      amount,
      status,
      payment_for,
      payer_id,
      payment_for_id,
    } = req.body;

    // Basic validation
    const missing = [];
    if (!payer_type) missing.push("payer_type");
    if (!payment_method) missing.push("payment_method");
    if (amount === undefined) missing.push("amount");
    if (!payer_id) missing.push("payer_id");
    if (!payment_for_id) missing.push("payment_for_id");
    if (missing.length) {
      return res
        .status(400)
        .json({ error: "Missing required fields", fields: missing });
    }

    const params = [
      id,
      payer_type,
      payment_type ?? null,
      payment_method,
      amount,
      status ?? null,
      payment_for ?? null,
      payer_id,
      payment_for_id,
      created_at,
    ];

    const [result] = await db.query(
      `CALL InsertPayment(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params
    );

    res.status(201).json({
      message: "Payment created successfully",
      ...result[0][0],
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update payment
export async function updatePayment(req, res) {
  const { id } = req.params;
  try {
    const {
      payer_type,
      payment_type,
      payment_method,
      amount,
      status,
      payment_for,
      payer_id,
      payment_for_id,
    } = req.body;

    const params = [
      id,
      payer_type ?? null,
      payment_type ?? null,
      payment_method ?? null,
      amount ?? null,
      status ?? null,
      payment_for ?? null,
      payer_id ?? null,
      payment_for_id ?? null,
    ];

    const [result] = await db.query(
      `CALL UpdatePayment(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params
    );

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({
      message: "Payment updated successfully",
      ...result[0][0],
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Delete payment
export async function deletePayment(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL DeletePayment(?)", [id]);
    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
}
