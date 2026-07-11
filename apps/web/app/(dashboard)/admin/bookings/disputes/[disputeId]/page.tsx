import { AdminDisputeDetailPage } from "@/components/admin/supported-pages";
export default async function Page({ params }: { params: Promise<{ disputeId: string }> }) { const { disputeId } = await params; return <AdminDisputeDetailPage id={disputeId} />; }
