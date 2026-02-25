import express from 'express';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import storeRoutes from './storeRoutes.js';
import productRoutes from './productRoutes.js';
import debtRoutes from './debtRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/stores', storeRoutes);
router.use('/stores/:storeId/products', productRoutes);
router.use('/stores/:storeId/debts', debtRoutes);
router.use('/stores/:storeId/dashboard', dashboardRoutes);

export default router;
