"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface CustomSelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: Array<string | CustomSelectOption>;
  defaultValue?: string;
  value?: string;
  placeholder?: string;
  className?: string;
  onValueChange?: (value: string) => void;
}

export function CustomSelect({
  options,
  defaultValue,
  value,
  placeholder = "Chọn một tùy chọn",
  className,
  onValueChange,
}: CustomSelectProps) {
  const listboxId = useId();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const normalizedOptions = options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    left: number;
    top: number;
    width: number;
    maxHeight: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedValue, setSelectedValue] = useState(
    defaultValue ?? normalizedOptions[0]?.value ?? "",
  );
  const currentValue = value ?? selectedValue;
  const selectedLabel = normalizedOptions.find((option) => option.value === currentValue)?.label ?? placeholder;

  const updateMenuPosition = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const viewportPadding = 12;
    const estimatedMenuHeight = Math.min(normalizedOptions.length * 44 + 12, 288);
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
    const spaceAbove = rect.top - viewportPadding;
    const shouldOpenUp = spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow;
    const availableSpace = shouldOpenUp ? spaceAbove : spaceBelow;
    const maxHeight = Math.max(120, Math.min(288, availableSpace));

    setMenuPosition({
      left: rect.left,
      top: shouldOpenUp
        ? Math.max(viewportPadding, rect.top - Math.min(estimatedMenuHeight, maxHeight) - 8)
        : Math.min(window.innerHeight - viewportPadding, rect.bottom + 8),
      width: rect.width,
      maxHeight,
    });
  }, [normalizedOptions.length]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updateMenuPosition();

    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (buttonRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    document.addEventListener("click", closeOnOutsideClick);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
      document.removeEventListener("click", closeOnOutsideClick);
    };
  }, [isOpen, updateMenuPosition]);

  const selectOption = (nextValue: string) => {
    if (value === undefined) setSelectedValue(nextValue);
    onValueChange?.(nextValue);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => {
          updateMenuPosition();
          setIsOpen((current) => !current);
        }}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-border-subtle bg-surface px-4 text-left text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-border-muted focus:outline-none focus:ring-4 focus:ring-brand-soft"
      >
        <span className={currentValue ? "text-foreground" : "text-subtle"}>{selectedLabel}</span>
        <svg
          className={cn(
            "h-4 w-4 text-subtle transition-transform",
            isOpen ? "rotate-180" : "rotate-0",
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && mounted && menuPosition && createPortal(
        <div
          ref={menuRef}
          id={listboxId}
          role="listbox"
          style={{
            left: menuPosition.left,
            top: menuPosition.top,
            width: menuPosition.width,
            maxHeight: menuPosition.maxHeight,
          }}
          className="fixed z-[90] overflow-auto rounded-xl border border-border-subtle bg-surface p-1.5 shadow-xl shadow-gray-900/10"
        >
          {normalizedOptions.map((option) => {
            const isSelected = option.value === currentValue;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  selectOption(option.value);
                }}
                className={cn(
                  "block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors",
                  isSelected
                    ? "bg-brand text-brand-foreground"
                    : "text-muted hover:bg-surface-muted hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      , document.body)}
    </div>
  );
}
