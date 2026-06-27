import { cn } from "@/lib/utils";
import { providerStatusLabels, type AdminProviderStatus } from "../schema";

export function ProviderStatusBadge({ status }: { status: AdminProviderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
        status === "PENDING_VERIFICATION" &&
          "border-amber-200 bg-amber-50 text-amber-700",
        status === "VERIFIED" && "border-green-200 bg-green-50 text-green-700",
        status === "REJECTED" && "border-red-200 bg-red-50 text-red-700",
        status === "SUSPENDED" && "border-slate-200 bg-slate-50 text-slate-700",
      )}
    >
      {providerStatusLabels[status]}
    </span>
  );
}
