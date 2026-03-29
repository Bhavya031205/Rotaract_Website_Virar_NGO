import { Request, Response } from "express";
import crypto from "crypto";
import pool from "../config/db";

export const razorpayWebhook = async (req: Request, res: Response) => {
  try {
    // 1️⃣ Verify Signature
    // req.body must be a RAW BUFFER. Ensure bodyParser.raw is used in index.ts for this route.
    const signature = req.headers["x-razorpay-signature"] as string;
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.error("CRITICAL: RAZORPAY_WEBHOOK_SECRET is missing in .env");
      return res.status(500).json({ message: "Server config error" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.body)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("⚠️ Invalid Webhook Signature");
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    // 2️⃣ Parse the Event
    const event = JSON.parse(req.body.toString());

    // 3️⃣ Handle 'payment.captured'
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;

      // Extract details (Razorpay sometimes sends email/contact in payload)
      // If missing, we use "Webhook Fallback" so the DB doesn't crash.
      const donorEmail = payment.email || "anonymous@webhook.com";
      const donorPhone = payment.contact || "";
      const donorName = "Anonymous (Webhook)"; // Webhooks often lack names unless passed in 'notes'

      // 4️⃣ Duplicate Check (Has the frontend already saved this?)
      const exists = await pool.query(
        `SELECT id FROM donations WHERE razorpay_payment_id = $1`,
        [payment.id]
      );

      if (exists.rows.length === 0) {
        // Insert missing record
        await pool.query(
          `INSERT INTO donations 
           (name, email, amount, purpose, payment_status, razorpay_payment_id, razorpay_order_id, donated_at)
           VALUES ($1, $2, $3, $4, 'SUCCESS', $5, $6, NOW())`,
          [
            donorName,
            donorEmail,
            payment.amount / 100, // Convert paise to INR
            "General Donation (Recovered)",
            payment.id,
            payment.order_id
          ]
        );
        console.log(`✅ Webhook Recovered Donation: ₹${payment.amount / 100} (${payment.id})`);
      } else {
        console.log(`ℹ️ Webhook: Donation ${payment.id} already exists. Skipping.`);
      }
    }

    // Always return 200 OK to Razorpay to acknowledge receipt
    res.status(200).json({ status: "ok" });

  } catch (error) {
    console.error("WEBHOOK ERROR:", error);
    // Return 200 even on error so Razorpay doesn't retry infinitely
    res.status(200).json({ status: "error_logged" });
  }
};