import { Router } from "express";
import {
  createEvent,
  getAllEvents,
  updateEvent,
  deleteEvent,
  rsvpEvent,
  getEventRsvps,
} from "../controllers/event.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role";

const router = Router();

// ================= PUBLIC ROUTES =================
// The frontend might call /events, /events/public, or /events/admin
// We will route ALL of them to getAllEvents to prevent 404s
router.get("/", getAllEvents);        // localhost:5000/api/events
router.get("/public", getAllEvents);  // localhost:5000/api/events/public (Fixes 404)
router.get("/admin", authenticate, authorize(["ADMIN"]), getAllEvents); // localhost:5000/api/events/admin (Fixes 404)

// ================= ADMIN ROUTES =================
router.post("/", authenticate, authorize(["ADMIN"]), createEvent);
router.put("/:id", authenticate, authorize(["ADMIN"]), updateEvent);
router.delete("/:id", authenticate, authorize(["ADMIN"]), deleteEvent);

// ================= RSVP ROUTES =================
router.post("/:id/rsvp", authenticate, authorize(["MEMBER"]), rsvpEvent);
router.get("/:id/rsvps", authenticate, authorize(["ADMIN"]), getEventRsvps);

export default router;