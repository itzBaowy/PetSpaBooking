import type { ReactNode } from "react";

export function ProviderRegistrationField({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`block space-y-1.5 text-sm font-semibold text-foreground ${
        className ?? ""
      }`}
    >
      <span>
        {label} {required && <span className="text-danger">*</span>}
      </span>
      {children}
    </div>
  );
}
