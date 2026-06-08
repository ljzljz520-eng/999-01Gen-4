import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { DeviceService } from '../services/DeviceService.js';
import type { DeviceQueryRequest } from '../../shared/types.js';

const router = Router();
const deviceService = new DeviceService();

router.get('/query', (req: Request, res: Response) => {
  try {
    const { deviceType, serialNumber } = req.query as Partial<DeviceQueryRequest>;

    if (!deviceType || !serialNumber) {
      res.status(400).json({ error: '请提供设备类型和序列号' });
      return;
    }

    let dealerId: string | undefined;
    if (req.user && req.user.role === 'dealer' && req.user.dealerId) {
      dealerId = req.user.dealerId;
    }

    const result = deviceService.queryDevice({ deviceType, serialNumber }, dealerId);

    if (!result) {
      res.status(404).json({ error: '未找到该设备信息，请检查序列号是否正确' });
      return;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : '查询失败' });
  }
});

router.get('/dealer', authenticateToken, requireRole(['dealer']), (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.dealerId) {
      res.status(401).json({ error: '未授权' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const deviceType = req.query.deviceType as string | undefined;
    const keyword = req.query.keyword as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const result = deviceService.getDealerDevices(
      {
        page,
        pageSize,
        ...(deviceType ? { deviceType: deviceType as any } : {}),
        ...(keyword ? { keyword } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      },
      req.user.dealerId
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : '查询失败' });
  }
});

router.get('/dealer/stats', authenticateToken, requireRole(['dealer']), (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.dealerId) {
      res.status(401).json({ error: '未授权' });
      return;
    }

    const stats = deviceService.getDealerStats(req.user.dealerId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : '查询失败' });
  }
});

router.get('/all', authenticateToken, requireRole(['admin']), (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const deviceType = req.query.deviceType as string | undefined;
    const dealerId = req.query.dealerId as string | undefined;
    const keyword = req.query.keyword as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const result = deviceService.getAllDevices({
      page,
      pageSize,
      ...(deviceType ? { deviceType } : {}),
      ...(dealerId ? { dealerId } : {}),
      ...(keyword ? { keyword } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : '查询失败' });
  }
});

router.get('/dealers', authenticateToken, requireRole(['admin']), (req: Request, res: Response) => {
  try {
    const dealers = deviceService.getAllDealers();
    res.json(dealers);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : '查询失败' });
  }
});

export default router;
