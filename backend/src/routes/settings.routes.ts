import { Router } from "express";
import { getDonationSettings, updateDonationSettings } from "../controllers/settings.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role";

const router = Router();

// ==========================================
// SETTINGS ROUTES
// Mounted at: /api/settings (in your server.ts)
// ==========================================

// 1. PUBLIC: Fetch Donation Settings
// Why Public? The 'Donate.tsx' page needs to read the Bank Details & QR code 
// to display them to anonymous donors.
router.get("/donation", getDonationSettings);

// 2. ADMIN: Update Donation Settings
// Why Admin? Only authorized admins should be able to change the Bank Account 
// numbers or the receipt email address.
router.put("/donation", authenticate, authorize(["ADMIN"]), updateDonationSettings);

export default router;