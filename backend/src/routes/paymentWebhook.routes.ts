import { Router } from "express";
import { razorpayWebhook } from "../controllers/paymentWebhook.controller";

const router = Router();

router.post("/webhook", razorpayWebhook);

export default router;
