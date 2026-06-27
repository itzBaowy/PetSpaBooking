import { ProviderManagement } from "@/apis/admin/providers/components/provider-management";
import type { AdminProviderStatus } from "@/apis/admin/providers/schema";

const providerStatuses = new Set<AdminProviderStatus>([
  "PENDING_VERIFICATION",
  "VERIFIED",
  "REJECTED",
  "SUSPENDED",
]);

type PageProps = {
  searchParams: Promise<{ providerStatus?: string }>;
};

export default async function AdminProviders({ searchParams }: PageProps) {
  const { providerStatus } = await searchParams;
  const defaultStatus =
    providerStatus &&
    providerStatuses.has(providerStatus as AdminProviderStatus)
      ? (providerStatus as AdminProviderStatus)
      : undefined;

  return <ProviderManagement defaultStatus={defaultStatus} />;
}
