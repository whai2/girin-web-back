import * as Category from '../models/categoryModel.js';

export async function getCategories(_req, res) {
  const categories = await Category.findAll();
  res.json(categories);
}

export async function createCategory(req, res) {
  const { name, order } = req.body;
  if (!name) return res.status(400).json({ error: 'name은 필수입니다.' });

  const category = { name, order: order ?? 0, createdAt: new Date() };
  const created = await Category.create(category);
  res.status(201).json(created);
}

export async function updateCategory(req, res) {
  const { id } = req.params;
  const { name, order } = req.body;

  const update = {};
  if (name !== undefined) update.name = name;
  if (order !== undefined) update.order = order;

  if (Object.keys(update).length === 0) {
    return res.status(400).json({ error: '수정할 항목이 없습니다.' });
  }

  const result = await Category.updateById(id, update);
  if (!result) return res.status(404).json({ error: '카테고리를 찾을 수 없습니다.' });
  res.json(result);
}

export async function deleteCategory(req, res) {
  const { id } = req.params;
  const result = await Category.deleteById(id);
  if (result.deletedCount === 0) return res.status(404).json({ error: '카테고리를 찾을 수 없습니다.' });
  res.json({ success: true });
}
