import fs from 'fs';
import path from 'path';
import * as Product from '../models/productModel.js';
import * as StoreProduct from '../models/storeProductModel.js';
import { UPLOAD_DIR } from '../config/upload.js';

export async function getProducts(_req, res) {
  const products = await Product.findAll();
  res.json(products);
}

export async function createProduct(req, res) {
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
    createdAt: new Date(),
  };

  const created = await Product.create(product);
  res.status(201).json(created);
}

export async function updateProduct(req, res) {
  const { id } = req.params;
  const update = {};

  if (req.body.name !== undefined) update.name = req.body.name;
  if (req.body.number !== undefined) update.number = Number(req.body.number);
  if (req.body.category !== undefined) update.category = Number(req.body.category);
  if (req.body.price !== undefined) update.price = Number(req.body.price);
  if (req.file) {
    update.image = `/uploads/${req.file.filename}`;
  }

  const result = await Product.updateById(id, update);
  if (!result) return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
  res.json(result);
}

export async function deleteProduct(req, res) {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });

  if (product.image && product.image.startsWith('/uploads/')) {
    const filename = path.basename(product.image);
    const filePath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  await StoreProduct.deleteByProduct(id);
  await Product.deleteById(id);
  res.json({ success: true });
}
