export type DeviceType = 'fridge' | 'washer' | 'ac';
export type UserRole = 'dealer' | 'admin';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type WarrantyStatus = 'active' | 'expired' | 'pending';

export interface LoginRequest {
  username: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  dealerId?: string;
  name: string;
}

export interface DeviceQueryRequest {
  deviceType: DeviceType;
  serialNumber: string;
}

export interface Device {
  id: string;
  serialNumber: string;
  deviceType: DeviceType;
  model: string;
  brand: string;
  purchaseDate: string | null;
  invoiceExists: boolean;
  dealerId: string;
  dealerName: string;
  serviceCenterId: string;
}

export interface Warranty {
 整机保修期: string;
  主要部件保修期: string;
  保修开始日期: string;
  保修结束日期: string;
  保修状态: WarrantyStatus;
}

export interface ExtendedWarranty {
  hasExtendedWarranty: boolean;
  extendedPeriod?: string;
  extendedEndDate?: string;
  planName?: string;
  price?: number;
}

export interface ServiceCenter {
  id: string;
  name: string;
  address: string;
  phone: string;
  serviceHours: string;
  distance?: string;
  province: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface DeviceInfoResponse {
  device: Device;
  warranty: Warranty;
  extendedWarranty: ExtendedWarranty | null;
  serviceCenter: ServiceCenter;
}

export interface ReviewApplicationRequest {
  deviceType: DeviceType;
  serialNumber: string;
  contactName: string;
  contactPhone: string;
  purchaseDate?: string;
  purchaseChannel: string;
  description: string;
  proofFiles: string[];
}

export interface ReviewApplication {
  id: string;
  deviceType: DeviceType;
  serialNumber: string;
  contactName: string;
  contactPhone: string;
  purchaseDate?: string;
  purchaseChannel: string;
  description: string;
  proofFiles: string[];
  status: ReviewStatus;
  adminId?: string;
  reviewRemark?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface ReviewApplicationResponse {
  applicationId: string;
  status: ReviewStatus;
  message: string;
}

export interface DealerDevicesRequest {
  page: number;
  pageSize: number;
  deviceType?: DeviceType;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface DealerDevicesResponse {
  total: number;
  list: DeviceInfoResponse[];
  page: number;
  pageSize: number;
}

export interface DealerStats {
  totalDevices: number;
  activeWarranties: number;
  expiredWarranties: number;
  extendedWarranties: number;
  pendingReviews: number;
}

export interface Dealer {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  contactPhone: string;
  email: string;
  address: string;
  createdAt?: string;
}

export const DeviceTypeLabels: Record<DeviceType, string> = {
  fridge: '冰箱',
  washer: '洗衣机',
  ac: '空调',
};

export const ReviewStatusLabels: Record<ReviewStatus, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已驳回',
};

export const WarrantyStatusLabels: Record<WarrantyStatus, string> = {
  active: '在保',
  expired: '已过保',
  pending: '待确认',
};
