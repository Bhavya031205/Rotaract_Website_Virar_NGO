import { Router } from "express";
import {
  createMembershipRequest,
  getMembershipRequests,
  approveMembershipRequest,
  rejectMembershipRequest,
  deleteMembershipRequest // 🟢 1. Import this
} from "../controllers/membershipRequest.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role";

const router = Router();

// Public
router.post("/", createMembershipRequest);

// Admin Routes
router.get("/", authenticate, authorize(["ADMIN"]), getMembershipRequests);
router.patch("/:id/approve", authenticate, authorize(["ADMIN"]), approveMembershipRequest);
router.patch("/:id/reject", authenticate, authorize(["ADMIN"]), rejectMembershipRequest);

// 🟢 2. Add this DELETE route
router.delete("/:id", authenticate, authorize(["ADMIN"]), deleteMembershipRequest);

export default router;