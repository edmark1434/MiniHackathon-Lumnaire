import { db, auth } from './src/config/firebaseAdmin.js';
import admin from 'firebase-admin';

/**
 * Seed Mock Data Script for Mini Hackathon Lumnaire
 * 
 * This script creates:
 * - Admin user
 * - Owner users (approved and pending)
 * - Regular users
 * - Stores (with coordinates)
 * - Products per store
 * - Debts per store
 * 
 * Usage: node seedMockData.js
 */

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Mock Data
const mockUsers = [
  {
    uid: 'admin-user-001',
    email: 'admin@lumnaire.com',
    password: 'admin123',
    displayName: 'Admin User',
    role: 'admin',
    approved: true,
  },
  {
    uid: 'owner-user-001',
    email: 'owner1@store.com',
    password: 'owner123',
    displayName: 'Juan Dela Cruz',
    role: 'owner',
    approved: true,
  },
  {
    uid: 'owner-user-002',
    email: 'owner2@store.com',
    password: 'owner123',
    displayName: 'Maria Santos',
    role: 'owner',
    approved: true,
  },
  {
    uid: 'owner-user-003',
    email: 'owner3@store.com',
    password: 'owner123',
    displayName: 'Pedro Reyes',
    role: 'owner',
    approved: false, // Pending approval
  },
  {
    uid: 'user-001',
    email: 'user1@example.com',
    password: 'user123',
    displayName: 'Anna Garcia',
    role: 'user',
    approved: true,
  },
  {
    uid: 'user-002',
    email: 'user2@example.com',
    password: 'user123',
    displayName: 'Carlo Mendoza',
    role: 'user',
    approved: true,
  },
];

const mockStores = [
  {
    id: 'store-001',
    ownerId: 'owner-user-001',
    ownerName: 'Juan Dela Cruz',
    storeName: 'Sari-Sari Store ni Juan',
    address: '123 Main St, Barangay San Roque, Manila',
    description: 'Your friendly neighborhood store with everything you need!',
    latitude: 14.5995,
    longitude: 120.9842,
  },
  {
    id: 'store-002',
    ownerId: 'owner-user-002',
    ownerName: 'Maria Santos',
    storeName: "Maria's Convenience Store",
    address: '456 Market Ave, Quezon City',
    description: 'Quality products at affordable prices.',
    latitude: 14.6760,
    longitude: 121.0437,
  },
];

