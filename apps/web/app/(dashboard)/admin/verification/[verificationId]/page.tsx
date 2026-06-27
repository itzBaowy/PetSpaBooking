import { ProviderDetail } from "@/apis/admin/providers/components/provider-detail";

interface PageProps {
  params: Promise<{ verificationId: string }>;
}

export default async function VerificationDetailPage({ params }: PageProps) {
  const { verificationId } = await params;

  return (
    <ProviderDetail
      providerId={verificationId}
      backHref="/admin/verification"
    />
  );
}
