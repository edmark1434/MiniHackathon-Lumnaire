import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

router.get('/', verifyToken, requireRole('owner', 'admin'), getDashboardStats);

export default router;
