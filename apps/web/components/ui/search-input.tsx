"use client";

import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: SearchInputProps) {
  return (
    <div
      className={cn(
        "group flex h-11 items-center overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-sm transition-colors focus-within:border-brand focus-within:ring-4 focus-within:ring-brand-soft",
        className,
      )}
    >
      <div className="flex h-full w-11 items-center justify-center text-subtle">
        <svg
          className="h-4.5 w-4.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-full min-w-0 flex-1 border-0 bg-transparent pr-2 text-sm font-medium text-foreground outline-none placeholder:text-subtle"
        placeholder={placeholder}
        type="text"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="mr-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-subtle transition-colors hover:bg-surface-soft hover:text-foreground"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
