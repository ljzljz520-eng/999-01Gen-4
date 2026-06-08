import { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, FileText, User, Phone, Calendar } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { reviewApi } from '@/api';
import type { ReviewApplication, ReviewStatus } from '../../shared/types.js';
import { ReviewStatusLabels, DeviceTypeLabels } from '../../shared/types.js';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<{ total: number; list: ReviewApplication[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [status, setStatus] = useState<ReviewStatus | ''>('');
  const [keyword, setKeyword] = useState('');
  const [selectedReview, setSelectedReview] = useState<ReviewApplication | null>(null);
  const [rejectRemark, setRejectRemark] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [page, status, keyword]);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const params: any = { page, pageSize };
      if (status) params.status = status;
      if (keyword) params.keyword = keyword;

      const data = await reviewApi.list(params);
      setReviews(data);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (review: ReviewApplication) => {
    setActionLoading(true);
    try {
      await reviewApi.approve(review.id, '审核通过，保修资格已确认');
      loadReviews();
      setSelectedReview(null);
    } catch (error) {
      console.error('Failed to approve:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReview || !rejectRemark.trim()) return;

    setActionLoading(true);
    try {
      await reviewApi.reject(selectedReview.id, rejectRemark);
      loadReviews();
      setSelectedReview(null);
      setShowRejectModal(false);
      setRejectRemark('');
    } catch (error) {
      console.error('Failed to reject:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = reviews ? Math.ceil(reviews.total / pageSize) : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-warning"><Clock className="w-3 h-3 mr-1" />待审核</span>;
      case 'approved':
        return <span className="badge badge-success"><CheckCircle className="w-3 h-3 mr-1" />已通过</span>;
      case 'rejected':
        return <span className="badge badge-danger"><XCircle className="w-3 h-3 mr-1" />已驳回</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar role="admin" />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-700 mb-2">审核管理</h1>
          <p className="text-neutral-500">处理用户提交的人工保修资格审核申请</p>
        </div>

        <div className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-neutral-500" />
            <h3 className="font-medium text-neutral-700">筛选条件</h3>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-neutral-500 mb-1">审核状态</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReviewStatus | '')}
                className="input"
              >
                <option value="">全部</option>
                <option value="pending">待审核</option>
                <option value="approved">已通过</option>
                <option value="rejected">已驳回</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-neutral-500 mb-1">搜索</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="序列号/姓名/电话"
                  className="input pl-9"
                />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <button onClick={() => setPage(1)} className="btn-primary flex-1">
                <Search className="w-4 h-4" />
                查询
              </button>
              <button
                onClick={() => {
                  setStatus('');
                  setKeyword('');
                  setPage(1);
                }}
                className="btn-secondary"
              >
                重置
              </button>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
            <div className="text-sm text-neutral-500">
              共 <span className="font-medium text-neutral-700">{reviews?.total || 0}</span> 条记录
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">申请信息</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">联系人</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">状态</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">提交时间</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {reviews?.list.map((review, index) => (
                      <tr
                        key={review.id}
                        className="hover:bg-neutral-50 transition-colors animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                              <div className="font-medium text-neutral-700">
                                {DeviceTypeLabels[review.deviceType]}保修审核
                              </div>
                              <div className="font-mono text-xs text-neutral-500">
                                {review.serialNumber}
                              </div>
                              <div className="text-xs text-neutral-500 mt-1">
                                {review.purchaseChannel}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-neutral-700">{review.contactName}</div>
                          <div className="text-sm text-neutral-500">{review.contactPhone}</div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(review.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-neutral-600">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedReview(review)}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            查看详情
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {reviews && reviews.list.length > 0 && (
                <div className="p-6 border-t border-neutral-100 flex items-center justify-between">
                  <div className="text-sm text-neutral-500">
                    第 {page} / {totalPages} 页
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="btn-secondary text-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      上一页
                    </button>
                    <span className="px-4 py-2 text-sm font-medium text-neutral-700">{page}</span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="btn-secondary text-sm"
                    >
                      下一页
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto animate-fade-in">
            <div className="p-6 border-b border-neutral-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-neutral-700">审核详情</h2>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                {getStatusBadge(selectedReview.status)}
                <span className="text-sm text-neutral-500">
                  申请编号：{selectedReview.id}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-500">设备类型</p>
                    <p className="text-neutral-700 font-medium">{DeviceTypeLabels[selectedReview.deviceType]}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-500">序列号</p>
                    <p className="font-mono text-neutral-700">{selectedReview.serialNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-500">联系人</p>
                    <p className="text-neutral-700">{selectedReview.contactName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-500">联系电话</p>
                    <p className="text-neutral-700">{selectedReview.contactPhone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-500">购买日期</p>
                    <p className="text-neutral-700">{selectedReview.purchaseDate || '未填写'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-500">购买渠道</p>
                    <p className="text-neutral-700">{selectedReview.purchaseChannel}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-neutral-50 rounded-xl">
                <p className="text-sm text-neutral-500 mb-2">情况说明</p>
                <p className="text-neutral-700">{selectedReview.description}</p>
              </div>

              {selectedReview.proofFiles.length > 0 && (
                <div>
                  <p className="text-sm text-neutral-500 mb-3">证明材料</p>
                  <div className="grid grid-cols-5 gap-3">
                    {selectedReview.proofFiles.map((file, index) => (
                      <img
                        key={index}
                        src={file}
                        alt={`证明材料${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedReview.reviewRemark && (
                <div className={`p-4 rounded-xl ${
                  selectedReview.status === 'approved' ? 'bg-success-50' : 'bg-danger-50'
                }`}>
                  <p className="text-sm text-neutral-500 mb-1">审核备注</p>
                  <p className={selectedReview.status === 'approved' ? 'text-success-700' : 'text-danger-700'}>
                    {selectedReview.reviewRemark}
                  </p>
                  <p className="text-xs text-neutral-500 mt-2">
                    审核时间：{new Date(selectedReview.reviewedAt!).toLocaleString()}
                  </p>
                </div>
              )}

              {selectedReview.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-neutral-100">
                  <button
                    onClick={() => handleApprove(selectedReview)}
                    disabled={actionLoading}
                    className="btn-success flex-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {actionLoading ? '处理中...' : '审核通过'}
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                    className="btn-danger flex-1"
                  >
                    <XCircle className="w-4 h-4" />
                    驳回申请
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showRejectModal && selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full animate-fade-in">
            <div className="p-6 border-b border-neutral-100">
              <h3 className="text-lg font-bold text-neutral-700">驳回申请</h3>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                驳回原因 <span className="text-danger-500">*</span>
              </label>
              <textarea
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
                placeholder="请填写驳回原因..."
                rows={4}
                className="input resize-none"
              />
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectRemark('');
                  }}
                  className="btn-secondary flex-1"
                >
                  取消
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectRemark.trim() || actionLoading}
                  className="btn-danger flex-1"
                >
                  {actionLoading ? '处理中...' : '确认驳回'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
