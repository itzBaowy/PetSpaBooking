"use client";

import { CustomSelect } from "@/components/ui/custom-select";

export function ReportResolutionDialog() {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h3 className="font-semibold">Xử lý báo cáo</h3>
      <div>
        <label className="block text-sm font-medium mb-1">Hành động</label>
        <CustomSelect
          options={[
            "Chọn hành động",
            "Bỏ qua",
            "Cảnh cáo",
            "Tạm khóa",
            "Cấm tài khoản",
          ]}
        />
      </div>
      <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
        Áp dụng hành động
      </button>
    </div>
  );
}
