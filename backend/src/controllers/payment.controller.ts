import { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import pool from "../config/db";
import dotenv from "dotenv";

dotenv.config();

// Initialize Razorpay
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

// ==========================================
// 1. PUBLIC: CREATE RAZORPAY ORDER
// ==========================================
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const order = await instance.orders.create({
      amount: amount * 100, // INR paise
      currency: "INR",
      receipt: "donation_" + Date.now(),
    });

    res.json(order);
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({ message: "Failed to create payment order" });
  }
};

// ==========================================
// 2. PUBLIC: VERIFY PAYMENT & SAVE
// ==========================================
export const verifyPayment = async (req: Request, res: Response) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    donationData,
  } = req.body;

  // 1️⃣ Basic validation
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: "Missing payment details" });
  }

  try {
    // 2️⃣ DUPLICATE CHECK
    // CHANGED: Table 'donations' -> 'payments'
    const existing = await pool.query(
      `SELECT id FROM payments WHERE razorpay_payment_id = $1`,
      [razorpay_payment_id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Payment already processed" });
    }

    // 3️⃣ Signature verification
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // 4️⃣ Store donation
    // CHANGED: Table 'donations' -> 'payments'
    await pool.query(
      `INSERT INTO payments 
       (name, email, amount, purpose, payment_status, razorpay_order_id, razorpay_payment_id, razorpay_signature, donated_at)
       VALUES ($1, $2, $3, $4, 'SUCCESS', $5, $6, $7, NOW())`,
      [
        donationData?.name || 'Anonymous',
        donationData?.email || 'No Email',
        donationData?.amount,
        donationData?.purpose || 'General Donation',
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      ]
    );

    res.json({ message: "Payment verified & donation recorded" });

  } catch (error: any) {
    console.error("PAYMENT VERIFY ERROR:", error);
    if (error.code === "23505") {
      return res.status(409).json({ message: "Duplicate payment detected" });
    }
    res.status(500).json({ message: "Internal payment verification error" });
  }
};

// ==========================================
// 3. ADMIN: GET ALL PAYMENTS
// ==========================================
// RENAMED: getAllDonations -> getAllPayments
export const getAllPayments = async (_req: Request, res: Response) => {
  try {
    // CHANGED: Table 'donations' -> 'payments'
    const result = await pool.query(
      `SELECT * FROM payments ORDER BY donated_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("GET PAYMENTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};

// ==========================================
// 4. ADMIN: MANUAL ENTRY (Offline/Cash/Bank)
// ==========================================
// RENAMED: createManualDonation -> createManualPayment
export const createManualPayment = async (req: Request, res: Response) => {
  try {
    const { name, email, amount, purpose, transaction_id } = req.body;

    const manualTxnId = transaction_id || `OFFLINE_${Date.now()}`;

    // CHANGED: Table 'donations' -> 'payments'
    // CHANGED: Saved manualTxnId into 'transaction_id' column
    const result = await pool.query(
      `INSERT INTO payments 
       (name, email, amount, purpose, payment_status, transaction_id, currency, donated_at)
       VALUES ($1, $2, $3, $4, 'OFFLINE', $5, 'INR', NOW())
       RETURNING *`,
      [
        name, 
        email, 
        amount, 
        purpose || 'Offline Donation',
        manualTxnId 
      ]
    );

    res.status(201).json({ 
      message: "Offline Donation Recorded", 
      donation: result.rows[0] 
    });

  } catch (error) {
    console.error("MANUAL ENTRY ERROR:", error);
    res.status(500).json({ message: "Failed to record donation" });
  }
};