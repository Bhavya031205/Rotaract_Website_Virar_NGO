import { Router } from "express";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  assignTeam,
  myProjects,
  submitProjectReport,
  reviewProjectReport,
} from "../controllers/project.controller"; 
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role";

const router = Router();

// ==========================================
// 1. SPECIFIC ROUTES (Must come before /:id)
// ==========================================

// Public List
router.get("/", getAllProjects); 

// Member: My Projects (Specific path "me")
// ⚠️ MOVED UP: This must be defined BEFORE /:id so it is caught first
router.get("/me", authenticate, authorize(["MEMBER"]), myProjects);


// ==========================================
// 2. DYNAMIC ROUTE (Catches generic IDs)
// ==========================================

// Get Single Project (Removed regex to fix error)
// Since "/me" is above, this will now only catch other IDs (like 1, 2, 55)
router.get("/:id", getProjectById);


// ==========================================
// 3. ADMIN ROUTES (Management)
// ==========================================
router.post("/", authenticate, authorize(["ADMIN"]), createProject);
router.put("/:id", authenticate, authorize(["ADMIN"]), updateProject); 
router.delete("/:id", authenticate, authorize(["ADMIN"]), deleteProject); 

router.post("/assign", authenticate, authorize(["ADMIN"]), assignTeam);
router.put("/report/:id", authenticate, authorize(["ADMIN"]), reviewProjectReport);


// ==========================================
// 4. OTHER MEMBER ROUTES
// ==========================================
router.post("/report", authenticate, authorize(["MEMBER"]), submitProjectReport);

export default router;