const mockProducts = [
  // Products for Store 001
  {
    storeId: 'store-001',
    name: 'Lucky Me Pancit Canton',
    category: 'Instant Noodles',
    price: 15,
    stock: 150,
    unit: 'pack',
    description: 'Original flavor instant pancit canton',
    imageUrl: 'https://via.placeholder.com/200x200?text=Pancit+Canton',
  },
  {
    storeId: 'store-001',
    name: 'Nissin Cup Noodles',
    category: 'Instant Noodles',
    price: 25,
    stock: 80,
    unit: 'cup',
    description: 'Beef flavor cup noodles',
    imageUrl: 'https://via.placeholder.com/200x200?text=Cup+Noodles',
  },
  {
    storeId: 'store-001',
    name: 'Century Tuna Flakes',
    category: 'Canned Goods',
    price: 35,
    stock: 60,
    unit: 'can',
    description: 'Hot & spicy tuna flakes in oil',
    imageUrl: 'https://via.placeholder.com/200x200?text=Tuna',
  },
  {
    storeId: 'store-001',
    name: 'Argentina Corned Beef',
    category: 'Canned Goods',
    price: 42,
    stock: 45,
    unit: 'can',
    description: 'Classic corned beef',
    imageUrl: 'https://via.placeholder.com/200x200?text=Corned+Beef',
  },
  {
    storeId: 'store-001',
    name: 'Royal True Orange',
    category: 'Beverages',
    price: 12,
    stock: 100,
    unit: 'bottle',
    description: '8oz orange soda',
    imageUrl: 'https://via.placeholder.com/200x200?text=Royal',
  },
  {
    storeId: 'store-001',
    name: 'Coca Cola 1.5L',
    category: 'Beverages',
    price: 55,
    stock: 30,
    unit: 'bottle',
    description: '1.5 liter coca cola',
    imageUrl: 'https://via.placeholder.com/200x200?text=Coke',
  },
  {
    storeId: 'store-001',
    name: 'Skyflakes Crackers',
    category: 'Snacks',
    price: 8,
    stock: 120,
    unit: 'pack',
    description: 'Classic saltine crackers',
    imageUrl: 'https://via.placeholder.com/200x200?text=Skyflakes',
  },
  {
    storeId: 'store-001',
    name: 'Bear Brand Milk',
    category: 'Dairy',
    price: 32,
    stock: 50,
    unit: 'can',
    description: 'Sterilized milk drink',
    imageUrl: 'https://via.placeholder.com/200x200?text=Bear+Brand',
  },
  {
    storeId: 'store-001',
    name: 'Egg (Medium)',
    category: 'Fresh',
    price: 7,
    stock: 200,
    unit: 'piece',
    description: 'Fresh medium-sized eggs',
    imageUrl: 'https://via.placeholder.com/200x200?text=Eggs',
  },
  {
    storeId: 'store-001',
    name: 'Surf Powder Detergent',
    category: 'Household',
    price: 8,
    stock: 90,
    unit: 'sachet',
    description: 'Blossom fresh detergent powder',
    imageUrl: 'https://via.placeholder.com/200x200?text=Surf',
  },

  // Products for Store 002
  {
    storeId: 'store-002',
    name: 'Payless Pancit Canton',
    category: 'Instant Noodles',
    price: 14,
    stock: 100,
    unit: 'pack',
    description: 'Chilimansi flavor',
    imageUrl: 'https://via.placeholder.com/200x200?text=Payless',
  },
  {
    storeId: 'store-002',
    name: 'Mang Tomas Sauce',
    category: 'Condiments',
    price: 28,
    stock: 40,
    unit: 'bottle',
    description: 'All-purpose savory sauce',
    imageUrl: 'https://via.placeholder.com/200x200?text=Mang+Tomas',
  },
  {
    storeId: 'store-002',
    name: 'Silver Swan Soy Sauce',
    category: 'Condiments',
    price: 22,
    stock: 55,
    unit: 'bottle',
    description: 'Special soy sauce 385ml',
    imageUrl: 'https://via.placeholder.com/200x200?text=Soy+Sauce',
  },
  {
    storeId: 'store-002',
    name: 'Nescafe 3-in-1',
    category: 'Beverages',
    price: 9,
    stock: 150,
    unit: 'sachet',
    description: 'Original instant coffee mix',
    imageUrl: 'https://via.placeholder.com/200x200?text=Nescafe',
  },
  {
    storeId: 'store-002',
    name: 'Great Taste White Coffee',
    category: 'Beverages',
    price: 10,
    stock: 120,
    unit: 'sachet',
    description: '3-in-1 white coffee',
    imageUrl: 'https://via.placeholder.com/200x200?text=Great+Taste',
  },
  {
    storeId: 'store-002',
    name: 'Piattos Cheese',
    category: 'Snacks',
    price: 18,
    stock: 70,
    unit: 'pack',
    description: 'Hexagonal potato crisps cheese flavor',
    imageUrl: 'https://via.placeholder.com/200x200?text=Piattos',
  },
  {
    storeId: 'store-002',
    name: 'Nova Chips',
    category: 'Snacks',
    price: 8,
    stock: 85,
    unit: 'pack',
    description: 'BBQ flavor multigrain chips',
    imageUrl: 'https://via.placeholder.com/200x200?text=Nova',
  },
  {
    storeId: 'store-002',
    name: 'Alaska Evaporated Milk',
    category: 'Dairy',
    price: 30,
    stock: 60,
    unit: 'can',
    description: 'Evaporated filled milk 370ml',
    imageUrl: 'https://via.placeholder.com/200x200?text=Alaska',
  },
];

