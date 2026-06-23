import { PageHeader } from "@/components/ui/page-header";
import { CommissionConfigForm } from "./commission-config-form";
import { CommissionRateTable } from "./commission-rate-table";

export function CommissionConfigPage() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        backHref="/admin/finance/commission"
        backLabel="Quay lại hoa hồng"
        eyebrow="Quản trị / Tài chính / Hoa hồng"
        title="Cấu hình hoa hồng"
        description="Tạo và quản lý tỷ lệ hoa hồng. Cấu hình mới chỉ áp dụng cho đặt lịch mới."
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.55fr)]">
        <CommissionRateTable />
        <CommissionConfigForm />
      </div>
    </div>
  );
}
