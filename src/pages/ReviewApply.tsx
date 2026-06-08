import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText, User, Phone, Calendar, Store, MessageSquare, Upload, CheckCircle, Refrigerator, WashingMachine, AirVent } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { reviewApi } from '@/api';
import type { DeviceType } from '../../shared/types.js';
import { DeviceTypeLabels } from '../../shared/types.js';

const deviceTypes: { type: DeviceType; label: string; icon: React.ElementType }[] = [
  { type: 'fridge', label: '冰箱', icon: Refrigerator },
  { type: 'washer', label: '洗衣机', icon: WashingMachine },
  { type: 'ac', label: '空调', icon: AirVent },
];

const purchaseChannels = ['线下门店', '京东商城', '天猫旗舰店', '苏宁易购', '国美电器', '其他'];

export default function ReviewApply() {
  const location = useLocation();
  const navigate = useNavigate();

  const [deviceType, setDeviceType] = useState<DeviceType>('fridge');
  const [serialNumber, setSerialNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchaseChannel, setPurchaseChannel] = useState('');
  const [description, setDescription] = useState('');
  const [proofFiles, setProofFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ applicationId: string; message: string } | null>(null);

  useEffect(() => {
    if (location.state) {
      const state = location.state as any;
      if (state.deviceType) setDeviceType(state.deviceType);
      if (state.serialNumber) setSerialNumber(state.serialNumber);
    }
  }, [location.state]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).map((f) => URL.createObjectURL(f));
      setProofFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setProofFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!serialNumber.trim() || !contactName.trim() || !contactPhone.trim() || !purchaseChannel || !description.trim()) {
      setError('请填写完整的申请信息');
      return;
    }

    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(contactPhone)) {
      setError('请输入正确的手机号码');
      return;
    }

    setIsLoading(true);
    try {
      const result = await reviewApi.create({
        deviceType,
        serialNumber: serialNumber.trim(),
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        purchaseDate: purchaseDate || undefined,
        purchaseChannel,
        description: description.trim(),
        proofFiles,
      });
      setSuccess({ applicationId: result.applicationId, message: result.message });
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="container py-16">
          <div className="card p-8 max-w-md mx-auto text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-success-500" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-700 mb-2">申请提交成功</h1>
            <p className="text-neutral-500 mb-6">{success.message}</p>
            <div className="bg-neutral-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-neutral-500">申请编号</p>
              <p className="font-mono text-primary-600 font-medium">{success.applicationId}</p>
            </div>
            <div className="space-y-3">
              <button onClick={() => navigate('/')} className="btn-primary w-full">
                返回首页
              </button>
              <button
                onClick={() => navigate(`/review/status?id=${success.applicationId}`)}
                className="btn-secondary w-full"
              >
                查看审核进度
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="container py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-neutral-600 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回首页
        </button>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-warning-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-warning-600" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-700 mb-2">人工审核申请</h1>
            <p className="text-neutral-500">
              发票缺失时，请填写以下信息并提交相关证明材料，我们将在1-3个工作日内完成审核
            </p>
          </div>

          <div className="card p-6 md:p-8 animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  设备类型 <span className="text-danger-500">*</span>
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
                        <Icon className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-medium text-sm">{item.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  设备序列号 <span className="text-danger-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder={`请输入${DeviceTypeLabels[deviceType]}序列号`}
                    className="input pl-10"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    联系人姓名 <span className="text-danger-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="请输入姓名"
                      className="input pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    联系电话 <span className="text-danger-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="请输入手机号"
                      className="input pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    购买日期
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    购买渠道 <span className="text-danger-500">*</span>
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <select
                      value={purchaseChannel}
                      onChange={(e) => setPurchaseChannel(e.target.value)}
                      className="input pl-10 appearance-none"
                      required
                    >
                      <option value="">请选择购买渠道</option>
                      {purchaseChannels.map((channel) => (
                        <option key={channel} value={channel}>{channel}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  情况说明 <span className="text-danger-500">*</span>
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="请详细说明发票丢失情况，以及能证明您购买该设备的相关信息..."
                    rows={4}
                    className="input pl-10 pt-3 resize-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  上传证明材料
                </label>
                <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
                    <p className="text-neutral-600 font-medium mb-1">点击上传文件</p>
                    <p className="text-sm text-neutral-500">支持图片、PDF格式，最多上传5个文件</p>
                  </label>
                </div>

                {proofFiles.length > 0 && (
                  <div className="mt-4 grid grid-cols-5 gap-3">
                    {proofFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={file}
                          alt={`证明材料${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-danger-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                    提交中...
                  </>
                ) : (
                  '提交审核申请'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
