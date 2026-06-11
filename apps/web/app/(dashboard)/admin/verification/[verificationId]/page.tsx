import { ProviderDocumentViewer } from "@/apis/admin/verification/components/provider-document-viewer";
import { VerificationActions } from "@/apis/admin/verification/components/verification-actions";

export default function VerificationDetailPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Verification Review</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProviderDocumentViewer />
        </div>
        <div>
          <VerificationActions />
        </div>
      </div>
    </div>
  );
}
