"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

function SunIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" strokeWidth="2" />
      <path
        strokeLinecap="round"
        strokeWidth="2"
        d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M20.4 15.6A9 9 0 0 1 8.4 3.6a9 9 0 1 0 12 12Z"
      />
    </svg>
  );
}

export function ThemeMenuItem() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  const isDark = mounted && (resolvedTheme ?? theme) === "dark";

  return (
    <button
      type="button"
      disabled={!mounted}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-brand-soft hover:text-brand disabled:cursor-wait"
    >
      <span className="flex items-center gap-2">
        {isDark ? <MoonIcon /> : <SunIcon />}
        <span>Giao diện</span>
      </span>
      <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-muted">
        {mounted ? (isDark ? "Tối" : "Sáng") : "..."}
      </span>
    </button>
  );
}
