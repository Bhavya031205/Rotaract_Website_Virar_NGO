import express from 'express';
import { getLoginLogs } from '../controllers/logs.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';

const router = express.Router();

// Only Admin can see logs
router.get('/', authenticate, authorize(['ADMIN']), getLoginLogs);

export default router;