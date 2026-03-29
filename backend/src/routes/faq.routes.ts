import express from 'express';
import { 
  getPublicFaqs, 
  askQuestion, 
  getAllFaqs, 
  answerFaq, 
  deleteFaq,
  updateFaq,      // <--- Import this
  createAdminFaq  // <--- Import this
} from '../controllers/faq.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';

const router = express.Router();

// Public Routes
router.get('/public', getPublicFaqs);
router.post('/ask', askQuestion);

// Admin Routes
router.get('/admin', authenticate, authorize(['ADMIN']), getAllFaqs);
router.put('/:id/answer', authenticate, authorize(['ADMIN']), answerFaq);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteFaq);

// NEW ROUTES
router.put('/:id', authenticate, authorize(['ADMIN']), updateFaq); // Edit existing
router.post('/admin/create', authenticate, authorize(['ADMIN']), createAdminFaq); // Create new

export default router;