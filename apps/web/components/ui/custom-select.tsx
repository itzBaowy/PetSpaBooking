"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export interface CustomSelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: Array<string | CustomSelectOption>;
  defaultValue?: string;
  className?: string;
  onValueChange?: (value: string) => void;
}

export function CustomSelect({
  options,
  defaultValue,
  className,
  onValueChange,
}: CustomSelectProps) {
  const listboxId = useId();
  const normalizedOptions = options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(
    defaultValue ?? normalizedOptions[0]?.value ?? "",
  );
  const selectedLabel =
    normalizedOptions.find((option) => option.value === selectedValue)?.label ??
    selectedValue;

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => setIsOpen((current) => !current)}
        onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 text-left text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-50"
      >
        <span>{selectedLabel}</span>
        <svg
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform",
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

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl shadow-gray-900/10"
        >
          {normalizedOptions.map((option) => {
            const isSelected = option.value === selectedValue;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setSelectedValue(option.value);
                  onValueChange?.(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors",
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
