
import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth'; 
import { authorize } from '../middleware/role'; 

const router = express.Router();

// ==========================================
// 1. CONFIGURE STORAGE (Create folder if missing)
// ==========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads');
    
    // 🟢 Fix: Create 'uploads' folder automatically if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// ==========================================
// 2. UPLOAD ROUTE
// ==========================================
// 🟢 Fix: Changed 'file' to 'image' to match the frontend
router.post('/', authenticate, authorize(['ADMIN', 'MEMBER']), upload.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Make sure the key is "image".' });
    }

    // Return the full URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.json({ 
      message: 'File uploaded successfully', 
      url: fileUrl // 🟢 Frontend uses this 'url' to display the image
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ message: "Server error during upload" });
  }
});

export default router;