import { Request, Response } from "express";
import pool from "../config/db";
import razorpay from "../config/razorpay";
import crypto from "crypto";

// ==========================================
// 1. PUBLIC: CREATE RAZORPAY ORDER
// ==========================================
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // Razorpay expects amount in PAISA (e.g., 500 INR = 50000 paisa)
    const options = {
      amount: Number(amount) * 100, 
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);

  } catch (error) {
    console.error("RAZORPAY ORDER ERROR:", error);
    res.status(500).json({ message: "Could not initiate payment" });
  }
};

// ==========================================
// 2. PUBLIC: VERIFY & SAVE ONLINE DONATION
// ==========================================
export const verifyPayment = async (req: Request, res: Response) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    donationData, // Contains: { name, email, amount, purpose }
  } = req.body;

  try {
    // A. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid Payment Signature" });
    }

    // B. Check for Duplicates (using transaction_id column)
    const check = await pool.query(
      "SELECT id FROM donations WHERE transaction_id = $1",
      [razorpay_payment_id]
    );

    if (check.rows.length > 0) {
      return res.status(200).json({ message: "Payment already recorded" });
    }

    // C. Save to Database (ONLINE SUCCESS)
    // Note: Online donations might not have city/state/phone unless you added those fields to the online form too.
    const result = await pool.query(
      `INSERT INTO donations 
       (name, email, amount, purpose, payment_method, payment_status, transaction_id, order_id, created_at)
       VALUES ($1, $2, $3, $4, 'ONLINE', 'SUCCESS', $5, $6, NOW())
       RETURNING *`,
      [
        donationData.name,
        donationData.email,
        donationData.amount,
        donationData.purpose || 'General Donation',
        razorpay_payment_id, // Maps to transaction_id
        razorpay_order_id    // Maps to order_id
      ]
    );

    res.status(201).json({ 
      message: "Donation Successful!", 
      donation: result.rows[0] 
    });

  } catch (error) {
    console.error("VERIFY ERROR:", error);
    res.status(500).json({ message: "Payment Verified but Storage Failed (Contact Support)" });
  }
};

// ==========================================
// 3. PUBLIC: MANUAL QR ENTRY (Pending Verification)
// ==========================================
export const createManualDonation = async (req: Request, res: Response) => {
  try {
    // Extract new fields from the Frontend QR Form
    const { name, email, phone, amount, transaction_id, city, state } = req.body;

    // Validation
    if (!name || !email || !amount || !transaction_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if this Transaction ID was already submitted
    const check = await pool.query(
      "SELECT id FROM donations WHERE transaction_id = $1",
      [transaction_id]
    );

    if (check.rows.length > 0) {
      return res.status(409).json({ message: "This Transaction ID has already been submitted." });
    }

    // Insert as 'QR_MANUAL' and 'PENDING'
    const result = await pool.query(
      `INSERT INTO donations 
       (name, email, phone, amount, transaction_id, payment_method, payment_status, city, state, created_at)
       VALUES ($1, $2, $3, $4, $5, 'QR_MANUAL', 'PENDING', $6, $7, NOW())
       RETURNING id`,
      [name, email, phone, amount, transaction_id, city, state]
    );

    res.status(201).json({ 
      success: true, 
      message: "Details submitted. Receipt will be emailed after verification.",
      donationId: result.rows[0].id
    });

  } catch (error) {
    console.error("MANUAL DONATION ERROR:", error);
    res.status(500).json({ success: false, message: "Server error recording donation." });
  }
};

// ==========================================
// 4. ADMIN: GET ALL DONATIONS
// ==========================================
export const getAllDonations = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT * FROM donations 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("GET DONATIONS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch donations" });
  }
};

// SOFT DELETE DONATION (Archive it, don't erase it)
export const deleteDonation = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    // Instead of DELETE FROM, we UPDATE the flag
    const result = await pool.query(
      "UPDATE donations SET is_deleted = true WHERE id = $1 RETURNING *", 
      [id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Donation not found" });
    }
    
    res.json({ message: "Donation archived successfully" });
  } catch (error) {
    console.error("DELETE DONATION ERROR:", error);
    res.status(500).json({ message: "Failed to archive donation" });
  }
};