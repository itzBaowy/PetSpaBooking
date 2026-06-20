import { ProviderDetail } from "@/apis/admin/users/components/provider-detail";

interface PageProps {
  params: Promise<{ providerId: string }>;
}

export default async function AdminProviderDetailPage({ params }: PageProps) {
  const { providerId } = await params;

  return <ProviderDetail providerId={providerId} />;
}
