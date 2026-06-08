import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { ReviewService } from '../services/ReviewService.js';
import type { ReviewApplicationRequest, ReviewStatus } from '../../shared/types.js';

const router = Router();
const reviewService = new ReviewService();

router.post('/', (req: Request, res: Response) => {
  try {
    const request = req.body as ReviewApplicationRequest;

    if (!request.deviceType || !request.serialNumber || !request.contactName || !request.contactPhone || !request.purchaseChannel || !request.description) {
      res.status(400).json({ error: '请填写完整的申请信息' });
      return;
    }

    const result = reviewService.createApplication(request);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : '提交失败' });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const application = reviewService.getApplication(id);

    if (!application) {
      res.status(404).json({ error: '申请不存在' });
      return;
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : '查询失败' });
  }
});

router.get('/', authenticateToken, requireRole(['admin']), (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const status = req.query.status as ReviewStatus | undefined;
    const keyword = req.query.keyword as string | undefined;

    const result = reviewService.getApplications({ page, pageSize, status, keyword });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : '查询失败' });
  }
});

router.put('/:id/approve', authenticateToken, requireRole(['admin']), (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: '未授权' });
      return;
    }

    const { id } = req.params;
    const { remark } = req.body as { remark?: string };

    reviewService.approveApplication(id, req.user.id, remark);
    res.json({ message: '审核通过' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : '操作失败' });
  }
});

router.put('/:id/reject', authenticateToken, requireRole(['admin']), (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: '未授权' });
      return;
    }

    const { id } = req.params;
    const { remark } = req.body as { remark: string };

    if (!remark) {
      res.status(400).json({ error: '请填写驳回原因' });
      return;
    }

    reviewService.rejectApplication(id, req.user.id, remark);
    res.json({ message: '已驳回申请' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : '操作失败' });
  }
});

export default router;
