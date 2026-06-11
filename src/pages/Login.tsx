import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '@/store';
import { authApi } from '@/api';
import type { UserRole } from '../../shared/types.js';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('dealer');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { setToken, setUser, token } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    if (token) {
      navigate(from, { replace: true });
    }
  }, [token, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await authApi.login({ username, password, role });
      setToken(result.token);
      setUser(result.user);
      navigate(result.user.role === 'admin' ? '/admin' : '/dealer', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 p-4">
      <div className="card p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-700">家电延保服务平台</h1>
          <p className="text-neutral-500 mt-2">请登录您的账号</p>
        </div>

        <div className="flex bg-neutral-100 rounded-lg p-1 mb-6">
          {(['dealer', 'admin'] as UserRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                role === r
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {r === 'dealer' ? '经销商' : '管理员'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              用户名
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                className="input pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              密码
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="input pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-danger-50 text-danger-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                登录中...
              </>
            ) : (
              '登录'
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
          <p className="text-sm text-neutral-500 mb-2">测试账号：</p>
          <div className="text-xs text-neutral-600 space-y-1">
            <p>管理员：admin / admin123456</p>
            <p>经销商：dealer001 / dealer123456</p>
            <p>经销商：dealer002 / dealer123456</p>
          </div>
        </div>
      </div>
    </div>
  );
}