const mockDebts = [
  // Debts for Store 001
  {
    storeId: 'store-001',
    customerName: 'Rosa Tan',
    items: [
      { name: 'Lucky Me Pancit Canton', quantity: 10, price: 15 },
      { name: 'Royal True Orange', quantity: 5, price: 12 },
    ],
    totalAmount: 210,
    amountPaid: 0,
    status: 'unpaid',
    notes: 'Payment date: End of month',
  },
  {
    storeId: 'store-001',
    customerName: 'Tony Cruz',
    items: [
      { name: 'Century Tuna Flakes', quantity: 3, price: 35 },
      { name: 'Argentina Corned Beef', quantity: 2, price: 42 },
      { name: 'Skyflakes Crackers', quantity: 5, price: 8 },
    ],
    totalAmount: 229,
    amountPaid: 100,
    status: 'partial',
    notes: 'Paid 100 on Feb 20, balance due next week',
  },
  {
    storeId: 'store-001',
    customerName: 'Linda Flores',
    items: [
      { name: 'Bear Brand Milk', quantity: 4, price: 32 },
      { name: 'Egg (Medium)', quantity: 30, price: 7 },
    ],
    totalAmount: 338,
    amountPaid: 338,
    status: 'paid',
    notes: 'Paid in full on Feb 22',
  },
  {
    storeId: 'store-001',
    customerName: 'Robert Santos',
    items: [
      { name: 'Coca Cola 1.5L', quantity: 5, price: 55 },
      { name: 'Nissin Cup Noodles', quantity: 10, price: 25 },
    ],
    totalAmount: 525,
    amountPaid: 0,
    status: 'unpaid',
    notes: 'Large order, payment expected by end of week',
  },
  {
    storeId: 'store-001',
    customerName: 'Jenny Bautista',
    items: [
      { name: 'Surf Powder Detergent', quantity: 20, price: 8 },
    ],
    totalAmount: 160,
    amountPaid: 50,
    status: 'partial',
    notes: 'Weekly payment arrangement',
  },

  // Debts for Store 002
  {
    storeId: 'store-002',
    customerName: 'Mark Villanueva',
    items: [
      { name: 'Nescafe 3-in-1', quantity: 30, price: 9 },
      { name: 'Great Taste White Coffee', quantity: 20, price: 10 },
    ],
    totalAmount: 470,
    amountPaid: 0,
    status: 'unpaid',
    notes: 'Monthly coffee supply',
  },
  {
    storeId: 'store-002',
    customerName: 'Grace Ramirez',
    items: [
      { name: 'Piattos Cheese', quantity: 5, price: 18 },
      { name: 'Nova Chips', quantity: 8, price: 8 },
    ],
    totalAmount: 154,
    amountPaid: 154,
    status: 'paid',
    notes: 'Paid cash on Feb 23',
  },
  {
    storeId: 'store-002',
    customerName: 'Eduardo Martinez',
    items: [
      { name: 'Silver Swan Soy Sauce', quantity: 3, price: 22 },
      { name: 'Mang Tomas Sauce', quantity: 2, price: 28 },
    ],
    totalAmount: 122,
    amountPaid: 60,
    status: 'partial',
    notes: 'Will pay balance next week',
  },
];

// Helper Functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function createAuthUser(userData) {
  try {
    // Check if user already exists
    try {
      const existingUser = await auth.getUser(userData.uid);
      log(`  ↳ Firebase Auth user already exists: ${userData.email}`, 'yellow');
      return existingUser;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // User doesn't exist, create new one
        const userRecord = await auth.createUser({
          uid: userData.uid,
          email: userData.email,
          password: userData.password,
          displayName: userData.displayName,
          emailVerified: true,
        });
        log(`  ✓ Created Firebase Auth user: ${userData.email}`, 'green');
        return userRecord;
      }
      throw error;
    }
  } catch (error) {
    log(`  ✗ Error creating auth user ${userData.email}: ${error.message}`, 'red');
    throw error;
  }
}

