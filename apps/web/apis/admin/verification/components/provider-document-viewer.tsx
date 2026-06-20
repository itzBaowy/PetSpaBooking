"use client";

import { useState } from "react";

const MOCK_DOCUMENTS = [
  { name: "Giay-phep-kinh-doanh.pdf", type: "pdf", size: "2.4 MB", status: "verified" },
  { name: "Chung-chi-thu-y.jpg", type: "image", size: "1.1 MB", status: "pending" },
  { name: "Dang-ky-thue.pdf", type: "pdf", size: "856 KB", status: "pending" },
  { name: "Bao-hiem-dich-vu.pdf", type: "pdf", size: "3.2 MB", status: "pending" },
  { name: "Anh-co-so.zip", type: "archive", size: "5.7 MB", status: "pending" },
];

export function ProviderDocumentViewer() {
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const selectedDocument = MOCK_DOCUMENTS[selectedDocIndex];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-200 text-xl font-bold text-amber-700">
              P
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                PetCare Spa & Clinic
              </h3>
              <p className="text-sm text-gray-700">contact@petcare.com</p>
              <p className="text-sm text-gray-700">+84 28 3456 7890</p>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full border border-yellow-300 bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
            Chờ duyệt
          </span>
        </div>
        <div className="mt-4 border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-800">
            <span className="font-semibold text-gray-900">Địa chỉ:</span>{" "}
            456 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh
          </p>
          <p className="mt-1 text-sm text-gray-800">
            <span className="font-semibold text-gray-900">Mô tả:</span>{" "}
            Spa và phòng khám thú cưng trọn gói với 8 năm kinh nghiệm, chuyên
            chăm sóc chó và mèo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:col-span-1">
          <h4 className="mb-3 text-sm font-semibold text-gray-900">
            Tài liệu đã tải lên
          </h4>
          <div className="space-y-2">
            {MOCK_DOCUMENTS.map((doc, index) => (
              <button
                key={doc.name}
                type="button"
                onClick={() => setSelectedDocIndex(index)}
                className={`w-full rounded-lg border p-3 text-left transition-all ${
                  selectedDocIndex === index
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      doc.type === "pdf"
                        ? "bg-red-50 text-red-600"
                        : doc.type === "image"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-gray-50 text-gray-600"
                    }`}
                  >
                    <span className="text-xs font-bold">
                      {doc.type === "image" ? "IMG" : doc.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500">{doc.size}</p>
                  </div>
                  {doc.status === "verified" && (
                    <span className="text-xs font-bold text-green-600">Đã kiểm</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">
              Xem trước tài liệu
            </h4>
            <button className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200">
              Tải xuống
            </button>
          </div>

          <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-xl bg-white text-2xl font-bold text-gray-400 shadow-sm">
                {selectedDocument?.type === "image" ? "IMG" : "PDF"}
              </div>
              <p className="text-sm font-medium text-gray-700">
                Bản xem trước: {selectedDocument?.name ?? "Tài liệu"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Có thể kiểm tra nội dung và tải xuống trong khu vực này.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
