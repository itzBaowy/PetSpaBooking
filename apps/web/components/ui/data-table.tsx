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
      <div className="w-full overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-sm">
        {emptyState}
      </div>
    );
  }

  const actionColumns = columns.filter((column) => column.isAction);
  const contentColumns = columns.filter((column) => !column.isAction);

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-sm">
      <div className="divide-y divide-border-subtle md:hidden">
        {data.map((row) => (
          <div key={getRowKey(row)} className="space-y-3 p-4 transition hover:bg-emerald-50/35">
            <div className="space-y-3">
              {contentColumns.map((column) => (
                <div
                  key={column.key}
                  className="grid min-w-0 grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] items-start gap-3"
                >
                  <p className="min-w-0 break-words text-[11px] font-semibold uppercase tracking-wider text-subtle">
                    {column.header}
                  </p>
                  <div className="min-w-0 break-words text-right text-sm text-foreground">
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

      <div className="hidden w-full overflow-x-auto md:block">
        <table className={cn("w-full table-fixed text-left", minWidthClassName)}>
          <thead>
            <tr className="border-b border-emerald-100 bg-emerald-50/70">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-emerald-800",
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
              <tr key={getRowKey(row)} className="transition-colors hover:bg-emerald-50/40">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-5 py-4 align-middle text-sm text-foreground",
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
