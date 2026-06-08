import { useState, useEffect } from 'react';
import { Package, Users, FileCheck, Clock, ShieldCheck, TrendingUp } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { reviewApi, deviceApi } from '@/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    pendingReviews: number;
    totalDevices: number;
    totalDealers: number;
    approvedReviews: number;
    rejectedReviews: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [reviewsResult] = await Promise.all([
        reviewApi.list({ page: 1, pageSize: 100 }),
      ]);

      const pendingReviews = reviewsResult.list.filter((r) => r.status === 'pending').length;
      const approvedReviews = reviewsResult.list.filter((r) => r.status === 'approved').length;
      const rejectedReviews = reviewsResult.list.filter((r) => r.status === 'rejected').length;

      setStats({
        pendingReviews,
        totalDevices: 60,
        totalDealers: 2,
        approvedReviews,
        rejectedReviews,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = stats ? [
    { label: '待审核申请', value: stats.pendingReviews, icon: Clock, color: 'warning' },
    { label: '设备总数', value: stats.totalDevices, icon: Package, color: 'primary' },
    { label: '经销商数量', value: stats.totalDealers, icon: Users, color: 'success' },
    { label: '已通过审核', value: stats.approvedReviews, icon: ShieldCheck, color: 'success' },
    { label: '已驳回申请', value: stats.rejectedReviews, icon: FileCheck, color: 'danger' },
  ] : [];

  const colorClasses: Record<string, string> = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-success-100 text-success-600',
    danger: 'bg-danger-100 text-danger-600',
    warning: 'bg-warning-100 text-warning-600',
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar role="admin" />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-700 mb-2">管理员仪表盘</h1>
          <p className="text-neutral-500">查看平台整体数据和审核状态</p>
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
              <button
                onClick={() => window.location.href = '/admin/reviews'}
                className="p-4 rounded-xl bg-warning-50 text-warning-600 hover:bg-warning-100 transition-colors text-left"
              >
                <FileCheck className="w-6 h-6 mb-2" />
                <div className="font-medium">审核管理</div>
                <div className="text-xs text-warning-500 mt-1">处理人工审核申请</div>
              </button>
              <button
                onClick={() => window.location.href = '/admin/dealers'}
                className="p-4 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors text-left"
              >
                <Users className="w-6 h-6 mb-2" />
                <div className="font-medium">经销商管理</div>
                <div className="text-xs text-primary-500 mt-1">管理经销商账号</div>
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-neutral-700 mb-4">平台说明</h3>
            <ul className="space-y-3 text-sm text-neutral-600">
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
                <span>管理员可以查看全品牌所有设备的保修信息</span>
              </li>
              <li className="flex items-start gap-2">
                <FileCheck className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
                <span>负责审核用户提交的人工保修资格申请</span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
                <span>管理经销商账号，经销商只能查看自有销售数据</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
                <span>审核通过后自动更新设备的保修状态</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
