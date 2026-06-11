import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAppStore } from '@/store';

export default function Navbar() {
  const { user, logout } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-primary-600 font-bold text-xl">
              <Shield className="w-7 h-7" />
              <span>家电延保服务</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/') ? 'bg-primary-50 text-primary-600' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                序列号查询
              </Link>
              <Link
                to="/review/apply"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/review') ? 'bg-primary-50 text-primary-600' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                人工审核
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dealer'}
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  管理后台
                </Link>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <span className="hidden sm:inline text-neutral-700 font-medium">{user.name}</span>
                  <span className="hidden sm:inline badge badge-primary">
                    {user.role === 'admin' ? '管理员' : '经销商'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">退出</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm">
                <User className="w-4 h-4" />
                登录
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
