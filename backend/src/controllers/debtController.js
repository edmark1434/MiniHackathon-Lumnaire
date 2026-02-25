import { db } from '../config/firebaseAdmin.js';
import admin from 'firebase-admin';

/**
 * Verify the requesting user owns the store.
 */
const verifyStoreOwnership = async (storeId, userId, userRole) => {
  const storeDoc = await db.collection('stores').doc(storeId).get();
  if (!storeDoc.exists) return { error: 'Store not found', status: 404 };
  if (storeDoc.data().ownerId !== userId && userRole !== 'admin') {
    return { error: 'You can only manage debts in your own store', status: 403 };
  }
  return { store: storeDoc };
};

/**
 * List all debts for a store (owner only).
 * GET /api/stores/:storeId/debts
 */
export const getDebts = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const { status: debtStatus } = req.query;

    let query = db.collection('stores').doc(storeId).collection('debts');

    if (debtStatus) {
      query = query.where('status', '==', debtStatus);
    }

    const snapshot = await query.get();

    const debts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ debts });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single debt record.
 * GET /api/stores/:storeId/debts/:debtId
 */
export const getDebt = async (req, res, next) => {
  try {
    const { storeId, debtId } = req.params;
    const debtDoc = await db.collection('stores').doc(storeId)
      .collection('debts').doc(debtId).get();

    if (!debtDoc.exists) {
      return res.status(404).json({ message: 'Debt record not found' });
    }

    res.json({ debt: { id: debtDoc.id, ...debtDoc.data() } });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a debt record (owner only).
 * POST /api/stores/:storeId/debts
 */
export const createDebt = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const ownership = await verifyStoreOwnership(storeId, req.user.uid, req.user.role);
    if (ownership.error) return res.status(ownership.status).json({ message: ownership.error });

    const { customerName, items, totalAmount, notes } = req.body;

    if (!customerName || totalAmount === undefined) {
      return res.status(400).json({ message: 'customerName and totalAmount are required' });
    }

    const debtData = {
      customerName,
      items: items || [],
      totalAmount: Number(totalAmount),
      amountPaid: 0,
      status: 'unpaid',
      notes: notes || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const debtRef = await db.collection('stores').doc(storeId)
      .collection('debts').add(debtData);

    res.status(201).json({
      message: 'Debt record created successfully',
      debt: { id: debtRef.id, ...debtData },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a debt record / record payment (owner only).
 * PUT /api/stores/:storeId/debts/:debtId
 */
export const updateDebt = async (req, res, next) => {
  try {
    const { storeId, debtId } = req.params;
    const ownership = await verifyStoreOwnership(storeId, req.user.uid, req.user.role);
    if (ownership.error) return res.status(ownership.status).json({ message: ownership.error });

    const debtRef = db.collection('stores').doc(storeId)
      .collection('debts').doc(debtId);
    const debtDoc = await debtRef.get();

    if (!debtDoc.exists) {
      return res.status(404).json({ message: 'Debt record not found' });
    }

    const { customerName, items, totalAmount, amountPaid, notes } = req.body;
    const currentData = debtDoc.data();
    const updates = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };

    if (customerName !== undefined) updates.customerName = customerName;
    if (items !== undefined) updates.items = items;
    if (totalAmount !== undefined) updates.totalAmount = Number(totalAmount);
    if (notes !== undefined) updates.notes = notes;

    if (amountPaid !== undefined) {
      updates.amountPaid = Number(amountPaid);
      const total = updates.totalAmount || currentData.totalAmount;
      if (Number(amountPaid) >= total) {
        updates.status = 'paid';
      } else if (Number(amountPaid) > 0) {
        updates.status = 'partial';
      } else {
        updates.status = 'unpaid';
      }
    }

    await debtRef.update(updates);

    res.json({ message: 'Debt record updated successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a debt record (owner only).
 * DELETE /api/stores/:storeId/debts/:debtId
 */
export const deleteDebt = async (req, res, next) => {
  try {
    const { storeId, debtId } = req.params;
    const ownership = await verifyStoreOwnership(storeId, req.user.uid, req.user.role);
    if (ownership.error) return res.status(ownership.status).json({ message: ownership.error });

    const debtRef = db.collection('stores').doc(storeId)
      .collection('debts').doc(debtId);
    const debtDoc = await debtRef.get();

    if (!debtDoc.exists) {
      return res.status(404).json({ message: 'Debt record not found' });
    }

    await debtRef.delete();

    res.json({ message: 'Debt record deleted successfully' });
  } catch (error) {
    next(error);
  }
};
