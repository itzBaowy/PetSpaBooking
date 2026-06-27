"use client";

import { ActionMenu } from "@/components/ui/action-menu";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/components/ui/feedback-provider";
import type { DataTableColumn } from "@/components/ui/data-table";
import type { CommissionConfig } from "@/types/commission";
import { useCommissionConfigs } from "../queries";

export function CommissionRateTable() {
  const { showToast } = useToast();
  const { data: configs } = useCommissionConfigs();
  const columns: Array<DataTableColumn<CommissionConfig>> = [
    {
      key: "name",
      header: "Cấu hình",
      widthClassName: "w-[28%]",
      render: (config) => (
        <div>
          <p className="font-bold text-foreground">{config.name}</p>
          <p className="text-xs text-muted">{config.id}</p>
        </div>
      ),
    },
    {
      key: "scope",
      header: "Phạm vi",
      render: (config) => (
        <div>
          <p className="font-semibold">{config.scope}</p>
          <p className="text-xs text-muted">{config.scopeValue}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Loại",
      render: (config) => config.type,
    },
    {
      key: "value",
      header: "Giá trị",
      render: (config) =>
        config.type === "PERCENTAGE"
          ? `${config.value}%`
          : `${config.value.toLocaleString("vi-VN")} VND`,
    },
    {
      key: "effective",
      header: "Hiệu lực từ",
      render: (config) => config.effectiveFrom,
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (config) => (
        <span className="rounded-full border border-border-subtle bg-surface-muted px-2.5 py-1 text-xs font-bold text-muted">
          {config.isActive ? "Đang hoạt động" : "Nháp"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      align: "right",
      isAction: true,
      render: (config) => (
        <ActionMenu
          items={[
            {
              label: "Sửa cấu hình",
              onClick: () =>
                showToast("BE chưa hỗ trợ cập nhật cấu hình hoa hồng.", "info"),
            },
            {
              label: config.isActive ? "Tắt cấu hình" : "Bật cấu hình",
              onClick: () =>
                showToast("BE chưa hỗ trợ đổi trạng thái cấu hình.", "info"),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">Tỷ lệ hoa hồng</h2>
        <p className="text-sm text-muted">
          Thay đổi cấu hình chỉ áp dụng cho đặt lịch mới.
        </p>
      </div>
      <DataTable
        columns={columns}
        data={configs}
        getRowKey={(config) => config.id}
        minWidthClassName="min-w-[980px]"
      />
    </section>
  );
}
