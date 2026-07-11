"use client";

import { CustomSelect } from "@/components/ui/custom-select";
import { cn } from "@/lib/utils";

type PaginationItem = number | "ellipsis";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
}

function getPaginationItems(page: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages];
  }

  if (page >= totalPages - 2) {
    return [
      1,
      "ellipsis",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages];
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  pageSize,
  pageSizeOptions = [5, 10, 20],
  onPageSizeChange,
  className,
}: PaginationProps) {
  const shouldShowPageSize = pageSize !== undefined && onPageSizeChange;
  if (totalPages <= 1 && !shouldShowPageSize) return null;

  const safePage = Math.min(Math.max(page, 1), totalPages);
  const items = getPaginationItems(safePage, totalPages);

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-between gap-3 sm:flex-row",
        className,
      )}
    >
      {shouldShowPageSize && (
        <div className="flex items-center gap-2 text-sm font-medium text-muted">
          <span>Số dòng mỗi trang</span>
          <CustomSelect
            className="w-24"
            defaultValue={String(pageSize)}
            options={pageSizeOptions.map((option) => ({
              label: String(option),
              value: String(option),
            }))}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          />
        </div>
      )}

      {totalPages >= 1 && (
        <nav
          aria-label="Phân trang"
          className="flex items-center justify-center gap-2"
        >
          <button
            type="button"
            aria-label="Trang trước"
            disabled={safePage === 1}
            onClick={() => onPageChange(safePage - 1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-surface text-foreground shadow-sm transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {items.map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-surface text-sm font-bold text-foreground shadow-sm"
              >
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                aria-label={`Trang ${item}`}
                aria-current={item === safePage ? "page" : undefined}
                onClick={() => onPageChange(item)}
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold shadow-sm transition-colors",
                  item === safePage
                    ? "border-foreground bg-foreground text-background"
                    : "border-border-subtle bg-surface text-foreground hover:bg-surface-muted",
                )}
              >
                {item}
              </button>
            ),
          )}

          <button
            type="button"
            aria-label="Trang sau"
            disabled={safePage === totalPages}
            onClick={() => onPageChange(safePage + 1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-surface text-foreground shadow-sm transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </nav>
      )}
    </div>
  );
}
