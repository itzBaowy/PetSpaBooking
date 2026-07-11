import { AdminWithdrawalDetailPage } from "@/components/admin/supported-pages";
export default async function Page({ params }: { params: Promise<{ withdrawalId: string }> }) { const { withdrawalId } = await params; return <AdminWithdrawalDetailPage id={withdrawalId} />; }
