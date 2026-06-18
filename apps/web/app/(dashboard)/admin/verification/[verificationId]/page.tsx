import Link from "next/link";
import { ProviderDocumentViewer } from "@/apis/admin/verification/components/provider-document-viewer";
import { VerificationActions } from "@/apis/admin/verification/components/verification-actions";

interface PageProps {
  params: Promise<{ verificationId: string }>;
}

export default async function VerificationDetailPage({ params }: PageProps) {
  const { verificationId } = await params;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link
          href="/admin/verification"
          className="hover:text-blue-600 transition-colors"
        >
          Provider Verification
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Review</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Verification Review
          </h1>
          <p className="text-gray-500 mt-1">
            Review provider documents and make an approval decision
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/verification"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to List
          </Link>
        </div>
      </div>

      {/* Main Content: Split View */}
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