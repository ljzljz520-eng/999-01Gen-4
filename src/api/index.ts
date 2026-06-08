import type {
  LoginRequest,
  LoginResponse,
  User,
  DeviceQueryRequest,
  DeviceInfoResponse,
  ReviewApplicationRequest,
  ReviewApplicationResponse,
  ReviewApplication,
  DealerDevicesRequest,
  DealerDevicesResponse,
  DealerStats,
  Dealer,
} from '../../shared/types.js';

const API_BASE = '/api';

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const authApi = {
  login: (data: LoginRequest) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    request<{ message: string }>('/auth/logout', {
      method: 'POST',
    }),

  getCurrentUser: () => request<User>('/auth/me'),
};

export const deviceApi = {
  query: (params: DeviceQueryRequest) => {
    const query = new URLSearchParams(params as any).toString();
    return request<DeviceInfoResponse>(`/devices/query?${query}`);
  },

  getDealerDevices: (params: DealerDevicesRequest) => {
    const query = new URLSearchParams(params as any).toString();
    return request<DealerDevicesResponse>(`/devices/dealer?${query}`);
  },

  getDealerStats: () => request<DealerStats>('/devices/dealer/stats'),

  getAllDevices: (params: {
    page: number;
    pageSize: number;
    deviceType?: string;
    dealerId?: string;
    keyword?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<{ total: number; list: DeviceInfoResponse[] }>(`/devices/all?${query}`);
  },

  getAllDealers: () => request<Dealer[]>('/devices/dealers'),
};

export const reviewApi = {
  create: (data: ReviewApplicationRequest) =>
    request<ReviewApplicationResponse>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  get: (id: string) => request<ReviewApplication>(`/reviews/${id}`),

  list: (params: {
    page: number;
    pageSize: number;
    status?: string;
    keyword?: string;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<{ total: number; list: ReviewApplication[] }>(`/reviews?${query}`);
  },

  approve: (id: string, remark?: string) =>
    request<{ message: string }>(`/reviews/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ remark }),
    }),

  reject: (id: string, remark: string) =>
    request<{ message: string }>(`/reviews/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ remark }),
    }),
};

export default {
  auth: authApi,
  device: deviceApi,
  review: reviewApi,
};
