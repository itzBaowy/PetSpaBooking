import { ProviderAvailabilityPage as ProviderAvailabilityScreen } from "@/apis/provider/availability/components/provider-availability-page";

export default function ProviderAvailabilityPage() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <ProviderAvailabilityScreen />
      </div>
    </main>
  );
}
