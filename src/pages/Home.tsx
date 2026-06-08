import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Refrigerator, WashingMachine, AirVent, ShieldCheck, Clock, MapPin, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { deviceApi } from '@/api';
import { useAppStore } from '@/store';
import type { DeviceType } from '../../shared/types.js';
import { DeviceTypeLabels } from '../../shared/types.js';

const deviceTypes: { type: DeviceType; label: string; icon: React.ElementType; description: string }[] = [
  { type: 'fridge', label: '冰箱', icon: Refrigerator, description: '查询冰箱保修信息' },
  { type: 'washer', label: '洗衣机', icon: WashingMachine, description: '查询洗衣机保修信息' },
  { type: 'ac', label: '空调', icon: AirVent, description: '查询空调保修信息' },
];

export default function Home() {
  const [deviceType, setDeviceType] = useState<DeviceType>('fridge');
  const [serialNumber, setSerialNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { setCurrentDevice } = useAppStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!serialNumber.trim()) {
      setError('请输入序列号');
      return;
    }

    setIsLoading(true);
    try {
      const result = await deviceApi.query({ deviceType, serialNumber: serialNumber.trim() });
      setCurrentDevice(result);
      navigate('/result');
    } catch (err) {
      setError(err instanceof Error ? err.message : '查询失败，请检查序列号是否正确');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white">
        <div className="container py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm mb-6">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              家电延保服务
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              输入设备序列号，快速查询保修信息、延保服务和维修网点
            </p>

            <div className="card p-6 md:p-8 bg-white text-neutral-700 animate-slide-up">
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-3 text-left">
                  选择设备类型
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {deviceTypes.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setDeviceType(item.type)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          deviceType === item.type
                            ? 'border-primary-500 bg-primary-50 text-primary-600'
                            : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        <Icon className="w-8 h-8 mx-auto mb-2" />
                        <div className="font-medium">{item.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-2 text-left">
                    设备序列号
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      placeholder={`请输入${DeviceTypeLabels[deviceType]}序列号，如：${
                        deviceType === 'fridge' ? 'FR-000001' :
                        deviceType === 'washer' ? 'WS-000001' : 'AC-000001'
                      }`}
                      className="input pl-12 py-3 text-base"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-danger-50 text-danger-600 text-sm mb-4 text-left">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-3.5 text-base"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      查询中...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      查询保修信息
                    </>
                  )}
                </button>
              </form>

              <p className="text-xs text-neutral-500 mt-4 text-left">
                提示：序列号通常位于设备背面或保修卡上
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">快速查询</h3>
            <p className="text-neutral-500 text-sm">
              输入序列号即可查询设备的购买日期、保修期限和延保服务状态
            </p>
          </div>

          <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-success-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">保修提醒</h3>
            <p className="text-neutral-500 text-sm">
              实时显示保修状态，提前提醒保修到期时间，避免错过延保机会
            </p>
          </div>

          <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="w-12 h-12 rounded-xl bg-warning-100 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-warning-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">就近维修</h3>
            <p className="text-neutral-500 text-sm">
              智能推荐附近的授权维修网点，提供联系方式和导航服务
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-primary-600 font-medium mb-4">
            <FileText className="w-5 h-5" />
            发票遗失？
          </div>
          <p className="text-neutral-600 mb-6">
            如遇发票缺失，可申请人工审核，我们将在1-3个工作日内处理您的申请
          </p>
          <button
            onClick={() => navigate('/review/apply')}
            className="btn-secondary"
          >
            申请人工审核
          </button>
        </div>
      </div>
    </div>
  );
}
