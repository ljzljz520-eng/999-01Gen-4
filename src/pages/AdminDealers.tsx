import { useState, useEffect } from 'react';
import { Users, Search, Package, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { deviceApi } from '@/api';
import type { Dealer } from '../../shared/types.js';

export default function AdminDealers() {
  const [dealers, setDealers] = useState<Array<Dealer & { deviceCount: number; activeCount: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    loadDealers();
  }, []);

  const loadDealers = async () => {
    setIsLoading(true);
    try {
      const data = await deviceApi.getAllDealers();
      const dealersWithStats = data.map((d) => ({
        ...d,
        deviceCount: Math.floor(Math.random() * 20) + 20,
        activeCount: Math.floor(Math.random() * 15) + 10,
      }));
      setDealers(dealersWithStats);
    } catch (error) {
      console.error('Failed to load dealers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDealers = dealers.filter((d) =>
    d.name.includes(keyword) || d.code.includes(keyword) || d.contactPerson.includes(keyword)
  );

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar role="admin" />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-700 mb-2">经销商管理</h1>
          <p className="text-neutral-500">管理所有经销商账号和销售数据</p>
        </div>

        <div className="card p-6 mb-6">
          <div className="flex items-center gap-4 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索经销商名称/编码/联系人"
                className="input pl-9"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDealers.map((dealer, index) => (
              <div
                key={dealer.id}
                className="card p-6 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <span className="badge badge-primary">{dealer.code}</span>
                </div>

                <h3 className="text-lg font-bold text-neutral-700 mb-1">{dealer.name}</h3>
                <p className="text-sm text-neutral-500 mb-4">{dealer.contactPerson}</p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Phone className="w-4 h-4 text-neutral-400" />
                    {dealer.contactPhone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Mail className="w-4 h-4 text-neutral-400" />
                    {dealer.email}
                  </div>
                  <div className="flex items-start gap-2 text-sm text-neutral-600">
                    <MapPin className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
                    {dealer.address}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-neutral-100">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary-500" />
                    <span className="text-sm font-medium text-neutral-700">{dealer.deviceCount}</span>
                    <span className="text-xs text-neutral-500">设备</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-success-500" />
                    <span className="text-sm font-medium text-neutral-700">{dealer.activeCount}</span>
                    <span className="text-xs text-neutral-500">在保</span>
                  </div>
                </div>

                <button className="w-full mt-4 btn-secondary text-sm">
                  查看详情
                </button>
              </div>
            ))}
          </div>
        )}

        {filteredDealers.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500">未找到匹配的经销商</p>
          </div>
        )}
      </div>
    </div>
  );
}
