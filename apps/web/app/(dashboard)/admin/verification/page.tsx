import { ProviderManagement } from "@/apis/admin/providers/components/provider-management";
import { PageHeader } from "@/components/ui/page-header";

export default function Verification() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-6">
      <PageHeader
        eyebrow="Quản trị / Xác thực"
        title="Xác thực nhà cung cấp"
        description="Rà soát và phê duyệt yêu cầu đăng ký nhà cung cấp mới."
        actions={
          <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm">
            <span>Yêu cầu chờ duyệt được ưu tiên hiển thị</span>
          </div>
        }
      />

      <ProviderManagement
        defaultStatus="PENDING_VERIFICATION"
        verificationOnly
      />
    </div>
  );
}
