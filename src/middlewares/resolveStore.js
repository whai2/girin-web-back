import { ObjectId } from 'mongodb';
import * as Store from '../models/storeModel.js';

export async function resolveStore(req, res, next) {
  const param = req.params.storeId || req.params.id;
  if (!param) return next();

  let store;
  if (ObjectId.isValid(param) && param.length === 24) {
    store = await Store.findById(param);
  } else {
    store = await Store.findBySlug(param);
  }

  if (!store) return res.status(404).json({ error: '장소를 찾을 수 없습니다.' });

  req.store = store;
  req.storeObjectId = store._id.toString();
  next();
}
