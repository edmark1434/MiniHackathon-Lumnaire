import express from 'express';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

// Public routes
router.get('/', getProducts);
router.get('/:productId', getProduct);

// Owner-only routes
router.post('/', verifyToken, requireRole('owner', 'admin'), createProduct);
router.put('/:productId', verifyToken, requireRole('owner', 'admin'), updateProduct);
router.delete('/:productId', verifyToken, requireRole('owner', 'admin'), deleteProduct);

export default router;
