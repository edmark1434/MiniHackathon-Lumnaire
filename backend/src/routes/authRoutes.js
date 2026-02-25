import express from 'express';
import { registerUser, getMe } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public — called after client-side Firebase Auth signup
router.post('/register', registerUser);

// Protected — get current user profile
router.get('/me', verifyToken, getMe);

export default router;
