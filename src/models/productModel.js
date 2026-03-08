import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';

function collection() {
  return getDB().collection('products');
}

export async function findAll() {
  return collection().find().toArray();
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
