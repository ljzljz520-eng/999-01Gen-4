import { getDatabase } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';
import type {
  ReviewApplicationRequest,
  ReviewApplicationResponse,
  ReviewApplication,
  ReviewStatus,
  DeviceType,
} from '../../shared/types.js';

function generateId(): string {
  return uuidv4().replace(/-/g, '').slice(0, 32);
}

export class ReviewService {
  private db = getDatabase();

  createApplication(request: ReviewApplicationRequest): ReviewApplicationResponse {
    const id = generateId();

    this.db.prepare(`
      INSERT INTO review_applications (
        id, device_type, serial_number, contact_name, contact_phone,
        purchase_date, purchase_channel, description, proof_files, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(
      id,
      request.deviceType,
      request.serialNumber,
      request.contactName,
      request.contactPhone,
      request.purchaseDate || null,
      request.purchaseChannel,
      request.description,
      JSON.stringify(request.proofFiles)
    );

    return {
      applicationId: id,
      status: 'pending',
      message: '审核申请已提交，请等待管理员审核',
    };
  }

  getApplication(id: string): ReviewApplication | null {
    const row = this.db.prepare(`
      SELECT * FROM review_applications WHERE id = ?
    `).get(id) as any;

    if (!row) return null;

    return this.mapRowToApplication(row);
  }

  getApplications(params: {
    page: number;
    pageSize: number;
    status?: ReviewStatus;
    keyword?: string;
  }): { total: number; list: ReviewApplication[] } {
    let countSql = 'SELECT COUNT(*) as total FROM review_applications WHERE 1=1';
    let listSql = 'SELECT * FROM review_applications WHERE 1=1';

    const countParams: (string | number)[] = [];
    const listParams: (string | number)[] = [];

    if (params.status) {
      countSql += ' AND status = ?';
      listSql += ' AND status = ?';
      countParams.push(params.status);
      listParams.push(params.status);
    }

    if (params.keyword) {
      const keyword = `%${params.keyword}%`;
      countSql += ' AND (serial_number LIKE ? OR contact_name LIKE ? OR contact_phone LIKE ?)';
      listSql += ' AND (serial_number LIKE ? OR contact_name LIKE ? OR contact_phone LIKE ?)';
      countParams.push(keyword, keyword, keyword);
      listParams.push(keyword, keyword, keyword);
    }

    listSql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    listParams.push(params.pageSize, (params.page - 1) * params.pageSize);

    const { total } = this.db.prepare(countSql).get(...countParams) as { total: number };
    const rows = this.db.prepare(listSql).all(...listParams) as any[];

    return {
      total,
      list: rows.map((row) => this.mapRowToApplication(row)),
    };
  }

  approveApplication(id: string, adminId: string, remark?: string): void {
    const now = new Date().toISOString();

    this.db.prepare(`
      UPDATE review_applications
      SET status = 'approved', admin_id = ?, review_remark = ?, reviewed_at = ?
      WHERE id = ?
    `).run(adminId, remark || '审核通过', now, id);

    const app = this.getApplication(id);
    if (app) {
      const existingDevice = this.db.prepare(`
        SELECT id FROM devices WHERE serial_number = ? AND device_type = ?
      `).get(app.serialNumber, app.deviceType) as { id: string } | undefined;

      if (existingDevice && app.purchaseDate) {
        this.db.prepare(`
          UPDATE devices
          SET purchase_date = ?, invoice_exists = 1
          WHERE id = ?
        `).run(app.purchaseDate, existingDevice.id);

        this.db.prepare(`
          UPDATE warranties
          SET warranty_start_date = ?, warranty_end_date = DATE(?, '+12 months'), status = 'active'
          WHERE device_id = ?
        `).run(app.purchaseDate, app.purchaseDate, existingDevice.id);
      }
    }
  }

  rejectApplication(id: string, adminId: string, remark: string): void {
    const now = new Date().toISOString();

    this.db.prepare(`
      UPDATE review_applications
      SET status = 'rejected', admin_id = ?, review_remark = ?, reviewed_at = ?
      WHERE id = ?
    `).run(adminId, remark, now, id);
  }

  private mapRowToApplication(row: any): ReviewApplication {
    return {
      id: row.id,
      deviceType: row.device_type as DeviceType,
      serialNumber: row.serial_number,
      contactName: row.contact_name,
      contactPhone: row.contact_phone,
      purchaseDate: row.purchase_date,
      purchaseChannel: row.purchase_channel,
      description: row.description,
      proofFiles: row.proof_files ? JSON.parse(row.proof_files) : [],
      status: row.status as ReviewStatus,
      adminId: row.admin_id,
      reviewRemark: row.review_remark,
      reviewedAt: row.reviewed_at,
      createdAt: row.created_at,
    };
  }
}

export default ReviewService;
