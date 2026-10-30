import express from 'express';
import {
  getDashboardStats,
  getUpcomingTasks,
  getRecentActivity,
} from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/stats', getDashboardStats);
router.get('/upcoming', getUpcomingTasks);
router.get('/activity', getRecentActivity);

export default router;
