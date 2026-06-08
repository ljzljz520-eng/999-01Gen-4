import { getDatabase } from '../db/index.js';
import type {
  DeviceQueryRequest,
  DeviceInfoResponse,
  DealerDevicesRequest,
  DealerDevicesResponse,
  Device,
  Warranty,
  ExtendedWarranty,
  ServiceCenter,
  DeviceType,
} from '../../shared/types.js';

function addMonths(dateStr: string, months: number): string {
  const date = new Date(dateStr);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
}

function calculateStatus(endDate: string): 'active' | 'expired' | 'pending' {
  const end = new Date(endDate);
  const now = new Date();
  if (end < now) return 'expired';
  return 'active';
}

export class DeviceService {
  private db = getDatabase();

  queryDevice(request: DeviceQueryRequest, dealerId?: string): DeviceInfoResponse | null {
    let sql = `
      SELECT
        d.id, d.serial_number, d.device_type, d.model, d.brand,
        d.purchase_date, d.invoice_exists, d.dealer_id, d.service_center_id,
        dl.name as dealer_name,
        w.整机保修期_months, w.主要部件保修期_months,
        w.warranty_start_date, w.warranty_end_date, w.status as warranty_status,
        ew.id as ew_id, ew.plan_name, ew.extended_months, ew.extended_end_date, ew.price, ew.purchased_at,
        sc.name as sc_name, sc.address as sc_address, sc.phone as sc_phone,
        sc.service_hours as sc_service_hours, sc.province as sc_province,
        sc.city as sc_city, sc.latitude as sc_latitude, sc.longitude as sc_longitude
      FROM devices d
      LEFT JOIN dealers dl ON d.dealer_id = dl.id
      LEFT JOIN warranties w ON d.id = w.device_id
      LEFT JOIN extended_warranties ew ON d.id = ew.device_id
      LEFT JOIN service_centers sc ON d.service_center_id = sc.id
      WHERE d.serial_number = ? AND d.device_type = ?
    `;

    const params: (string | number)[] = [request.serialNumber, request.deviceType];

    if (dealerId) {
      sql += ' AND d.dealer_id = ?';
      params.push(dealerId);
    }

    const row = this.db.prepare(sql).get(...params) as any;

    if (!row) return null;

    let warrantyStartDate = row.warranty_start_date || row.purchase_date;
    let warrantyEndDate = row.warranty_end_date;
    let warrantyStatus = row.warranty_status;

    if (!warrantyEndDate && warrantyStartDate) {
      warrantyEndDate = addMonths(warrantyStartDate, row.整机保修期_months);
    }

    if (row.invoice_exists && warrantyStatus === 'pending' && warrantyEndDate) {
      warrantyStatus = calculateStatus(warrantyEndDate);
    }

    const device: Device = {
      id: row.id,
      serialNumber: row.serial_number,
      deviceType: row.device_type as DeviceType,
      model: row.model,
      brand: row.brand,
      purchaseDate: row.purchase_date,
      invoiceExists: !!row.invoice_exists,
      dealerId: row.dealer_id,
      dealerName: row.dealer_name,
      serviceCenterId: row.service_center_id,
    };

    const warranty: Warranty = {整机保修期: `${row.整机保修期_months}个月`,
      主要部件保修期: `${row.主要部件保修期_months}个月`,
      保修开始日期: warrantyStartDate || '待确认',
      保修结束日期: warrantyEndDate || '待确认',
      保修状态: warrantyStatus,
    };

    const extendedWarranty: ExtendedWarranty | null = row.ew_id
      ? {
          hasExtendedWarranty: true,
          extendedPeriod: `${row.extended_months}个月`,
          extendedEndDate: row.extended_end_date,
          planName: row.plan_name,
          price: row.price,
        }
      : null;

    const serviceCenter: ServiceCenter = {
      id: row.service_center_id,
      name: row.sc_name,
      address: row.sc_address,
      phone: row.sc_phone,
      serviceHours: row.sc_service_hours || '周一至周日 9:00-18:00',
      province: row.sc_province,
      city: row.sc_city,
      latitude: row.sc_latitude,
      longitude: row.sc_longitude,
    };

    return { device, warranty, extendedWarranty, serviceCenter };
  }

