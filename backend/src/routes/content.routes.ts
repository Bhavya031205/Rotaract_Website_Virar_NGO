import express from 'express';
import { getContent, updateContent } from '../controllers/content.controller'; // Note the lowercase 'c'
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';

const router = express.Router();

// Public: Get page content
router.get('/:pageKey', getContent);

// Protected: Update page content (Admin only)
router.put('/:pageKey', authenticate, authorize(['ADMIN']), updateContent);

export default router;