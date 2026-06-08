import { getDatabase } from './index.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import type { DeviceType } from '../../shared/types.js';

function generateId(): string {
  return uuidv4().replace(/-/g, '').slice(0, 32);
}

export function seedDatabase(): void {
  const db = getDatabase();

  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (existingUsers.count > 0) {
    return;
  }

  const hashPassword = (password: string): string => {
    return bcrypt.hashSync(password, 10);
  };

  const dealers = [
    { id: generateId(), name: '北京家电销售有限公司', contactPerson: '张经理', phone: '010-12345678', address: '北京市朝阳区建国路88号' },
    { id: generateId(), name: '上海家电销售有限公司', contactPerson: '李经理', phone: '021-87654321', address: '上海市浦东新区陆家嘴环路1000号' },
  ];

  const insertDealer = db.prepare(`
    INSERT INTO dealers (id, name, contact_person, phone, address)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const dealer of dealers) {
    insertDealer.run(dealer.id, dealer.name, dealer.contactPerson, dealer.phone, dealer.address);
  }

  const users = [
    { id: generateId(), username: 'admin', password: hashPassword('admin123456'), role: 'admin', dealerId: null, name: '系统管理员' },
    { id: generateId(), username: 'dealer001', password: hashPassword('dealer123456'), role: 'dealer', dealerId: dealers[0].id, name: '北京经销商' },
    { id: generateId(), username: 'dealer002', password: hashPassword('dealer123456'), role: 'dealer', dealerId: dealers[1].id, name: '上海经销商' },
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, username, password_hash, role, dealer_id, name)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const user of users) {
    insertUser.run(user.id, user.username, user.password, user.role, user.dealerId, user.name);
  }

  const serviceCenters = [
    { id: generateId(), name: '北京家电维修中心（朝阳店）', address: '北京市朝阳区建国路88号', phone: '400-800-1234', serviceHours: '周一至周日 9:00-18:00', province: '北京', city: '北京', latitude: 39.9042, longitude: 116.4074 },
    { id: generateId(), name: '北京家电维修中心（海淀店）', address: '北京市海淀区中关村大街1号', phone: '400-800-1235', serviceHours: '周一至周日 9:00-18:00', province: '北京', city: '北京', latitude: 39.9842, longitude: 116.3074 },
    { id: generateId(), name: '上海家电维修中心（浦东店）', address: '上海市浦东新区陆家嘴环路1000号', phone: '400-800-2234', serviceHours: '周一至周日 9:00-18:00', province: '上海', city: '上海', latitude: 31.2304, longitude: 121.4737 },
    { id: generateId(), name: '上海家电维修中心（徐汇店）', address: '上海市徐汇区淮海中路1000号', phone: '400-800-2235', serviceHours: '周一至周日 9:00-18:00', province: '上海', city: '上海', latitude: 31.2004, longitude: 121.4337 },
    { id: generateId(), name: '广州家电维修中心', address: '广州市天河区天河路385号', phone: '400-800-3234', serviceHours: '周一至周日 9:00-18:00', province: '广东', city: '广州', latitude: 23.1291, longitude: 113.2644 },
    { id: generateId(), name: '深圳家电维修中心', address: '深圳市南山区科技园路1号', phone: '400-800-3235', serviceHours: '周一至周日 9:00-18:00', province: '广东', city: '深圳', latitude: 22.5431, longitude: 114.0579 },
  ];

  const insertServiceCenter = db.prepare(`
    INSERT INTO service_centers (id, name, address, phone, service_hours, province, city, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const center of serviceCenters) {
    insertServiceCenter.run(center.id, center.name, center.address, center.phone, center.serviceHours, center.province, center.city, center.latitude, center.longitude);
  }

  const fridgeModels = [
    { model: 'BCD-500WGHTD49S8U1', brand: '海尔' },
    { model: 'BCD-501WGHFD14S8U1', brand: '海尔' },
    { model: 'BCD-460WGHTD14S8U1', brand: '海尔' },
    { model: 'BCD-550WKGPU1S8U1', brand: '卡萨帝' },
    { model: 'BCD-505WGCTDMFGYU1', brand: '容声' },
  ];

  const washerModels = [
    { model: 'EG100HPLUS7SU1', brand: '海尔' },
    { model: 'EG100HBDC8SU1', brand: '海尔' },
    { model: 'TG100V868WMADY', brand: '小天鹅' },
    { model: 'TD100VJ87MIT', brand: '小天鹅' },
    { model: 'C1 HD10P3LU1', brand: '卡萨帝' },
  ];

  const acModels = [
    { model: 'KFR-35GW/03JDM81A', brand: '海尔' },
    { model: 'KFR-35GW/B1KKC81U1', brand: '海尔' },
    { model: 'KFR-35GW/N8MHA1', brand: '美的' },
    { model: 'KFR-35GW/N8HS1A', brand: '美的' },
    { model: 'KFR-35GW/BpR3FZJ1(B1)', brand: '奥克斯' },
  ];

  const insertDevice = db.prepare(`
    INSERT INTO devices (id, serial_number, device_type, model, brand, purchase_date, invoice_exists, dealer_id, service_center_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertWarranty = db.prepare(`
    INSERT INTO warranties (id, device_id,整机保修期_months, 主要部件保修期_months, warranty_start_date, warranty_end_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertExtendedWarranty = db.prepare(`
    INSERT INTO extended_warranties (id, device_id, plan_name, extended_months, extended_end_date, price, purchased_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

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

  const deviceTypes: { type: DeviceType; prefix: string; models: { model: string; brand: string }[] }[] = [
    { type: 'fridge', prefix: 'FR', models: fridgeModels },
    { type: 'washer', prefix: 'WS', models: washerModels },
    { type: 'ac', prefix: 'AC', models: acModels },
  ];

  const deviceIds: string[] = [];

  for (const deviceType of deviceTypes) {
    for (let i = 1; i <= 20; i++) {
      const deviceId = generateId();
      deviceIds.push(deviceId);
      const serialNumber = `${deviceType.prefix}-${String(i).padStart(6, '0')}`;
      const modelInfo = deviceType.models[i % deviceType.models.length];
      const dealerIndex = i <= 10 ? 0 : 1;
      const dealerId = dealers[dealerIndex].id;
      const serviceCenterIndex = i <= 10 ? 0 : 2;
      const serviceCenterId = serviceCenters[serviceCenterIndex].id;
      const monthsAgo = Math.floor(Math.random() * 36);
      const purchaseDate = new Date();
      purchaseDate.setMonth(purchaseDate.getMonth() - monthsAgo);
      const purchaseDateStr = purchaseDate.toISOString().split('T')[0];
      const invoiceExists = i % 7 !== 0;

      insertDevice.run(
        deviceId,
        serialNumber,
        deviceType.type,
        modelInfo.model,
        modelInfo.brand,
        purchaseDateStr,
        invoiceExists ? 1 : 0,
        dealerId,
        serviceCenterId
      );

      const整机保修期 = 12;
      const主要部件保修期 = 36;
      const warrantyStartDate = purchaseDateStr;
      const warrantyEndDate = addMonths(warrantyStartDate, 整机保修期);
      const warrantyStatus = invoiceExists ? calculateStatus(warrantyEndDate) : 'pending';

      const warrantyId = generateId();
      insertWarranty.run(
        warrantyId,
        deviceId,整机保修期,
        主要部件保修期,
        warrantyStartDate,
        warrantyEndDate,
        warrantyStatus
      );

      if (i % 4 === 0 && invoiceExists) {
        const extMonths = [12, 24, 36][i % 3];
        const extEndDate = addMonths(warrantyEndDate, extMonths);
        const extId = generateId();
        insertExtendedWarranty.run(
          extId,
          deviceId,
          `延保${extMonths}个月`,
          extMonths,
          extEndDate,
          extMonths * 30,
          purchaseDateStr
        );
      }
    }
  }

  const insertReview = db.prepare(`
    INSERT INTO review_applications (id, device_type, serial_number, contact_name, contact_phone, purchase_date, purchase_channel, description, proof_files, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const reviewApplications = [
    { deviceType: 'fridge' as DeviceType, serialNumber: 'FR-000007', contactName: '王先生', contactPhone: '13800138001', purchaseDate: '2024-01-15', purchaseChannel: '线下门店', description: '发票不慎丢失，希望能人工审核确认保修资格。', proofFiles: JSON.stringify(['https://example.com/proof1.jpg', 'https://example.com/proof2.jpg']), status: 'pending' },
    { deviceType: 'washer' as DeviceType, serialNumber: 'WS-000014', contactName: '李女士', contactPhone: '13800138002', purchaseDate: '2023-06-20', purchaseChannel: '京东商城', description: '搬家时发票丢失，有订单截图可以证明购买日期。', proofFiles: JSON.stringify(['https://example.com/order1.png']), status: 'pending' },
    { deviceType: 'ac' as DeviceType, serialNumber: 'AC-000021', contactName: '张女士', contactPhone: '13800138003', purchaseDate: '2024-05-10', purchaseChannel: '天猫旗舰店', description: '装修时发票遗失，有支付宝付款记录。', proofFiles: JSON.stringify(['https://example.com/payment1.jpg']), status: 'pending' },
    { deviceType: 'fridge' as DeviceType, serialNumber: 'FR-000014', contactName: '赵先生', contactPhone: '13800138004', purchaseDate: '2023-03-08', purchaseChannel: '线下门店', description: '经审核，提供的购买凭证有效。', proofFiles: JSON.stringify(['https://example.com/proof3.jpg']), status: 'approved' },
    { deviceType: 'ac' as DeviceType, serialNumber: 'AC-000007', contactName: '钱女士', contactPhone: '13800138005', purchaseDate: '2024-08-15', purchaseChannel: '苏宁易购', description: '提供的凭证无法确认购买渠道，驳回申请。', proofFiles: JSON.stringify(['https://example.com/proof4.jpg']), status: 'rejected' },
  ];

  for (const app of reviewApplications) {
    insertReview.run(
      generateId(),
      app.deviceType,
      app.serialNumber,
      app.contactName,
      app.contactPhone,
      app.purchaseDate,
      app.purchaseChannel,
      app.description,
      app.proofFiles,
      app.status
    );
  }
}

export default seedDatabase;
