import { db } from '../config/firebaseAdmin.js';
import admin from 'firebase-admin';

/**
 * Get all stores (public).
 * GET /api/stores
 */
export const getAllStores = async (req, res, next) => {
  try {
    const snapshot = await db.collection('stores').get();

    const stores = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ stores });
  } catch (error) {
    console.error('getAllStores error:', error);
    next(error);
  }
};

/**
 * Get a single store (public).
 * GET /api/stores/:storeId
 */
export const getStore = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const storeDoc = await db.collection('stores').doc(storeId).get();

    if (!storeDoc.exists) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json({ store: { id: storeDoc.id, ...storeDoc.data() } });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a store (approved owner only).
 * POST /api/stores
 */
export const createStore = async (req, res, next) => {
  try {
    const { storeName, address, description, latitude, longitude } = req.body;

    if (!storeName) {
      return res.status(400).json({ message: 'Store name is required' });
    }

    // Check if owner already has a store
    const existingStore = await db.collection('stores')
      .where('ownerId', '==', req.user.uid)
      .limit(1)
      .get();

    if (!existingStore.empty) {
      return res.status(400).json({ message: 'You already have a store. Each owner can only have one store.' });
    }

    const storeData = {
      ownerId: req.user.uid,
      ownerName: req.user.displayName || req.user.email,
      storeName,
      address: address || '',
      description: description || '',
      latitude: latitude !== undefined ? parseFloat(latitude) : null,
      longitude: longitude !== undefined ? parseFloat(longitude) : null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const storeRef = await db.collection('stores').add(storeData);

    // Update user doc with storeId reference
    await db.collection('users').doc(req.user.uid).update({
      storeId: storeRef.id,
    });

    res.status(201).json({
      message: 'Store created successfully',
      store: { id: storeRef.id, ...storeData },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update store details (owner only, must own the store).
 * PUT /api/stores/:storeId
 */
export const updateStore = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const storeRef = db.collection('stores').doc(storeId);
    const storeDoc = await storeRef.get();

    if (!storeDoc.exists) {
      return res.status(404).json({ message: 'Store not found' });
    }

    if (storeDoc.data().ownerId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own store' });
    }

    const { storeName, address, description, latitude, longitude } = req.body;
    const updates = {};

    if (storeName !== undefined) updates.storeName = storeName;
    if (address !== undefined) updates.address = address;
    if (description !== undefined) updates.description = description;
    if (latitude !== undefined) updates.latitude = parseFloat(latitude);
    if (longitude !== undefined) updates.longitude = parseFloat(longitude);
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await storeRef.update(updates);

    res.json({ message: 'Store updated successfully' });
  } catch (error) {
    next(error);
  }
};
