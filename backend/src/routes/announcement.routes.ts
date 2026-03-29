import { Router } from "express";
import {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcement.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role"; // <--- Import this

const router = Router();

// PUBLIC ROUTE (Anyone can see news)
router.get("/", getAnnouncements); 

// ADMIN ROUTES (Protected)
router.post("/", authenticate, authorize(['ADMIN']), createAnnouncement);
router.put("/:id", authenticate, authorize(['ADMIN']), updateAnnouncement);
router.delete("/:id", authenticate, authorize(['ADMIN']), deleteAnnouncement);

export default router;