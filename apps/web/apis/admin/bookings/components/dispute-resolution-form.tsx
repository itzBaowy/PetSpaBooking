"use client";

import { CustomSelect } from "@/components/ui/custom-select";
import { BOOKING_STATUS_OPTIONS } from "@/constants/booking-status";

export function DisputeResolutionForm() {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">Biểu mẫu xử lý mock</h2>
      <p className="mt-1 text-sm text-gray-500">
        Giao diện này ghi nhận ghi chú kiểm toán bắt buộc cho thao tác xử lý tranh chấp.
      </p>
      <form className="mt-5 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-gray-700">Kết quả</span>
          <CustomSelect
            className="mt-1"
            options={[
              { label: "Hoàn tiền", value: "REFUND" },
              { label: "Đóng khiếu nại", value: "CLOSE_CLAIM" },
              { label: "Cập nhật trạng thái đặt lịch", value: "UPDATE_BOOKING_STATUS" },
            ]}
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-gray-700">
            Trạng thái đặt lịch
          </span>
          <CustomSelect
            className="mt-1"
            options={BOOKING_STATUS_OPTIONS}
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-gray-700">
            Số tiền hoàn
          </span>
          <input
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="0 VND"
            type="number"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-gray-700">
            Ghi chú kiểm toán
          </span>
          <textarea
            className="mt-1 min-h-28 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="Lý do, bằng chứng đã kiểm tra và quyết định cuối cùng..."
          />
        </label>
        <div className="flex justify-end gap-2">
          <button
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700"
            type="button"
          >
            Lưu nháp
          </button>
          <button
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white"
            type="button"
          >
            Xử lý tranh chấp
          </button>
        </div>
      </form>
    </div>
  );
}
