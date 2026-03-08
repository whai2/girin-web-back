import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';

function collection() {
  return getDB().collection('storeProducts');
}

export async function findByStore(storeId) {
  return collection().find({ storeId: new ObjectId(storeId) }).toArray();
}

export async function findOne(storeId, productId) {
  return collection().findOne({
    storeId: new ObjectId(storeId),
    productId: new ObjectId(productId),
  });
}

export async function upsert(storeId, productId, data) {
  return collection().findOneAndUpdate(
    { storeId: new ObjectId(storeId), productId: new ObjectId(productId) },
    { $set: { ...data, storeId: new ObjectId(storeId), productId: new ObjectId(productId) } },
    { upsert: true, returnDocument: 'after' }
  );
}

export async function deleteByStore(storeId) {
  return collection().deleteMany({ storeId: new ObjectId(storeId) });
}

export async function deleteByProduct(productId) {
  return collection().deleteMany({ productId: new ObjectId(productId) });
}
