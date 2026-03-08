import { getDB } from '../config/db.js';

function collection() {
  return getDB().collection('admins');
}

export async function findByCredentials(id, password) {
  return collection().findOne({ id, password });
}

export async function findAll() {
  return collection().find().toArray();
}

export async function insertMany(admins) {
  return collection().insertMany(admins);
}

export async function count() {
  return collection().countDocuments();
}
