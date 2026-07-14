import { ProviderDisputeDetailPage } from "@/apis/provider/disputes/components/provider-dispute-detail-page";

export default async function Page({ params }: { params: Promise<{ disputeId: string }> }) {
  const { disputeId } = await params;
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <ProviderDisputeDetailPage disputeId={disputeId} />
      </div>
    </main>
  );
}
