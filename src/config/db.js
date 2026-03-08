import { MongoClient } from 'mongodb';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo:27017';
const DB_NAME = 'girin';

let db;

export async function connectDB() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  db = client.db(DB_NAME);
  console.log('MongoDB connected');

  // products 컬렉션 초기화
  const col = db.collection('products');
  const productCount = await col.countDocuments();
  if (productCount === 0) {
    console.log('Initializing default products...');
    const { defaultProducts } = await import('../seed.js');
    await col.insertMany(defaultProducts);
    console.log(`Inserted ${defaultProducts.length} default products`);
  }

  // categories 컬렉션 초기화
  const categoriesCol = db.collection('categories');
  const categoryCount = await categoriesCol.countDocuments();
  if (categoryCount === 0) {
    console.log('Initializing default categories...');
    const categories = [
      { name: '기린 시즌1', order: 1 },
      { name: '기린 시즌2', order: 2 },
      { name: '기린 시즌3', order: 3 },
      { name: '음식', order: 4 },
    ];
    await categoriesCol.insertMany(categories);
    console.log(`Inserted ${categories.length} default categories`);
  }

  // admins 컬렉션 초기화
  const adminsCol = db.collection('admins');
  const adminCount = await adminsCol.countDocuments();
  if (adminCount === 0) {
    console.log('Initializing admin accounts...');
    const admins = [
      { id: process.env.SUPER_MANAGER, password: process.env.SUPER_MANAGER_PASSWORD, role: 'super_manager' },
      { id: process.env.MANAGER, password: process.env.MANAGER_PASSWORD, role: 'manager' },
      { id: process.env.STAFF, password: process.env.STAFF_PASSWORD, role: 'staff' },
    ];
    await adminsCol.insertMany(admins);
    console.log(`Inserted ${admins.length} admin accounts`);
  }
}

export function getDB() {
  return db;
}
