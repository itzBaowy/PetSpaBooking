import { cn } from "@/lib/utils";
import {
  roleLabels,
  statusLabels,
  type AdminUserRole,
  type AdminUserStatus,
} from "../schema";

export function RoleBadge({ role }: { role: AdminUserRole }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
        role === "CUSTOMER" && "border-blue-200 bg-blue-50 text-blue-700",
        role === "PROVIDER" && "border-purple-200 bg-purple-50 text-purple-700",
        role === "ADMIN" && "border-slate-200 bg-slate-50 text-slate-700",
      )}
    >
      {roleLabels[role]}
    </span>
  );
}

export function StatusBadge({ status }: { status: AdminUserStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
        status === "ACTIVE" && "border-green-200 bg-green-50 text-green-700",
        status === "INACTIVE" && "border-gray-200 bg-gray-50 text-gray-700",
        status === "BANNED" && "border-red-200 bg-red-50 text-red-700",
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
