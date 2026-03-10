import * as Product from '../models/productModel.js';
import * as StoreProduct from '../models/storeProductModel.js';
import { uploadToS3, deleteFromS3 } from '../config/s3.js';

export async function getProducts(req, res) {
  const { search, category, page, limit } = req.query;

  // 쿼리 파라미터가 없으면 기존 동작 유지
  if (!search && !category && !page && !limit) {
    const products = await Product.findAll();
    return res.json(products);
  }

  const result = await Product.findWithFilter({ search, category, page, limit });
  res.json({
    items: result.items,
    total: result.total,
    page: Number(page) || 1,
    limit: Number(limit) || result.total,
  });
}

export async function createProduct(req, res) {
  const { name, number, category, price, smartStoreUrl } = req.body;

  if (!name || !category) {
    return res.status(400).json({ error: 'name과 category는 필수입니다.' });
  }

  let image = '';
  let thumbnail = '';
  if (req.file) {
    const result = await uploadToS3(req.file);
    image = result.image;
    thumbnail = result.thumbnail;
  }

  const product = {
    name,
    number: Number(number) || 0,
    category: Number(category),
    price: Number(price) || 20000,
    image,
    thumbnail,
    smartStoreUrl: smartStoreUrl || '',
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
  if (req.body.smartStoreUrl !== undefined) update.smartStoreUrl = req.body.smartStoreUrl;
  if (req.file) {
    const existing = await Product.findById(id);
    if (existing?.image) {
      await deleteFromS3(existing.image).catch(() => {});
    }
    if (existing?.thumbnail) {
      await deleteFromS3(existing.thumbnail).catch(() => {});
    }
    const result = await uploadToS3(req.file);
    update.image = result.image;
    update.thumbnail = result.thumbnail;
  }

  const result = await Product.updateById(id, update);
  if (!result) return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
  res.json(result);
}

export async function deleteProduct(req, res) {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });

  if (product.image) {
    await deleteFromS3(product.image).catch(() => {});
  }
  if (product.thumbnail) {
    await deleteFromS3(product.thumbnail).catch(() => {});
  }

  await StoreProduct.deleteByProduct(id);
  await Product.deleteById(id);
  res.json({ success: true });
}
