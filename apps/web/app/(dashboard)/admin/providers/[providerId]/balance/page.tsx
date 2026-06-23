import { ProviderBalancePage } from "@/apis/admin/finance/components/provider-balance-page";

export default async function AdminProviderBalanceRoute({
  params,
}: {
  params: Promise<{ providerId: string }>;
}) {
  const { providerId } = await params;
  return <ProviderBalancePage providerId={providerId} />;
}
