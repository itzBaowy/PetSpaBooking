import { PageHeader } from "@/components/ui/page-header";
import { CommissionSummaryCards } from "./commission-summary-cards";
import { CommissionTable } from "./commission-table";
import { PendingCommissionTable } from "./pending-commission-table";

export function CommissionManagementPage() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        eyebrow="Quản trị / Tài chính"
        title="Quản lý hoa hồng"
        description="Theo dõi tiền khách đang giữ, hoa hồng chờ thu, đã thu, đã hoàn và thất bại trên toàn sàn."
      />
      <CommissionSummaryCards />
      <CommissionTable />
      <PendingCommissionTable />
    </div>
  );
}
