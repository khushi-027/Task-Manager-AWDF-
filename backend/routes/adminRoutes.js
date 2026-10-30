import express from 'express';
import {
  getAdminDashboard,
  getAdminReports,
  exportReportCSV,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireAdmin);

router.get('/dashboard', getAdminDashboard);
router.get('/reports', getAdminReports);
router.get('/reports/export', exportReportCSV);

export default router;
