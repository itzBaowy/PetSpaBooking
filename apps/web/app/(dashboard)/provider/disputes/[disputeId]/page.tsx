import { ProviderDisputeDetailMock } from "@/components/provider/disputes/dispute-detail";

export default async function ProviderDisputeDetailPage({ params }: { params: Promise<{ disputeId: string }> }) { const { disputeId } = await params; return <main className="p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl"><ProviderDisputeDetailMock disputeId={disputeId} /></div></main>; }
