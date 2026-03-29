
import { Router } from "express";
import {
  createOrder,
  verifyPayment,
  getAllDonations,
  createManualDonation,
  deleteDonation
} from "../controllers/donation.controller"; // Ensure your controller file is named this
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role"; 

const router = Router();

// ==========================================
// 1. PUBLIC ROUTES (For Donate Page)
// ==========================================

// Step 1: Initialize Razorpay Payment
router.post("/create-order", createOrder);

// Step 2: Verify Razorpay Payment & Save
router.post("/verify", verifyPayment);

// Step 3: Submit QR / Manual Transfer Details (Moved to Public)
// 🟢 REMOVED 'authenticate' so public users can submit the form
router.post("/manual", createManualDonation);


// ==========================================
// 2. ADMIN ROUTES (Dashboard)
// ==========================================

// View Donation History (Protected: Admin Only)
router.get("/", authenticate, authorize(["ADMIN"]), getAllDonations);
router.delete("/:id", authenticate, authorize(["ADMIN"]), deleteDonation);

export default router;