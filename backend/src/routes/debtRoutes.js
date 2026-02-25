import express from 'express';
import { getDebts, getDebt, createDebt, updateDebt, deleteDebt } from '../controllers/debtController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

// All debt routes require owner role
router.use(verifyToken, requireRole('owner', 'admin'));

router.get('/', getDebts);
router.get('/:debtId', getDebt);
router.post('/', createDebt);
router.put('/:debtId', updateDebt);
router.delete('/:debtId', deleteDebt);

export default router;
