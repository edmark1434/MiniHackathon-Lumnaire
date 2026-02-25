import { db } from '../config/firebaseAdmin.js';
import admin from 'firebase-admin';

/**
 * Verify the requesting user owns the store.
 */
const verifyStoreOwnership = async (storeId, userId, userRole) => {
  const storeDoc = await db.collection('stores').doc(storeId).get();
  if (!storeDoc.exists) return { error: 'Store not found', status: 404 };
  if (storeDoc.data().ownerId !== userId && userRole !== 'admin') {
    return { error: 'You can only manage products in your own store', status: 403 };
  }
  return { store: storeDoc };
};

/**
 * List all products for a store (public).
 * GET /api/stores/:storeId/products
 */
export const getProducts = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const { search, category } = req.query;

    let query = db.collection('stores').doc(storeId).collection('products');

    if (category) {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.orderBy('name').get();

    let products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Client-side search filtering (Firestore doesn't support full-text search natively)
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        (p.category && p.category.toLowerCase().includes(searchLower))
      );
    }

    res.json({ products });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single product (public).
 * GET /api/stores/:storeId/products/:productId
 */
export const getProduct = async (req, res, next) => {
  try {
    const { storeId, productId } = req.params;
    const productDoc = await db.collection('stores').doc(storeId)
      .collection('products').doc(productId).get();

    if (!productDoc.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ product: { id: productDoc.id, ...productDoc.data() } });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a product (owner only).
 * POST /api/stores/:storeId/products
 */
export const createProduct = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const ownership = await verifyStoreOwnership(storeId, req.user.uid, req.user.role);
    if (ownership.error) return res.status(ownership.status).json({ message: ownership.error });

    const { name, category, price, stock, unit, imageUrl, description } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ message: 'name, price, and stock are required' });
    }

    const productData = {
      name,
      category: category || 'General',
      price: Number(price),
      stock: Number(stock),
      unit: unit || 'piece',
      imageUrl: imageUrl || '',
      description: description || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const productRef = await db.collection('stores').doc(storeId)
      .collection('products').add(productData);

    res.status(201).json({
      message: 'Product created successfully',
      product: { id: productRef.id, ...productData },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a product (owner only).
 * PUT /api/stores/:storeId/products/:productId
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { storeId, productId } = req.params;
    const ownership = await verifyStoreOwnership(storeId, req.user.uid, req.user.role);
    if (ownership.error) return res.status(ownership.status).json({ message: ownership.error });

    const productRef = db.collection('stores').doc(storeId)
      .collection('products').doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, category, price, stock, unit, imageUrl, description } = req.body;
    const updates = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };

    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (price !== undefined) updates.price = Number(price);
    if (stock !== undefined) updates.stock = Number(stock);
    if (unit !== undefined) updates.unit = unit;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (description !== undefined) updates.description = description;

    await productRef.update(updates);

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a product (owner only).
 * DELETE /api/stores/:storeId/products/:productId
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { storeId, productId } = req.params;
    const ownership = await verifyStoreOwnership(storeId, req.user.uid, req.user.role);
    if (ownership.error) return res.status(ownership.status).json({ message: ownership.error });

    const productRef = db.collection('stores').doc(storeId)
      .collection('products').doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await productRef.delete();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};