  getDealerDevices(request: DealerDevicesRequest, dealerId: string): DealerDevicesResponse {
    let countSql = `
      SELECT COUNT(*) as total
      FROM devices d
      WHERE d.dealer_id = ?
    `;

    let listSql = `
      SELECT
        d.id, d.serial_number, d.device_type, d.model, d.brand,
        d.purchase_date, d.invoice_exists, d.dealer_id, d.service_center_id,
        dl.name as dealer_name,
        w.整机保修期_months, w.主要部件保修期_months,
        w.warranty_start_date, w.warranty_end_date, w.status as warranty_status,
        ew.id as ew_id, ew.plan_name, ew.extended_months, ew.extended_end_date, ew.price,
        sc.name as sc_name, sc.address as sc_address, sc.phone as sc_phone,
        sc.service_hours as sc_service_hours, sc.province as sc_province,
        sc.city as sc_city, sc.latitude as sc_latitude, sc.longitude as sc_longitude
      FROM devices d
      LEFT JOIN dealers dl ON d.dealer_id = dl.id
      LEFT JOIN warranties w ON d.id = w.device_id
      LEFT JOIN extended_warranties ew ON d.id = ew.device_id
      LEFT JOIN service_centers sc ON d.service_center_id = sc.id
      WHERE d.dealer_id = ?
    `;

    const countParams: (string | number)[] = [dealerId];
    const listParams: (string | number)[] = [dealerId];

    if (request.deviceType) {
      countSql += ' AND d.device_type = ?';
      listSql += ' AND d.device_type = ?';
      countParams.push(request.deviceType);
      listParams.push(request.deviceType);
    }

    if (request.keyword) {
      const keyword = `%${request.keyword}%`;
      countSql += ' AND (d.serial_number LIKE ? OR d.model LIKE ? OR d.brand LIKE ?)';
      listSql += ' AND (d.serial_number LIKE ? OR d.model LIKE ? OR d.brand LIKE ?)';
      countParams.push(keyword, keyword, keyword);
      listParams.push(keyword, keyword, keyword);
    }

    if (request.startDate) {
      countSql += ' AND d.purchase_date >= ?';
      listSql += ' AND d.purchase_date >= ?';
      countParams.push(request.startDate);
      listParams.push(request.startDate);
    }

    if (request.endDate) {
      countSql += ' AND d.purchase_date <= ?';
      listSql += ' AND d.purchase_date <= ?';
      countParams.push(request.endDate);
      listParams.push(request.endDate);
    }

    listSql += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
    listParams.push(request.pageSize, (request.page - 1) * request.pageSize);

    const { total } = this.db.prepare(countSql).get(...countParams) as { total: number };
    const rows = this.db.prepare(listSql).all(...listParams) as any[];

    const list: DeviceInfoResponse[] = rows.map((row) => {
      let warrantyStartDate = row.warranty_start_date || row.purchase_date;
      let warrantyEndDate = row.warranty_end_date;
      let warrantyStatus = row.warranty_status;

      if (!warrantyEndDate && warrantyStartDate) {
        warrantyEndDate = addMonths(warrantyStartDate, row.整机保修期_months);
      }

      if (row.invoice_exists && warrantyStatus === 'pending' && warrantyEndDate) {
        warrantyStatus = calculateStatus(warrantyEndDate);
      }

      const device: Device = {
        id: row.id,
        serialNumber: row.serial_number,
        deviceType: row.device_type as DeviceType,
        model: row.model,
        brand: row.brand,
        purchaseDate: row.purchase_date,
        invoiceExists: !!row.invoice_exists,
        dealerId: row.dealer_id,
        dealerName: row.dealer_name,
        serviceCenterId: row.service_center_id,
      };

      const warranty: Warranty = {整机保修期: `${row.整机保修期_months}个月`,
        主要部件保修期: `${row.主要部件保修期_months}个月`,
        保修开始日期: warrantyStartDate || '待确认',
        保修结束日期: warrantyEndDate || '待确认',
        保修状态: warrantyStatus,
      };

      const extendedWarranty: ExtendedWarranty | null = row.ew_id
        ? {
            hasExtendedWarranty: true,
            extendedPeriod: `${row.extended_months}个月`,
            extendedEndDate: row.extended_end_date,
            planName: row.plan_name,
            price: row.price,
          }
        : null;

      const serviceCenter: ServiceCenter = {
        id: row.service_center_id,
        name: row.sc_name,
        address: row.sc_address,
        phone: row.sc_phone,
        serviceHours: row.sc_service_hours || '周一至周日 9:00-18:00',
        province: row.sc_province,
        city: row.sc_city,
        latitude: row.sc_latitude,
        longitude: row.sc_longitude,
      };

      return { device, warranty, extendedWarranty, serviceCenter };
    });

    return {
      total,
      list,
      page: request.page,
      pageSize: request.pageSize,
    };
  }

