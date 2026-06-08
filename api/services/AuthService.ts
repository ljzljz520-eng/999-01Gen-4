import bcrypt from 'bcrypt';
import { getDatabase } from '../db/index.js';
import { generateToken } from '../middleware/auth.js';
import type { LoginRequest, LoginResponse, User } from '../../shared/types.js';

export class AuthService {
  private db = getDatabase();

  async login(request: LoginRequest): Promise<LoginResponse> {
    const userRow = this.db.prepare(`
      SELECT u.id, u.username, u.role, u.dealer_id, u.name, u.password_hash
      FROM users u
      WHERE u.username = ? AND u.role = ?
    `).get(request.username, request.role) as {
      id: string;
      username: string;
      role: string;
      dealer_id: string | null;
      name: string;
      password_hash: string;
    } | undefined;

    if (!userRow) {
      throw new Error('用户名或密码错误');
    }

    const isValid = await bcrypt.compare(request.password, userRow.password_hash);
    if (!isValid) {
      throw new Error('用户名或密码错误');
    }

    const user: User = {
      id: userRow.id,
      username: userRow.username,
      role: userRow.role as 'dealer' | 'admin',
      name: userRow.name,
      ...(userRow.dealer_id ? { dealerId: userRow.dealer_id } : {}),
    };

    const token = generateToken(user);

    return { token, user };
  }

  getCurrentUser(userId: string): User | null {
    const userRow = this.db.prepare(`
      SELECT u.id, u.username, u.role, u.dealer_id, u.name
      FROM users u
      WHERE u.id = ?
    `).get(userId) as {
      id: string;
      username: string;
      role: string;
      dealer_id: string | null;
      name: string;
    } | undefined;

    if (!userRow) return null;

    return {
      id: userRow.id,
      username: userRow.username,
      role: userRow.role as 'dealer' | 'admin',
      name: userRow.name,
      ...(userRow.dealer_id ? { dealerId: userRow.dealer_id } : {}),
    };
  }
}

export default AuthService;
