"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export interface ActionMenuItem {
  label: string;
  onClick?: () => void;
  variant?: "default" | "danger";
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  align?: "left" | "right";
}

export function ActionMenu({ items, align = "right" }: ActionMenuProps) {
  const menuId = useId();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        aria-label="Mở danh sách thao tác"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((current) => !current)}
        onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-surface text-muted shadow-sm transition-colors hover:bg-surface-muted hover:text-foreground focus:outline-none focus:ring-4 focus:ring-brand-soft"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0ZM12 10a2 2 0 11-4 0 2 2 0 014 0ZM18 10a2 2 0 11-4 0 2 2 0 014 0Z" />
        </svg>
      </button>

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          className={cn(
            "absolute top-11 z-40 w-52 overflow-hidden rounded-xl border border-border-subtle bg-surface p-1.5 text-left shadow-xl shadow-gray-900/10",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                item.onClick?.();
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full items-center rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                item.variant === "danger"
                  ? "text-danger hover:bg-danger-soft"
                  : "text-foreground hover:bg-surface-muted",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
