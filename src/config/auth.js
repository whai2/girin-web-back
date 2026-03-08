import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'girin-secret-key';

// 권한 계층: super_manager > manager > staff
const ROLE_HIERARCHY = ['staff', 'manager', 'super_manager'];

export function getPermissions(role) {
  const level = ROLE_HIERARCHY.indexOf(role);
  return {
    canView: level >= 0,        // staff 이상
    canEdit: level >= 1,        // manager 이상
    canDelete: level >= 2,      // super_manager만
  };
}

export function generateToken(account) {
  return jwt.sign({ id: account.id, role: account.role }, JWT_SECRET, { expiresIn: '21d' });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
