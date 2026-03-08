import { generateToken, getPermissions } from '../config/auth.js';
import * as Admin from '../models/adminModel.js';

export async function login(req, res) {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ error: 'id와 password는 필수입니다.' });
  }

  const account = await Admin.findByCredentials(id, password);
  if (!account) {
    return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
  }

  const token = generateToken(account);
  res.json({ token, role: account.role, permissions: getPermissions(account.role) });
}

export async function me(req, res) {
  res.json({ id: req.user.id, role: req.user.role, permissions: getPermissions(req.user.role) });
}
