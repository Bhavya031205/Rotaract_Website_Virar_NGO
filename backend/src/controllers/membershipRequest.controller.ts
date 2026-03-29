import { Request, Response } from "express";
import pool from "../config/db";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

// ==========================================
// EMAIL CONFIGURATION
// ==========================================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Set this in your .env
    pass: process.env.EMAIL_PASS  // Set this in your .env (App Password)
  },
});

/**
 * ===============================
 * CREATE MEMBERSHIP REQUEST (PUBLIC)
 * ===============================
 */
export const createMembershipRequest = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, address, work_details, profile_image } = req.body;

    // 1. Validation
    if (!name || !email || !phone) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // 2. Check if User Already Exists (Registered)
    const userCheck = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "A user with this email already exists." });
    }

    // 3. Check for Pending Requests (Duplicate)
    const reqCheck = await pool.query("SELECT id FROM membership_requests WHERE email = $1 AND status = 'PENDING'", [email]);
    if (reqCheck.rows.length > 0) {
      return res.status(400).json({ message: "You already have a pending membership request." });
    }

    // 4. Insert into Database
    const result = await pool.query(
      `INSERT INTO membership_requests 
        (name, email, phone, address, work_details, profile_image, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
       RETURNING *`,
      [name, email, phone, address, work_details, profile_image]
    );

    // 5. SEND EMAIL NOTIFICATION TO ADMIN
    // This runs in the background so the user gets a fast response
    const mailOptions = {
      from: '"NGO Membership System" <no-reply@ngo.org>',
      to: "rotaractclubvirar3141@gmail.com", // 👈 Admin Email
      subject: `📢 New Membership Request: ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 600px;">
          <h2 style="color: #2563EB; margin-top: 0;">New Membership Application</h2>
          <p style="color: #555;">A new request has been received from the "Become a Member" page.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr style="background-color: #f8fafc;">
              <td style="padding: 12px; font-weight: bold; width: 30%; border-bottom: 1px solid #eee;">Name:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #eee;">Email:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">
                <a href="mailto:${email}" style="color: #2563EB; text-decoration: none;">${email}</a>
              </td>
            </tr>
            <tr style="background-color: #f8fafc;">
              <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #eee;">Phone:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #eee;">Address:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${address || 'N/A'}</td>
            </tr>
            <tr style="background-color: #f8fafc;">
              <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #eee;">Work/Bio:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${work_details || 'N/A'}</td>
            </tr>
          </table>

          <div style="margin-top: 30px; text-align: center;">
            <a href="http://localhost:5173/admin/membership-requests" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Review in Dashboard</a>
          </div>
          <p style="font-size: 12px; color: #999; margin-top: 20px; text-align: center;">This is an automated message.</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions).catch(err => console.error("Email sending failed:", err));

    res.status(201).json({
      message: "Membership request submitted successfully",
      request: result.rows[0],
    });

  } catch (error) {
    console.error("CREATE MEMBERSHIP REQUEST ERROR:", error);
    res.status(500).json({ message: "Failed to submit membership request" });
  }
};

/**
 * ===============================
 * GET ALL MEMBERSHIP REQUESTS (ADMIN)
 * ===============================
 */
export const getMembershipRequests = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM membership_requests ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("GET MEMBERSHIP REQUESTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};

/**
 * ===============================
 * APPROVE MEMBERSHIP REQUEST (ADMIN)
 * ===============================
 */
export const approveMembershipRequest = async (req: Request, res: Response) => {
  const requestId = Number(req.params.id);

  const client = await pool.connect(); // Use a client for transaction safety

  try {
    await client.query('BEGIN');

    // 1️⃣ Get membership request
    const requestResult = await client.query(
      "SELECT * FROM membership_requests WHERE id = $1",
      [requestId]
    );

    if (requestResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Request not found" });
    }

    const request = requestResult.rows[0];

    if (request.status === 'APPROVED') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Request already approved" });
    }

    // 2️⃣ Generate password
    const plainPassword = "member@" + Math.floor(1000 + Math.random() * 9000);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // 3️⃣ Create user
    const userResult = await client.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'MEMBER')
       RETURNING id`,
      [request.name, request.email, hashedPassword]
    );

    const userId = userResult.rows[0].id;

    // 4️⃣ Create member profile (Including Image and Bio from request)
    await client.query(
      `INSERT INTO members (user_id, designation, join_date, status, image, bio)
       VALUES ($1, 'Member', CURRENT_DATE, 'Active', $2, $3)`,
      [userId, request.profile_image || '', request.work_details || '']
    );

    // 5️⃣ Update request status
    await client.query(
      `UPDATE membership_requests SET status = 'APPROVED' WHERE id = $1`,
      [requestId]
    );

    await client.query('COMMIT');

    res.json({
      message: "Membership approved successfully",
      credentials: {
        email: request.email,
        password: plainPassword,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("APPROVE MEMBERSHIP ERROR:", error);
    res.status(500).json({ message: "Failed to approve membership" });
  } finally {
    client.release();
  }
};

/**
 * ===============================
 * REJECT MEMBERSHIP REQUEST (ADMIN)
 * ===============================
 */
export const rejectMembershipRequest = async (req: Request, res: Response) => {
  const requestId = Number(req.params.id);

  try {
    await pool.query(
      `UPDATE membership_requests SET status = 'REJECTED' WHERE id = $1`,
      [requestId]
    );

    res.json({ message: "Membership request rejected" });
  } catch (error) {
    console.error("REJECT MEMBERSHIP ERROR:", error);
    res.status(500).json({ message: "Failed to reject request" });
  }
};

/**
 * ===============================
 * DELETE MEMBERSHIP REQUEST (ADMIN)
 * ===============================
 */

export const deleteMembershipRequest = async (req: Request, res: Response) => {
  const requestId = Number(req.params.id);

  // 1. Validation: Ensure ID is a valid number
  if (!requestId || isNaN(requestId)) {
    return res.status(400).json({ message: "Invalid Request ID" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM membership_requests WHERE id = $1 RETURNING *", 
      [requestId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error("DELETE REQUEST ERROR:", error);
    res.status(500).json({ message: "Failed to delete request" });
  }
};