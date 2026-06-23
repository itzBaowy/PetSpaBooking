import { PageHeader } from "@/components/ui/page-header";
import { DisputeResolutionForm } from "./dispute-resolution-form";
import { DisputeTable } from "./dispute-table";

export function DisputeResolutionWorkspace() {
  return (
    <div className="w-full max-w-full space-y-6 p-6">
      <PageHeader
        eyebrow="Quản trị / Đặt lịch / Tranh chấp"
        title="Tranh chấp đặt lịch"
        description="Xử lý tranh chấp bằng hoàn tiền, đóng khiếu nại hoặc điều chỉnh trạng thái đặt lịch. Mỗi quyết định đều có ghi chú kiểm toán."
      />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <DisputeTable />
        <DisputeResolutionForm />
      </div>
    </div>
  );
}
