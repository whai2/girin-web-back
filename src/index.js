import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { MongoClient, ObjectId } from 'mongodb';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo:27017';
const DB_NAME = 'girin';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('/app/uploads'));

// Multer 설정 - 이미지 업로드
const storage = multer.diskStorage({
  destination: '/app/uploads',
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// MongoDB 연결
let db;
async function connectDB() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  db = client.db(DB_NAME);
  console.log('MongoDB connected');

  // products 컬렉션 초기화
  const col = db.collection('products');
  const count = await col.countDocuments();
  if (count === 0) {
    console.log('Initializing default products...');
    const { defaultProducts } = await import('./seed.js');
    await col.insertMany(defaultProducts);
    console.log(`Inserted ${defaultProducts.length} default products`);
  }
}

// ===== API Routes =====

// 전체 상품 조회
app.get('/api/products', async (_req, res) => {
  const products = await db.collection('products').find().toArray();
  res.json(products);
});

// 상품 등록 (이미지 포함)
app.post('/api/products', upload.single('image'), async (req, res) => {
  const { name, number, category, price } = req.body;

  if (!name || !category) {
    return res.status(400).json({ error: 'name과 category는 필수입니다.' });
  }

  const product = {
    name,
    number: Number(number) || 0,
    category: Number(category),
    price: Number(price) || 20000,
    image: req.file ? `/uploads/${req.file.filename}` : '',
    soldOut: false,
    soldOutSizes: [],
    createdAt: new Date(),
  };

  const result = await db.collection('products').insertOne(product);
  res.status(201).json({ ...product, _id: result.insertedId });
});

// 상품 수정
app.patch('/api/products/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const update = {};

  if (req.body.name !== undefined) update.name = req.body.name;
  if (req.body.number !== undefined) update.number = Number(req.body.number);
  if (req.body.category !== undefined) update.category = Number(req.body.category);
  if (req.body.price !== undefined) update.price = Number(req.body.price);
  if (req.body.soldOut !== undefined) update.soldOut = req.body.soldOut === 'true' || req.body.soldOut === true;
  if (req.body.soldOutSizes !== undefined) {
    update.soldOutSizes = JSON.parse(req.body.soldOutSizes);
  }
  if (req.file) {
    update.image = `/uploads/${req.file.filename}`;
  }

  const result = await db.collection('products').findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: update },
    { returnDocument: 'after' }
  );

  if (!result) return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
  res.json(result);
});

// 상품 삭제
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  const product = await db.collection('products').findOne({ _id: new ObjectId(id) });
  if (!product) return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });

  // 업로드된 이미지 삭제
  if (product.image && product.image.startsWith('/uploads/')) {
    const filePath = `/app${product.image}`;
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  await db.collection('products').deleteOne({ _id: new ObjectId(id) });
  res.json({ success: true });
});

// 판매 상태 토글
app.patch('/api/products/:id/toggle-soldout', async (req, res) => {
  const { id } = req.params;
  const product = await db.collection('products').findOne({ _id: new ObjectId(id) });
  if (!product) return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });

  const result = await db.collection('products').findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { soldOut: !product.soldOut } },
    { returnDocument: 'after' }
  );
  res.json(result);
});

// 사이즈별 품절 토글
app.patch('/api/products/:id/toggle-size', async (req, res) => {
  const { id } = req.params;
  const { size } = req.body;

  const product = await db.collection('products').findOne({ _id: new ObjectId(id) });
  if (!product) return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });

  const sizes = product.soldOutSizes || [];
  const updatedSizes = sizes.includes(size)
    ? sizes.filter((s) => s !== size)
    : [...sizes, size];

  const result = await db.collection('products').findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { soldOutSizes: updatedSizes } },
    { returnDocument: 'after' }
  );
  res.json(result);
});

// 카테고리 목록 조회
app.get('/api/categories', async (_req, res) => {
  const categories = await db.collection('categories').find().toArray();
  res.json(categories);
});

// 서버 시작
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
