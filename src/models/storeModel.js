import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';

function collection() {
  return getDB().collection('stores');
}

export async function findAll() {
  return collection().find().toArray();
}

export async function findById(id) {
  return collection().findOne({ _id: new ObjectId(id) });
}

export async function findBySlug(slug) {
  return collection().findOne({ slug });
}

export async function create(store) {
  const result = await collection().insertOne(store);
  return { ...store, _id: result.insertedId };
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
