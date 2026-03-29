import { Router } from "express";
import multer from "multer";
import path from "path";
// 🟢 ADDED: getPostById to the imports
import { getCategories, getPosts, getPostById, createPost, deletePost, updatePost } from "../controllers/blog.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role";

const router = Router();

// --- MULTER CONFIGURATION (Kept exactly as you had it) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure this folder exists in your root directory
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    // Create unique filename: timestamp + original extension
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // Limit: 50MB
});
// -----------------------------

// PUBLIC ROUTES
router.get("/categories", getCategories);
router.get("/posts", getPosts);

// 🟢 NEW: Single Post Route (This is what we needed to add)
router.get("/posts/:id", getPostById);

// ADMIN ROUTES
router.post("/posts", authenticate, authorize(["ADMIN"]), upload.array("media", 5), createPost);
router.put("/posts/:id", authenticate, authorize(["ADMIN"]), upload.array("media", 5), updatePost);
router.delete("/posts/:id", authenticate, authorize(["ADMIN"]), deletePost);

export default router;