async function createFirestoreUser(userData) {
  try {
    const userRef = db.collection('users').doc(userData.uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      log(`  ↳ Firestore user already exists: ${userData.email}`, 'yellow');
      return;
    }

    const firestoreData = {
      email: userData.email,
      displayName: userData.displayName,
      role: userData.role,
      approved: userData.approved,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (userData.storeId) {
      firestoreData.storeId = userData.storeId;
    }

    await userRef.set(firestoreData);
    log(`  ✓ Created Firestore user: ${userData.email}`, 'green');
  } catch (error) {
    log(`  ✗ Error creating Firestore user ${userData.email}: ${error.message}`, 'red');
    throw error;
  }
}

async function createStore(storeData) {
  try {
    const storeRef = db.collection('stores').doc(storeData.id);
    const storeDoc = await storeRef.get();

    if (storeDoc.exists) {
      log(`  ↳ Store already exists: ${storeData.storeName}`, 'yellow');
      return;
    }

    const data = {
      ownerId: storeData.ownerId,
      ownerName: storeData.ownerName,
      storeName: storeData.storeName,
      address: storeData.address,
      description: storeData.description,
      latitude: storeData.latitude,
      longitude: storeData.longitude,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await storeRef.set(data);

    // Update owner's user document with storeId
    await db.collection('users').doc(storeData.ownerId).update({
      storeId: storeData.id,
    });

    log(`  ✓ Created store: ${storeData.storeName} (${storeData.latitude}, ${storeData.longitude})`, 'green');
  } catch (error) {
    log(`  ✗ Error creating store ${storeData.storeName}: ${error.message}`, 'red');
    throw error;
  }
}

async function createProduct(productData) {
  try {
    const productsRef = db.collection('stores').doc(productData.storeId).collection('products');
    
    // Check if product with same name already exists in this store
    const existingProducts = await productsRef.where('name', '==', productData.name).limit(1).get();
    
    if (!existingProducts.empty) {
      return; // Skip silently
    }

    const data = {
      name: productData.name,
      category: productData.category,
      price: productData.price,
      stock: productData.stock,
      unit: productData.unit,
      description: productData.description,
      imageUrl: productData.imageUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await productsRef.add(data);
  } catch (error) {
    log(`  ✗ Error creating product ${productData.name}: ${error.message}`, 'red');
  }
}

async function createDebt(debtData) {
  try {
    const debtsRef = db.collection('stores').doc(debtData.storeId).collection('debts');
    
    // Check if debt for same customer already exists
    const existingDebts = await debtsRef.where('customerName', '==', debtData.customerName).limit(1).get();
    
    if (!existingDebts.empty) {
      return; // Skip silently
    }

    const data = {
      customerName: debtData.customerName,
      items: debtData.items,
      totalAmount: debtData.totalAmount,
      amountPaid: debtData.amountPaid,
      status: debtData.status,
      notes: debtData.notes,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await debtsRef.add(data);
  } catch (error) {
    log(`  ✗ Error creating debt for ${debtData.customerName}: ${error.message}`, 'red');
  }
}

// Main Seeding Function
async function seedDatabase() {
  try {
    log('\n╔════════════════════════════════════════════╗', 'cyan');
    log('║   Mock Data Seeding Script Starting...    ║', 'cyan');
    log('╚════════════════════════════════════════════╝\n', 'cyan');

    // 1. Create Users (Auth + Firestore)
    log('📋 Step 1: Creating Users...', 'blue');
    for (const userData of mockUsers) {
      await createAuthUser(userData);
      await createFirestoreUser(userData);
      await sleep(100); // Small delay to avoid rate limits
    }
    log(`✓ Users created: ${mockUsers.length}\n`, 'green');

    // 2. Create Stores
    log('🏪 Step 2: Creating Stores (with coordinates)...', 'blue');
    for (const storeData of mockStores) {
      await createStore(storeData);
      await sleep(100);
    }
    log(`✓ Stores created: ${mockStores.length}\n`, 'green');

    // 3. Create Products
    log('📦 Step 3: Creating Products...', 'blue');
    for (const productData of mockProducts) {
      await createProduct(productData);
    }
    log(`✓ Products created: ${mockProducts.length}\n`, 'green');

    // 4. Create Debts
    log('💰 Step 4: Creating Debt Records...', 'blue');
    for (const debtData of mockDebts) {
      await createDebt(debtData);
    }
    log(`✓ Debt records created: ${mockDebts.length}\n`, 'green');

    // Summary
    log('\n╔════════════════════════════════════════════╗', 'cyan');
    log('║         Seeding Complete! 🎉               ║', 'cyan');
    log('╚════════════════════════════════════════════╝\n', 'cyan');

    log('📊 Summary:', 'blue');
    log(`   • Users: ${mockUsers.length}`, 'white');
    log(`   • Stores: ${mockStores.length} (all with map coordinates)`, 'white');
    log(`   • Products: ${mockProducts.length}`, 'white');
    log(`   • Debt Records: ${mockDebts.length}`, 'white');

    log('\n📍 Store Locations:', 'blue');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
    mockStores.forEach(store => {
      log(`   • ${store.storeName}`, 'yellow');
      log(`     Coordinates: ${store.latitude}, ${store.longitude}`, 'white');
      log(`     Address: ${store.address}`, 'white');
    });

    log('\n🔑 Test Credentials:', 'blue');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
    log('\n   Admin:', 'yellow');
    log('   Email: admin@lumnaire.com', 'white');
    log('   Password: admin123', 'white');
    log('\n   Owner 1 (Approved):', 'yellow');
    log('   Email: owner1@store.com', 'white');
    log('   Password: owner123', 'white');
    log('\n   Owner 2 (Approved):', 'yellow');
    log('   Email: owner2@store.com', 'white');
    log('   Password: owner123', 'white');
    log('\n   Owner 3 (Pending Approval):', 'yellow');
    log('   Email: owner3@store.com', 'white');
    log('   Password: owner123', 'white');
    log('\n   Regular User 1:', 'yellow');
    log('   Email: user1@example.com', 'white');
    log('   Password: user123', 'white');
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  } catch (error) {
    log(`\n✗ Seeding failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run the seeding script
log('Starting database seeding...', 'cyan');
seedDatabase()
  .then(() => {
    log('✓ All done! You can now start using the application with map view.\n', 'green');
    process.exit(0);
  })
  .catch((error) => {
    log(`✗ Fatal error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
