import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FileCheck,
  Users,
  Settings,
  Search,
} from 'lucide-react';
import { useAppStore } from '@/store';

interface SidebarProps {
  role: 'admin' | 'dealer';
}

export default function Sidebar({ role }: SidebarProps) {
  const location = useLocation();
  const { user } = useAppStore();

  const isActive = (path: string) => location.pathname === path;

  const dealerItems = [
    { path: '/dealer', label: '仪表盘', icon: LayoutDashboard },
    { path: '/dealer/devices', label: '设备列表', icon: Package },
  ];

  const adminItems = [
    { path: '/admin', label: '仪表盘', icon: LayoutDashboard },
    { path: '/admin/reviews', label: '审核管理', icon: FileCheck },
    { path: '/admin/devices', label: '设备管理', icon: Search },
    { path: '/admin/dealers', label: '经销商管理', icon: Users },
  ];

  const items = role === 'admin' ? adminItems : dealerItems;
  const basePath = role === 'admin' ? '/admin' : '/dealer';

  return (
    <div className="w-64 bg-white border-r border-neutral-200 min-h-screen">
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <div className="font-semibold text-neutral-700">{user?.name}</div>
            <div className="text-sm text-neutral-500">
              {role === 'admin' ? '系统管理员' : '授权经销商'}
            </div>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-1">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              isActive(item.path)
                ? 'bg-primary-50 text-primary-600'
                : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-200">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-neutral-500 hover:bg-neutral-50 transition-all"
        >
          <Settings className="w-5 h-5" />
          返回首页
        </Link>
      </div>
    </div>
  );
}
