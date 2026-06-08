import { useState, useEffect } from 'react';
import { Package, ShieldCheck, ShieldAlert, Clock, FileCheck, TrendingUp } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { deviceApi } from '@/api';
import type { DealerStats } from '../../shared/types.js';

export default function DealerDashboard() {
  const [stats, setStats] = useState<DealerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await deviceApi.getDealerStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = stats ? [
    { label: '设备总数', value: stats.totalDevices, icon: Package, color: 'primary' },
    { label: '在保设备', value: stats.activeWarranties, icon: ShieldCheck, color: 'success' },
    { label: '已过保', value: stats.expiredWarranties, icon: ShieldAlert, color: 'danger' },
    { label: '延保服务', value: stats.extendedWarranties, icon: TrendingUp, color: 'warning' },
    { label: '待审核', value: stats.pendingReviews, icon: FileCheck, color: 'warning' },
  ] : [];

  const colorClasses: Record<string, string> = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-success-100 text-success-600',
    danger: 'bg-danger-100 text-danger-600',
    warning: 'bg-warning-100 text-warning-600',
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar role="dealer" />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-700 mb-2">经销商仪表盘</h1>
          <p className="text-neutral-500">查看您的销售设备统计和保修状态</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <div
                key={stat.label}
                className="card p-6 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[stat.color]}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-neutral-700 mb-1">{stat.value}</div>
                <div className="text-sm text-neutral-500">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-neutral-700 mb-4">快速操作</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors text-left">
                <Package className="w-6 h-6 mb-2" />
                <div className="font-medium">查看设备列表</div>
                <div className="text-xs text-primary-500 mt-1">管理所有销售设备</div>
              </button>
              <button className="p-4 rounded-xl bg-success-50 text-success-600 hover:bg-success-100 transition-colors text-left">
                <ShieldCheck className="w-6 h-6 mb-2" />
                <div className="font-medium">保修查询</div>
                <div className="text-xs text-success-500 mt-1">查询设备保修信息</div>
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-neutral-700 mb-4">使用说明</h3>
            <ul className="space-y-3 text-sm text-neutral-600">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
                <span>您只能查看和查询自有销售渠道的设备信息</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
                <span>设备保修信息由系统自动计算，以购买日期为基准</span>
              </li>
              <li className="flex items-start gap-2">
                <FileCheck className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
                <span>发票缺失的设备需要用户提交人工审核才能确认保修</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
