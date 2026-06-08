import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { AuthService } from '../services/AuthService.js';
import type { LoginRequest } from '../../shared/types.js';

const router = Router();
const authService = new AuthService();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body as LoginRequest;

    if (!username || !password || !role) {
      res.status(400).json({ error: '请填写完整的登录信息' });
      return;
    }

    const result = await authService.login({ username, password, role });
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : '登录失败' });
  }
});

router.post('/logout', (_req: Request, res: Response) => {
  res.json({ message: '已退出登录' });
});

router.get('/me', authenticateToken, (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: '未登录' });
    return;
  }

  const user = authService.getCurrentUser(req.user.id);
  if (!user) {
    res.status(404).json({ error: '用户不存在' });
    return;
  }

  res.json(user);
});

export default router;
