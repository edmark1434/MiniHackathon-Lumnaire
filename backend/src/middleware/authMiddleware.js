import { auth, db } from '../config/firebaseAdmin.js';

/**
 * Verify Firebase ID token from Authorization header.
 * Attaches decoded user info + Firestore profile to req.user
 */
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(token);

    // Fetch user profile from Firestore for role info
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return res.status(401).json({ message: 'Unauthorized: User profile not found' });
    }

    const userData = userDoc.data();

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userData.role || 'user',
      approved: userData.approved !== undefined ? userData.approved : true,
      storeId: userData.storeId || null,
      ...userData,
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

/**
 * Require specific role(s). Must be used AFTER verifyToken.
 * @param  {...string} roles - Allowed roles
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    // For owners, check if they're approved
    if (req.user.role === 'owner' && !req.user.approved) {
      return res.status(403).json({ message: 'Forbidden: Owner account pending approval' });
    }

    next();
  };
};

/**
 * Optional auth — parses token if present but doesn't require it.
 * Useful for public endpoints that behave differently for logged-in users.
 */
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  try {
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: userData.role || 'user',
        approved: userData.approved !== undefined ? userData.approved : true,
        storeId: userData.storeId || null,
        ...userData,
      };
    } else {
      req.user = null;
    }
  } catch {
    req.user = null;
  }

  next();
};
