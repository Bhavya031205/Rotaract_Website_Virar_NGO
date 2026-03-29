import { Router } from "express";
import {
  createMember,
  getAllMembers,
  getMyProfile,
  updateMyProfile,
  updateMember,
  deleteMember,
  getPublicMembers,
  toggleMemberVisibility
} from "../controllers/members.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role";

const router = Router();

// ==========================================
// 1. PUBLIC ROUTE
// ==========================================
router.get("/public", getPublicMembers);


// ==========================================
// 2. PROFILE ROUTES (Specific Routes FIRST)
// ==========================================
// 🟢 FIX 1: These are now at the top so they don't get blocked by other routes.
// 🟢 FIX 2: Changed URL to "/me/update" to match your Frontend axios call.

router.get("/me", authenticate, authorize(["MEMBER", "ADMIN"]), getMyProfile);
router.put("/me/update", authenticate, authorize(["MEMBER", "ADMIN"]), updateMyProfile);


// ==========================================
// 3. ADMIN / GENERAL ROUTES (Generic Routes LAST)
// ==========================================

// Get All (Admin View)
router.get("/", authenticate, authorize(["ADMIN"]), getAllMembers);

// Create New Member
router.post("/", authenticate, authorize(["ADMIN"]), createMember);

// Update Specific Member (Admin Edit)
router.put("/:id", authenticate, authorize(["ADMIN"]), updateMember);

// Toggle Visibility
router.put("/:id/toggle-public", authenticate, authorize(["ADMIN"]), toggleMemberVisibility);

// Delete Member
router.delete("/:id", authenticate, authorize(["ADMIN"]), deleteMember);

export default router;