import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ className, variant = "default", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-brand-soft disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-brand text-brand-foreground shadow-sm hover:bg-brand-hover",
        variant === "outline" && "border border-border-muted bg-surface text-foreground hover:bg-surface-muted",
        variant === "ghost" && "text-muted hover:bg-surface-muted hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}
