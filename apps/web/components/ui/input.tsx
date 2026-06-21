import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("h-11 w-full rounded-xl border border-border-muted bg-surface px-3.5 text-sm text-foreground outline-none transition placeholder:text-subtle focus:border-brand focus:ring-4 focus:ring-brand-soft", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("min-h-28 w-full resize-y rounded-xl border border-border-muted bg-surface px-3.5 py-3 text-sm text-foreground outline-none transition placeholder:text-subtle focus:border-brand focus:ring-4 focus:ring-brand-soft", className)} {...props} />;
}
