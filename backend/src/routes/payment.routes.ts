import { Router } from "express";
import { 
  createOrder, 
  verifyPayment, 
  getAllPayments,      // <--- CHANGED: Matches controller
  createManualPayment  // <--- CHANGED: Matches controller
} from "../controllers/payment.controller"; // <--- CHANGED: Correct file name
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role";

const router = Router();

// ==========================================
// 1. PUBLIC ROUTES (For Website)
// ==========================================
router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);

// ==========================================
// 2. ADMIN ROUTES (For Dashboard)
// ==========================================

// Get Donation History (Protected)
router.get("/", authenticate, authorize(["ADMIN"]), getAllPayments);

// Record Offline/Manual Donation (Protected)
router.post("/manual", authenticate, authorize(["ADMIN"]), createManualPayment);

export default router;