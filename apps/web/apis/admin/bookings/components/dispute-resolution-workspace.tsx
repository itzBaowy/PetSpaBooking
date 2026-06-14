import { DisputeResolutionForm } from "./dispute-resolution-form";
import { DisputeTable } from "./dispute-table";

export function DisputeResolutionWorkspace() {
  return (
    <div className="mx-auto max-w-[1500px] space-y-6 p-6">
      <div>
        <nav className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Admin / Bookings / Disputes
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Booking Disputes
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-500">
          Resolve disputes with refund, claim closure, or booking status
          adjustment. Every decision includes an audit log note.
        </p>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <DisputeTable />
        <DisputeResolutionForm />
      </div>
    </div>
  );
}
