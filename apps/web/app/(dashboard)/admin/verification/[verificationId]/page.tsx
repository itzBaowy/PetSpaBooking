import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ verificationId: string }>;
};

export default async function VerificationDetailPage({ params }: PageProps) {
  const { verificationId } = await params;
  redirect(`/admin/providers/${verificationId}`);
}
