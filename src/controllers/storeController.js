import * as Store from '../models/storeModel.js';
import * as StoreProduct from '../models/storeProductModel.js';

function toSlug(name) {
  return name.trim().toLowerCase().replace(/\s+/g, '-');
}

export async function getStores(_req, res) {
  const stores = await Store.findAll();
  res.json(stores);
}

export async function createStore(req, res) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name은 필수입니다.' });

  const slug = req.body.slug || toSlug(name);
  const store = { name, slug, createdAt: new Date() };
  const created = await Store.create(store);
  res.status(201).json(created);
}

export async function updateStore(req, res) {
  const storeId = req.storeObjectId;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name은 필수입니다.' });

  const update = { name };
  if (req.body.slug) update.slug = req.body.slug;

  const result = await Store.updateById(storeId, update);
  if (!result) return res.status(404).json({ error: '장소를 찾을 수 없습니다.' });
  res.json(result);
}

export async function deleteStore(req, res) {
  const storeId = req.storeObjectId;

  await StoreProduct.deleteByStore(storeId);
  await Store.deleteById(storeId);
  res.json({ success: true });
}
