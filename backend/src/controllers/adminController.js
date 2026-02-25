import { db } from '../config/firebaseAdmin.js';

/**
 * Get all pending owner registrations.
 * GET /api/admin/pending-owners
 */
export const getPendingOwners = async (req, res, next) => {
  try {
    const snapshot = await db.collection('users')
      .where('role', '==', 'owner')
      .where('approved', '==', false)
      .get();

    const pendingOwners = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
    }));

    res.json({ pendingOwners });
  } catch (error) {
    console.error('getPendingOwners error:', error);
    next(error);
  }
};

/**
 * Approve an owner registration.
 * PATCH /api/admin/approve-owner/:uid
 */
export const approveOwner = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userDoc.data().role !== 'owner') {
      return res.status(400).json({ message: 'User is not an owner' });
    }

    await userRef.update({ approved: true });

    res.json({ message: 'Owner approved successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject / delete an owner registration.
 * PATCH /api/admin/reject-owner/:uid
 */
export const rejectOwner = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete the Firestore profile (they can re-register)
    await userRef.delete();

    res.json({ message: 'Owner registration rejected' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users (for admin dashboard overview).
 * GET /api/admin/users
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const snapshot = await db.collection('users').get();

    const users = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
    }));

    res.json({ users });
  } catch (error) {
    console.error('getAllUsers error:', error);
    next(error);
  }
};
