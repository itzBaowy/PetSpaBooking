import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ verificationId: string }>;
}) {
  const { verificationId } = await params;
  redirect(`/admin/providers/${verificationId}`);
}
