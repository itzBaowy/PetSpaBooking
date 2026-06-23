import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
  widthClassName?: string;
  align?: "left" | "right" | "center";
  isAction?: boolean;
}

interface DataTableProps<T> {
  columns: Array<DataTableColumn<T>>;
  data: T[];
  getRowKey: (row: T) => string;
  emptyState?: ReactNode;
  minWidthClassName?: string;
}

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  emptyState,
  minWidthClassName = "min-w-[960px]",
}: DataTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return (
      <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-sm">
        {emptyState}
      </div>
    );
  }

  const actionColumns = columns.filter((column) => column.isAction);
  const contentColumns = columns.filter((column) => !column.isAction);

  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-sm">
      <div className="divide-y divide-border-subtle md:hidden">
        {data.map((row) => (
          <div key={getRowKey(row)} className="space-y-3 p-4">
            <div className="space-y-3">
              {contentColumns.map((column) => (
                <div
                  key={column.key}
                  className="flex min-w-0 items-start justify-between gap-4"
                >
                  <p className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-subtle">
                    {column.header}
                  </p>
                  <div className="min-w-0 text-right text-sm text-foreground">
                    {column.render(row)}
                  </div>
                </div>
              ))}
            </div>
            {actionColumns.length > 0 && (
              <div className="border-t border-border-subtle pt-4">
                {actionColumns.map((column) => (
                  <div key={column.key}>{column.render(row)}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className={cn("w-full table-fixed text-left", minWidthClassName)}>
          <thead>
            <tr className="border-b border-border-subtle bg-surface-muted">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted",
                    column.align === "right" && "text-right",
                    column.align === "center" && "text-center",
                    column.widthClassName,
                    column.headerClassName,
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {data.map((row) => (
              <tr key={getRowKey(row)} className="transition-colors hover:bg-surface-muted">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-6 py-4 align-middle text-sm text-foreground",
                      column.align === "right" && "text-right",
                      column.align === "center" && "text-center",
                      column.isAction && "whitespace-nowrap",
                      column.widthClassName,
                      column.cellClassName,
                      column.className,
                    )}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
