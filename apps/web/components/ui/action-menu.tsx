"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 208,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  function updatePosition() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const menuWidth = 208;
    const estimatedHeight = Math.min(items.length * 40 + 12, 320);
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < estimatedHeight && rect.top > spaceBelow;
    const top = openUp
      ? Math.max(8, rect.top - estimatedHeight - 8)
      : rect.bottom + 8;
    const left =
      align === "right"
        ? Math.min(
            window.innerWidth - menuWidth - 8,
            Math.max(8, rect.right - menuWidth),
          )
        : Math.min(
            window.innerWidth - menuWidth - 8,
            Math.max(8, rect.left),
          );

    setPosition({ top, left, width: menuWidth });
  }

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();
    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    document.addEventListener("click", closeOnOutsideClick);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("click", closeOnOutsideClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, align, items.length]);

  return (
    <div className="relative inline-flex">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Mở danh sách thao tác"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => {
          updatePosition();
          setIsOpen((current) => !current);
        }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-surface text-muted shadow-sm transition-colors hover:bg-surface-muted hover:text-foreground focus:outline-none focus:ring-4 focus:ring-brand-soft"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0ZM12 10a2 2 0 11-4 0 2 2 0 014 0ZM18 10a2 2 0 11-4 0 2 2 0 014 0Z" />
        </svg>
      </button>

      {isOpen && mounted && createPortal(
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          style={{
            position: "fixed",
            top: position.top,
            left: position.left,
            width: position.width,
          }}
          className="z-[90] overflow-hidden rounded-xl border border-border-subtle bg-surface p-1.5 text-left shadow-xl shadow-gray-900/10"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onMouseDown={(event) => event.preventDefault()}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
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
        </div>,
        document.body,
      )}
    </div>
  );
}
