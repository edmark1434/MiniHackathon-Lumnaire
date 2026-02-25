import { db } from '../config/firebaseAdmin.js';
import admin from 'firebase-admin';

/**
 * Register a new user — creates Firestore profile.
 * Firebase Auth account is created client-side; this just stores the profile.
 * POST /api/auth/register
 */
export const registerUser = async (req, res, next) => {
  try {
    const { uid, email, displayName, role } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ message: 'uid and email are required' });
    }

    const validRoles = ['user', 'owner'];
    const userRole = validRoles.includes(role) ? role : 'user';

    const userData = {
      email,
      displayName: displayName || '',
      role: userRole,
      approved: userRole === 'user', // Users auto-approved, owners need admin approval
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('users').doc(uid).set(userData);

    res.status(201).json({
      message: userRole === 'owner'
        ? 'Owner registration submitted. Awaiting admin approval.'
        : 'User registered successfully.',
      user: { uid, ...userData },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile.
 * GET /api/auth/me (requires verifyToken)
 */
export const getMe = async (req, res, next) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const userData = userDoc.data();

    // If user is an owner, also fetch their store info
    let store = null;
    if (userData.role === 'owner' && userData.storeId) {
      const storeDoc = await db.collection('stores').doc(userData.storeId).get();
      if (storeDoc.exists) {
        store = { id: storeDoc.id, ...storeDoc.data() };
      }
    }

    res.json({
      user: { uid: req.user.uid, ...userData },
      store,
    });
  } catch (error) {
    next(error);
  }
};
