import { PageHeader } from "@/components/ui/page-header";
import { DisputeResolutionForm } from "./dispute-resolution-form";
import { DisputeTable } from "./dispute-table";

export function DisputeResolutionWorkspace() {
  return (
    <div className="w-full max-w-full space-y-6 p-6">
      <PageHeader
        eyebrow="Admin / Bookings / Disputes"
        title="Booking Disputes"
        description="Resolve disputes with refund, claim closure, or booking status adjustment. Every decision includes an audit log note."
      />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <DisputeTable />
        <DisputeResolutionForm />
      </div>
    </div>
  );
}
