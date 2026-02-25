import { db } from '../config/firebaseAdmin.js';

/**
 * Get dashboard stats for a store.
 * GET /api/stores/:storeId/dashboard
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const { storeId } = req.params;

    // Verify store ownership
    const storeDoc = await db.collection('stores').doc(storeId).get();
    if (!storeDoc.exists) {
      return res.status(404).json({ message: 'Store not found' });
    }
    if (storeDoc.data().ownerId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all products
    const productsSnapshot = await db.collection('stores').doc(storeId)
      .collection('products').get();

    const products = productsSnapshot.docs.map(doc => doc.data());
    const totalProducts = products.length;
    const lowStockItems = products.filter(p => p.stock <= 5).length;
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

    // Get all debts
    const debtsSnapshot = await db.collection('stores').doc(storeId)
      .collection('debts').get();

    const debts = debtsSnapshot.docs.map(doc => doc.data());
    const totalDebts = debts.length;
    const totalDebtAmount = debts.reduce((sum, d) => sum + (d.totalAmount || 0), 0);
    const totalCollected = debts.reduce((sum, d) => sum + (d.amountPaid || 0), 0);
    const outstandingBalance = totalDebtAmount - totalCollected;
    const unpaidDebts = debts.filter(d => d.status === 'unpaid').length;
    const partialDebts = debts.filter(d => d.status === 'partial').length;
    const paidDebts = debts.filter(d => d.status === 'paid').length;

    // Recent products (last 5 added)
    const recentProductsSnapshot = await db.collection('stores').doc(storeId)
      .collection('products')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    const recentProducts = recentProductsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Recent debts (last 5)
    const recentDebtsSnapshot = await db.collection('stores').doc(storeId)
      .collection('debts')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    const recentDebts = recentDebtsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      stats: {
        totalProducts,
        lowStockItems,
        totalInventoryValue,
        totalDebts,
        totalDebtAmount,
        totalCollected,
        outstandingBalance,
        unpaidDebts,
        partialDebts,
        paidDebts,
      },
      recentProducts,
      recentDebts,
    });
  } catch (error) {
    next(error);
  }
};
