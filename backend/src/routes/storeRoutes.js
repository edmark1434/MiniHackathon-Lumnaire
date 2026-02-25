import express from 'express';
import { getAllStores, getStore, createStore, updateStore } from '../controllers/storeController.js';
import { verifyToken, requireRole, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllStores);
router.get('/:storeId', getStore);

// Owner-only routes
router.post('/', verifyToken, requireRole('owner'), createStore);
router.put('/:storeId', verifyToken, requireRole('owner', 'admin'), updateStore);

export default router;
