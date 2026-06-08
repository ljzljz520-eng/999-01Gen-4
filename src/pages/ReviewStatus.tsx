import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Clock, CheckCircle, XCircle, FileText, Calendar, User, Phone } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { reviewApi } from '@/api';
import type { ReviewApplication } from '../../shared/types.js';
import { ReviewStatusLabels, DeviceTypeLabels } from '../../shared/types.js';

export default function ReviewStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [applicationId, setApplicationId] = useState(searchParams.get('id') || '');
  const [application, setApplication] = useState<ReviewApplication | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!applicationId.trim()) {
      setError('请输入申请编号');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const result = await reviewApi.get(applicationId.trim());
      setApplication(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '查询失败，请检查申请编号是否正确');
      setApplication(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (applicationId) {
      handleSearch();
    }
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-8 h-8 text-warning-500" />;
      case 'approved':
        return <CheckCircle className="w-8 h-8 text-success-500" />;
      case 'rejected':
        return <XCircle className="w-8 h-8 text-danger-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-warning">待审核</span>;
      case 'approved':
        return <span className="badge badge-success">已通过</span>;
      case 'rejected':
        return <span className="badge badge-danger">已驳回</span>;
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
          返回首页
        </button>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-700 mb-2">审核进度查询</h1>
            <p className="text-neutral-500">输入申请编号，查询人工审核进度</p>
          </div>

          <div className="card p-6 mb-6 animate-slide-up">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  placeholder="请输入申请编号"
                  className="input pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="btn-primary"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>
            {error && (
              <div className="mt-3 p-3 rounded-lg bg-danger-50 text-danger-600 text-sm">
                {error}
              </div>
            )}
          </div>

          {application && (
            <div className="card p-6 animate-fade-in">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-neutral-100">
                {getStatusIcon(application.status)}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-semibold text-neutral-700">
                      {DeviceTypeLabels[application.deviceType]}保修审核
                    </h2>
                    {getStatusBadge(application.status)}
                  </div>
                  <p className="text-sm text-neutral-500">申请编号：{application.id}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-neutral-500">序列号</p>
                      <p className="font-mono text-neutral-700">{application.serialNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-neutral-500">联系人</p>
                      <p className="text-neutral-700">{application.contactName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-neutral-500">联系电话</p>
                      <p className="text-neutral-700">{application.contactPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-neutral-500">购买日期</p>
                      <p className="text-neutral-700">{application.purchaseDate || '未填写'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-neutral-50 rounded-xl">
                  <p className="text-sm text-neutral-500 mb-2">情况说明</p>
                  <p className="text-neutral-700">{application.description}</p>
                </div>

                {application.proofFiles.length > 0 && (
                  <div>
                    <p className="text-sm text-neutral-500 mb-3">证明材料</p>
                    <div className="grid grid-cols-5 gap-3">
                      {application.proofFiles.map((file, index) => (
                        <img
                          key={index}
                          src={file}
                          alt={`证明材料${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {application.status !== 'pending' && application.reviewRemark && (
                  <div className={`p-4 rounded-xl ${
                    application.status === 'approved' ? 'bg-success-50' : 'bg-danger-50'
                  }`}>
                    <p className="text-sm text-neutral-500 mb-1">审核备注</p>
                    <p className={application.status === 'approved' ? 'text-success-700' : 'text-danger-700'}>
                      {application.reviewRemark}
                    </p>
                    <p className="text-xs text-neutral-500 mt-2">
                      审核时间：{new Date(application.reviewedAt!).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="text-xs text-neutral-500 pt-4 border-t border-neutral-100">
                  提交时间：{new Date(application.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
