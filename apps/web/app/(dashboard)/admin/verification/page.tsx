import { VerificationTable } from "@/apis/admin/verification/components/verification-table";

export default function Verification() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <nav className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">
            Admin / Verification
          </nav>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Provider Verification
          </h1>
          <p className="text-gray-500 mt-1">
            Review and approve new provider registration requests
          </p>
        </div>

        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Verification Table (includes search, filters, pagination) */}
      <VerificationTable />
    </div>
  );
}