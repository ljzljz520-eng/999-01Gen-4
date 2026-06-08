import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { User, UserRole } from '../../shared/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'warranty-portal-secret-key-2024';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: '未提供认证令牌' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as User;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: '认证令牌无效或已过期' });
    return;
  }
}

export function requireRole(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: '未登录' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: '权限不足' });
      return;
    }

    next();
  };
}

export function generateToken(user: User): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

export default authenticateToken;
