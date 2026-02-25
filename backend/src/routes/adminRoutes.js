import express from 'express';
import { getPendingOwners, approveOwner, rejectOwner, getAllUsers } from '../controllers/adminController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require admin role
router.use(verifyToken, requireRole('admin'));

router.get('/pending-owners', getPendingOwners);
router.patch('/approve-owner/:uid', approveOwner);
router.patch('/reject-owner/:uid', rejectOwner);
router.get('/users', getAllUsers);

export default router;
