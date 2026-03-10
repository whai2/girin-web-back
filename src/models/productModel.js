import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';

function collection() {
  return getDB().collection('products');
}

export async function findAll() {
  return collection().find().sort({ _id: -1 }).toArray();
}

export async function findWithFilter({ search, category, page, limit } = {}) {
  const filter = {};

  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }
  if (category !== undefined) {
    filter.category = Number(category);
  }

  const query = collection().find(filter).sort({ _id: -1 });

  if (page && limit) {
    const skip = (Number(page) - 1) * Number(limit);
    query.skip(skip).limit(Number(limit));
  }

  const [items, total] = await Promise.all([
    query.toArray(),
    collection().countDocuments(filter),
  ]);

  return { items, total };
}

export async function findById(id) {
  return collection().findOne({ _id: new ObjectId(id) });
}

export async function create(product) {
  const result = await collection().insertOne(product);
  return { ...product, _id: result.insertedId };
}

export async function updateById(id, update) {
  return collection().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: update },
    { returnDocument: 'after' }
  );
}

export async function deleteById(id) {
  return collection().deleteOne({ _id: new ObjectId(id) });
}
