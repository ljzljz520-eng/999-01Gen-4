import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Phone,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Navigation,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAppStore } from '@/store';
import { DeviceTypeLabels, WarrantyStatusLabels } from '../../shared/types.js';
import type { DeviceInfoResponse } from '../../shared/types.js';

export default function Result() {
  const { currentDevice } = useAppStore();
  const navigate = useNavigate();

  if (!currentDevice) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="container py-16 text-center">
          <div className="card p-8 max-w-md mx-auto">
            <AlertTriangle className="w-16 h-16 text-warning-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-neutral-700 mb-2">暂无查询结果</h2>
            <p className="text-neutral-500 mb-6">请先返回首页进行序列号查询</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              <ArrowLeft className="w-4 h-4" />
              返回查询
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { device, warranty, extendedWarranty, serviceCenter } = currentDevice as DeviceInfoResponse;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success"><CheckCircle className="w-3 h-3 mr-1" />{WarrantyStatusLabels[status as keyof typeof WarrantyStatusLabels]}</span>;
      case 'expired':
        return <span className="badge badge-danger"><XCircle className="w-3 h-3 mr-1" />{WarrantyStatusLabels[status as keyof typeof WarrantyStatusLabels]}</span>;
      case 'pending':
        return <span className="badge badge-warning"><Clock className="w-3 h-3 mr-1" />{WarrantyStatusLabels[status as keyof typeof WarrantyStatusLabels]}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="container py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-neutral-600 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回查询
        </button>

        <div className="animate-fade-in">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-neutral-700">
              {device.brand} {device.model}
            </h1>
            {getStatusBadge(warranty.保修状态)}
          </div>

          {!device.invoiceExists && (
            <div className="card p-4 mb-6 bg-warning-50 border border-warning-200 animate-pulse-slow">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-neutral-700 mb-1">发票信息缺失</h3>
                  <p className="text-sm text-neutral-600 mb-3">
                    系统未找到该设备的发票记录，保修期限可能不准确。您可以提交人工审核来确认保修资格。
                  </p>
                  <button
                    onClick={() => navigate('/review/apply', { state: { deviceType: device.deviceType, serialNumber: device.serialNumber } })}
                    className="btn-warning text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    申请人工审核
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-lg font-semibold text-neutral-700">基本信息</h2>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-neutral-500 text-sm">设备类型</span>
                  <span className="text-neutral-700 font-medium">{DeviceTypeLabels[device.deviceType]}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-neutral-500 text-sm">序列号</span>
                  <span className="text-neutral-700 font-mono text-sm">{device.serialNumber}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-neutral-500 text-sm">品牌型号</span>
                  <span className="text-neutral-700">{device.brand} {device.model}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-neutral-500 text-sm">购买日期</span>
                  <span className="text-neutral-700 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {device.purchaseDate || '待确认'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-neutral-500 text-sm">销售经销商</span>
                  <span className="text-neutral-700">{device.dealerName}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-neutral-500 text-sm">发票状态</span>
                  <span className={device.invoiceExists ? 'text-success-600' : 'text-warning-600'}>
                    {device.invoiceExists ? '已上传' : '缺失'}
                  </span>
                </div>
              </div>
            </div>

            <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-success-600" />
                </div>
                <h2 className="text-lg font-semibold text-neutral-700">保修信息</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-neutral-50">
                  <div className="text-sm text-neutral-500 mb-1">保修状态</div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(warranty.保修状态)}
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-neutral-500 text-sm">整机保修期</span>
                  <span className="text-neutral-700 font-medium">{warranty.整机保修期}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-neutral-500 text-sm">主要部件保修期</span>
                  <span className="text-neutral-700 font-medium">{warranty.主要部件保修期}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-neutral-500 text-sm">保修开始日期</span>
                  <span className="text-neutral-700">{warranty.保修开始日期}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-neutral-500 text-sm">保修到期日期</span>
                  <span className="text-neutral-700 font-medium">{warranty.保修结束日期}</span>
                </div>
              </div>

              {extendedWarranty && extendedWarranty.hasExtendedWarranty && (
                <div className="mt-6 p-4 rounded-xl bg-primary-50 border border-primary-200">
                  <div className="flex items-center gap-2 text-primary-600 font-medium mb-2">
                    <ShieldAlert className="w-5 h-5" />
                    延保服务
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-primary-600">{extendedWarranty.planName}</span>
                      <span className="text-primary-600 font-medium">{extendedWarranty.extendedPeriod}</span>
                    </div>
                    <div className="text-primary-700">
                      延保至：{extendedWarranty.extendedEndDate}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-warning-600" />
                </div>
                <h2 className="text-lg font-semibold text-neutral-700">维修网点</h2>
              </div>

              <div className="space-y-4">
                <div className="font-medium text-neutral-700">{serviceCenter.name}</div>
                <div className="flex items-start gap-2 text-sm text-neutral-600">
                  <MapPin className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <span>{serviceCenter.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Phone className="w-4 h-4 text-neutral-400" />
                  <a href={`tel:${serviceCenter.phone}`} className="text-primary-600 hover:underline">
                    {serviceCenter.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Clock className="w-4 h-4 text-neutral-400" />
                  <span>{serviceCenter.serviceHours}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(serviceCenter.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary w-full"
                >
                  <Navigation className="w-4 h-4" />
                  导航前往
                </a>
                <a
                  href={`tel:${serviceCenter.phone}`}
                  className="btn-primary w-full"
                >
                  <Phone className="w-4 h-4" />
                  立即致电
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
