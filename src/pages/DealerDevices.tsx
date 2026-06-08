import { useState, useEffect } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight, Package, Calendar, MapPin } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { deviceApi } from '@/api';
import type { DeviceInfoResponse, DeviceType, DealerDevicesResponse } from '../../shared/types.js';
import { DeviceTypeLabels, WarrantyStatusLabels } from '../../shared/types.js';

export default function DealerDevices() {
  const [devices, setDevices] = useState<DealerDevicesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [deviceType, setDeviceType] = useState<DeviceType | ''>('');
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadDevices();
  }, [page, deviceType, keyword, startDate, endDate]);

  const loadDevices = async () => {
    setIsLoading(true);
    try {
      const params: any = { page, pageSize };
      if (deviceType) params.deviceType = deviceType;
      if (keyword) params.keyword = keyword;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await deviceApi.getDealerDevices(params);
      setDevices(data);
    } catch (error) {
      console.error('Failed to load devices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
  };

  const handleReset = () => {
    setDeviceType('');
    setKeyword('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const totalPages = devices ? Math.ceil(devices.total / pageSize) : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success">在保</span>;
      case 'expired':
        return <span className="badge badge-danger">已过保</span>;
      case 'pending':
        return <span className="badge badge-warning">待确认</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar role="dealer" />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-700 mb-2">设备列表</h1>
          <p className="text-neutral-500">查看和管理您销售的所有设备</p>
        </div>

        <div className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-neutral-500" />
            <h3 className="font-medium text-neutral-700">筛选条件</h3>
          </div>
          <div className="grid md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm text-neutral-500 mb-1">设备类型</label>
              <select
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value as DeviceType | '')}
                className="input"
              >
                <option value="">全部</option>
                <option value="fridge">冰箱</option>
                <option value="washer">洗衣机</option>
                <option value="ac">空调</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-neutral-500 mb-1">搜索关键词</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="序列号/型号/品牌"
                  className="input pl-9"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-neutral-500 mb-1">开始日期</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-500 mb-1">结束日期</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
              />
            </div>
            <div className="flex items-end gap-2">
              <button onClick={handleSearch} className="btn-primary flex-1">
                <Search className="w-4 h-4" />
                查询
              </button>
              <button onClick={handleReset} className="btn-secondary">
                重置
              </button>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
            <div className="text-sm text-neutral-500">
              共 <span className="font-medium text-neutral-700">{devices?.total || 0}</span> 条记录
            </div>
            <button className="btn-secondary text-sm">
              <Download className="w-4 h-4" />
              导出
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">设备信息</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">序列号</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">购买日期</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">保修状态</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">保修到期</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">维修网点</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {devices?.list.map((item: DeviceInfoResponse, index: number) => (
                      <tr
                        key={item.device.id}
                        className="hover:bg-neutral-50 transition-colors animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                              <Package className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                              <div className="font-medium text-neutral-700">
                                {item.device.brand} {item.device.model}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {DeviceTypeLabels[item.device.deviceType]}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-neutral-600">{item.device.serialNumber}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-neutral-600">
                            <Calendar className="w-4 h-4 text-neutral-400" />
                            {item.device.purchaseDate || '待确认'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(item.warranty.保修状态)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-neutral-600">{item.warranty.保修结束日期}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-1 text-neutral-600">
                            <MapPin className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <div>{item.serviceCenter.name}</div>
                              <div className="text-xs text-neutral-500">{item.serviceCenter.phone}</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {devices && devices.list.length > 0 && (
                <div className="p-6 border-t border-neutral-100 flex items-center justify-between">
                  <div className="text-sm text-neutral-500">
                    第 {page} / {totalPages} 页
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="btn-secondary text-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      上一页
                    </button>
                    <span className="px-4 py-2 text-sm font-medium text-neutral-700">{page}</span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="btn-secondary text-sm"
                    >
                      下一页
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {devices && devices.list.length === 0 && (
                <div className="text-center py-16">
                  <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500">暂无设备数据</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
