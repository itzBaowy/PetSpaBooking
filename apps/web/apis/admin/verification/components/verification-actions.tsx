"use client";

import { useState } from "react";

interface VerificationActionsProps {
  verificationId?: string;
  currentStatus?: string;
  onActionComplete?: () => void;
}

export function VerificationActions({
  verificationId,
  currentStatus = "pending",
  onActionComplete,
}: VerificationActionsProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState<
    "approve" | "reject" | "info" | null
  >(null);
  const [rejectReason, setRejectReason] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [mockStatus, setMockStatus] = useState(currentStatus);

  const isResolved = mockStatus === "approved" || mockStatus === "rejected";

  const handleApprove = () => {
    setMockStatus("approved");
    setShowConfirmDialog(null);
    onActionComplete?.();
  };

  const handleReject = () => {
    setMockStatus("rejected");
    setShowConfirmDialog(null);
    setRejectReason("");
    onActionComplete?.();
  };

  const handleRequestInfo = () => {
    setShowConfirmDialog(null);
    setInfoMessage("");
    onActionComplete?.();
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900">
          Quyết định xét duyệt
        </h3>

        {isResolved ? (
          <div className="text-center py-6">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                mockStatus === "approved"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {mockStatus === "approved" ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {mockStatus === "approved"
                ? "Nhà cung cấp đã được duyệt"
                : "Nhà cung cấp đã bị từ chối"}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Yêu cầu xác thực này đã được xử lý.
            </p>
          </div>
        ) : (
          <>
            {/* Status Badge */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Chờ xét duyệt
                </p>
                <p className="text-xs text-amber-700">
                  Nhà cung cấp này đang chờ quyết định của bạn
                </p>
              </div>
            </div>

            {/* Approval Guidelines */}
            <div className="space-y-2 text-sm">
              <h4 className="font-semibold text-gray-800 text-xs uppercase tracking-wider">
                Danh sách kiểm tra
              </h4>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-xs text-gray-700">
                  Giấy phép kinh doanh hợp lệ và khớp thông tin đăng ký
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-xs text-gray-700">
                  Chứng chỉ chuyên môn còn hiệu lực
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-xs text-gray-700">
                  Đã cung cấp giấy tờ thuế và bảo hiểm
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-xs text-gray-700">
                  Thông tin liên hệ đã được xác minh và chính xác
                </span>
              </label>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <button
                onClick={() => setShowConfirmDialog("approve")}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Duyệt xác thực
              </button>

              <button
                onClick={() => setShowConfirmDialog("reject")}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Từ chối
              </button>

              <button
                onClick={() => setShowConfirmDialog("info")}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Yêu cầu bổ sung thông tin
              </button>
            </div>
          </>
        )}
      </div>

      {/* Hộp thoại xác nhận duyệt */}
      {showConfirmDialog === "approve" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-center text-gray-900">
                Duyệt nhà cung cấp
              </h3>
              <p className="text-sm text-gray-700 text-center mt-2">
                Thao tác này sẽ duyệt yêu cầu xác thực và kích hoạt tài khoản trên nền tảng.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowConfirmDialog(null)}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleApprove}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Xác nhận duyệt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hộp thoại xác nhận từ chối */}
      {showConfirmDialog === "reject" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-center text-gray-900">
                Từ chối nhà cung cấp
              </h3>
              <p className="text-sm text-gray-700 text-center mt-2">
                Vui lòng nhập lý do từ chối. Nội dung này sẽ được gửi cho nhà cung cấp.
              </p>
              <div className="mt-4">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối (bắt buộc)..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
                {rejectReason && rejectReason.length < 10 && (
                  <p className="text-xs text-red-600 mt-1">
                    Lý do phải có ít nhất 10 ký tự
                  </p>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowConfirmDialog(null); setRejectReason(""); }}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleReject}
                  disabled={rejectReason.length < 10}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Xác nhận từ chối
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hộp thoại yêu cầu bổ sung */}
      {showConfirmDialog === "info" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-center text-gray-900">
                Yêu cầu bổ sung thông tin
              </h3>
              <p className="text-sm text-gray-700 text-center mt-2">
                Mô tả tài liệu hoặc thông tin bổ sung mà nhà cung cấp cần nộp.
              </p>
              <div className="mt-4">
                <textarea
                  value={infoMessage}
                  onChange={(e) => setInfoMessage(e.target.value)}
                  placeholder="Ví dụ: Vui lòng cung cấp giấy phép kinh doanh và chứng nhận bảo hiểm mới nhất..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                {infoMessage && infoMessage.length < 10 && (
                  <p className="text-xs text-red-600 mt-1">
                    Nội dung phải có ít nhất 10 ký tự
                  </p>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowConfirmDialog(null); setInfoMessage(""); }}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleRequestInfo}
                  disabled={infoMessage.length < 10}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Gửi yêu cầu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
