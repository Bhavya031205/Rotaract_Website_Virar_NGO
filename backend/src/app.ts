import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import cors from "cors";
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Security Imports
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';

// Routes
import pool from "./config/db";
import authRoutes from "./routes/auth.routes";
import memberRoutes from "./routes/members.routes";
import eventRoutes from "./routes/event.routes";
import donationRoutes from "./routes/donation.routes";
import projectRoutes from "./routes/project.routes";
import announcementRoutes from "./routes/announcement.routes";
import membershipRequestRoutes from "./routes/membershipRequest.routes";
import paymentRoutes from "./routes/payment.routes"
import paymentWebhookRoutes from "./routes/paymentWebhook.routes";
import contentRoutes from './routes/content.routes';
import uploadRoutes from './routes/upload.routes';
import faqRoutes from './routes/faq.routes';
import logRoutes from './routes/logs.routes';
import settingsRoutes from "./routes/settings.routes";
import blogRoutes from "./routes/blog.routes";

dotenv.config();

const app = express();

// ============================================
// 1. SECURITY & MIDDLEWARE LAYERS
// ============================================

// A. CORS (UPDATED TO ALLOW PATCH) 👈
app.use(cors({
  origin: "http://localhost:5173",
  // Added "PATCH" to this array to fix your Approve/Reject error
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// B. Secure HTTP Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// C. Rate Limiting (Increased for Development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased to prevent '429' errors during testing
  message: "Too many requests from this IP, please try again after 15 minutes."
});
app.use('/api', limiter);

// D. Payment Webhook
app.use(
  "/api/payment/webhook",
  bodyParser.raw({ type: "application/json" })
);

// E. Body Parsers
app.use(express.json({ limit: '10kb' }));

// F. Prevent HTTP Parameter Pollution
app.use(hpp());


// ============================================
// 2. STATIC FILE SERVING
// ============================================

const uploadsPath = path.join(process.cwd(), 'uploads');

if (fs.existsSync(uploadsPath)) {
  console.log(`✅ Uploads folder found at: ${uploadsPath}`);
} else {
  console.error(`❌ Uploads folder MISSING at: ${uploadsPath}`);
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("Created 'uploads' folder automatically.");
}

app.use('/uploads', (req, res, next) => {
  console.log(`📂 Serving Image: ${req.url}`);
  next();
}, express.static(uploadsPath));


// ============================================
// 3. API ROUTES
// ============================================

app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/membership-request", membershipRequestRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/payment", paymentWebhookRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/logs', logRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/blog", blogRoutes);


// Health Check
app.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      status: "Secure Backend Running 🛡️",
      time: result.rows[0],
      env: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({ status: "Database Disconnected ❌" });
  }
});

export default app;