  getDealerStats(dealerId: string) {
    const totalDevices = this.db.prepare(
      'SELECT COUNT(*) as count FROM devices WHERE dealer_id = ?'
    ).get(dealerId) as { count: number };

    const activeWarranties = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM devices d
      JOIN warranties w ON d.id = w.device_id
      WHERE d.dealer_id = ? AND w.status = 'active'
    `).get(dealerId) as { count: number };

    const expiredWarranties = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM devices d
      JOIN warranties w ON d.id = w.device_id
      WHERE d.dealer_id = ? AND w.status = 'expired'
    `).get(dealerId) as { count: number };

    const extendedWarranties = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM devices d
      JOIN extended_warranties ew ON d.id = ew.device_id
      WHERE d.dealer_id = ?
    `).get(dealerId) as { count: number };

    const pendingReviews = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM review_applications
      WHERE status = 'pending'
    `).get() as { count: number };

    return {
      totalDevices: totalDevices.count,
      activeWarranties: activeWarranties.count,
      expiredWarranties: expiredWarranties.count,
      extendedWarranties: extendedWarranties.count,
      pendingReviews: pendingReviews.count,
    };
  }

  getAllDevices(params: {
    page: number;
    pageSize: number;
    deviceType?: string;
    dealerId?: string;
    keyword?: string;
    startDate?: string;
    endDate?: string;
  }): { total: number; list: Array<DeviceInfoResponse & { dealer?: { id: string; name: string } }> } {
    let countSql = `
      SELECT COUNT(*) as total
      FROM devices d
      WHERE 1=1
    `;

    let listSql = `
      SELECT
        d.id, d.serial_number, d.device_type, d.model, d.brand,
        d.purchase_date, d.invoice_exists, d.dealer_id, d.service_center_id,
        dl.id as dealer_id, dl.name as dealer_name, dl.code as dealer_code,
        w.整机保修期_months, w.主要部件保修期_months,
        w.warranty_start_date, w.warranty_end_date, w.status as warranty_status,
        ew.id as ew_id, ew.plan_name, ew.extended_months, ew.extended_end_date, ew.price,
        sc.name as sc_name, sc.address as sc_address, sc.phone as sc_phone,
        sc.service_hours as sc_service_hours, sc.province as sc_province,
        sc.city as sc_city, sc.latitude as sc_latitude, sc.longitude as sc_longitude
      FROM devices d
      LEFT JOIN dealers dl ON d.dealer_id = dl.id
      LEFT JOIN warranties w ON d.id = w.device_id
      LEFT JOIN extended_warranties ew ON d.id = ew.device_id
      LEFT JOIN service_centers sc ON d.service_center_id = sc.id
      WHERE 1=1
    `;

    const countParams: (string | number)[] = [];
    const listParams: (string | number)[] = [];

    if (params.deviceType) {
      countSql += ' AND d.device_type = ?';
      listSql += ' AND d.device_type = ?';
      countParams.push(params.deviceType);
      listParams.push(params.deviceType);
    }

    if (params.dealerId) {
      countSql += ' AND d.dealer_id = ?';
      listSql += ' AND d.dealer_id = ?';
      countParams.push(params.dealerId);
      listParams.push(params.dealerId);
    }

    if (params.keyword) {
      const keyword = `%${params.keyword}%`;
      countSql += ' AND (d.serial_number LIKE ? OR d.model LIKE ? OR d.brand LIKE ?)';
      listSql += ' AND (d.serial_number LIKE ? OR d.model LIKE ? OR d.brand LIKE ?)';
      countParams.push(keyword, keyword, keyword);
      listParams.push(keyword, keyword, keyword);
    }

    if (params.startDate) {
      countSql += ' AND d.purchase_date >= ?';
      listSql += ' AND d.purchase_date >= ?';
      countParams.push(params.startDate);
      listParams.push(params.startDate);
    }

    if (params.endDate) {
      countSql += ' AND d.purchase_date <= ?';
      listSql += ' AND d.purchase_date <= ?';
      countParams.push(params.endDate);
      listParams.push(params.endDate);
    }

    listSql += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
    listParams.push(params.pageSize, (params.page - 1) * params.pageSize);

    const { total } = this.db.prepare(countSql).get(...countParams) as { total: number };
    const rows = this.db.prepare(listSql).all(...listParams) as any[];

    const list = rows.map((row) => {
      let warrantyStartDate = row.warranty_start_date || row.purchase_date;
      let warrantyEndDate = row.warranty_end_date;
      let warrantyStatus = row.warranty_status;

      if (!warrantyEndDate && warrantyStartDate) {
        warrantyEndDate = addMonths(warrantyStartDate, row.整机保修期_months);
      }

      if (row.invoice_exists && warrantyStatus === 'pending' && warrantyEndDate) {
        warrantyStatus = calculateStatus(warrantyEndDate);
      }

      const device: Device = {
        id: row.id,
        serialNumber: row.serial_number,
        deviceType: row.device_type as DeviceType,
        model: row.model,
        brand: row.brand,
        purchaseDate: row.purchase_date,
        invoiceExists: !!row.invoice_exists,
        dealerId: row.dealer_id,
        dealerName: row.dealer_name,
        serviceCenterId: row.service_center_id,
      };

      const warranty: Warranty = {整机保修期: `${row.整机保修期_months}个月`,
        主要部件保修期: `${row.主要部件保修期_months}个月`,
        保修开始日期: warrantyStartDate || '待确认',
        保修结束日期: warrantyEndDate || '待确认',
        保修状态: warrantyStatus,
      };

      const extendedWarranty: ExtendedWarranty | null = row.ew_id
        ? {
            hasExtendedWarranty: true,
            extendedPeriod: `${row.extended_months}个月`,
            extendedEndDate: row.extended_end_date,
            planName: row.plan_name,
            price: row.price,
          }
        : null;

      const serviceCenter: ServiceCenter = {
        id: row.service_center_id,
        name: row.sc_name,
        address: row.sc_address,
        phone: row.sc_phone,
        serviceHours: row.sc_service_hours || '周一至周日 9:00-18:00',
        province: row.sc_province,
        city: row.sc_city,
        latitude: row.sc_latitude,
        longitude: row.sc_longitude,
      };

      const dealer = row.dealer_id
        ? { id: row.dealer_id, name: row.dealer_name }
        : undefined;

      return { device, warranty, extendedWarranty, serviceCenter, dealer };
    });

    return { total, list };
  }

  getAllDealers(): Array<{ id: string; name: string; code: string; contactPerson: string; contactPhone: string; email: string; address: string }> {
    const rows = this.db.prepare(`
      SELECT id, name, code, contact_person, contact_phone, email, address
      FROM dealers
      ORDER BY created_at DESC
    `).all() as any[];

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      code: row.code,
      contactPerson: row.contact_person,
      contactPhone: row.contact_phone,
      email: row.email,
      address: row.address,
    }));
  }
}

export default DeviceService;
