import { PageHeader } from "@/components/ui/page-header";
import { VerificationTable } from "@/apis/admin/verification/components/verification-table";

export default function Verification() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <PageHeader
        eyebrow="Admin / Verification"
        title="Provider Verification"
        description="Review and approve new provider registration requests"
        actions={
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm text-sm text-gray-600 font-medium">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Pending requests are highlighted</span>
          </div>
        }
      />

      {/* Verification Table (includes search, filters, pagination) */}
      <VerificationTable />
    </div>
  );
}
