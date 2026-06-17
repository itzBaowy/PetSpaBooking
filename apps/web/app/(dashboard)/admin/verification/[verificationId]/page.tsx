import { PageHeader } from "@/components/ui/page-header";
import { ProviderDocumentViewer } from "@/apis/admin/verification/components/provider-document-viewer";
import { VerificationActions } from "@/apis/admin/verification/components/verification-actions";

interface PageProps {
  params: Promise<{ verificationId: string }>;
}

export default async function VerificationDetailPage({ params }: PageProps) {
  const { verificationId } = await params;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <PageHeader
        backHref="/admin/verification"
        backLabel="Quay lại xác thực"
        eyebrow="Quản trị / Xác thực / Rà soát"
        title="Rà soát xác thực"
        description="Kiểm tra tài liệu nhà cung cấp và đưa ra quyết định phê duyệt"
      />

      {/* Nội dung chính */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProviderDocumentViewer />
        </div>
        <div className="space-y-6">
          <VerificationActions
            verificationId={verificationId}
            currentStatus="pending"
          />
        </div>
      </div>
    </div>
  );
}
