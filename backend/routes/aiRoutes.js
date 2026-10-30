import express from 'express';
import { generateTaskDescription } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate-description', protect, generateTaskDescription);

export default router;
