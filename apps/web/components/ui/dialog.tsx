"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";

interface DialogProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function Dialog({ title, children, onClose }: DialogProps) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/45 px-4 py-20">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-surface text-foreground shadow-2xl">
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <h2 className="text-lg font-extrabold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-surface-muted hover:text-foreground"
          >
            ×
          </button>
        </div>
        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
